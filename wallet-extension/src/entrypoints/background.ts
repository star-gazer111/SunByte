import { defineBackground } from '#imports';

export default defineBackground(() => {
  // Handle messages from content script and injected script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Handle the message synchronously
    handleMessage(message, sender, sendResponse);

    // Return true to keep the message channel open for async responses
    return true;
  });

  // Handle extension installation
  chrome.runtime.onInstalled.addListener(() => {
  });
});

async function handleMessage(message: any, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) {
  try {
    switch (message.type) {
      case 'SUNBYTE_REQUEST':
        await handleWeb3Request(message, sender, sendResponse);
        break;

      case 'SUNBYTE_CHECK_CONNECTION':
        await handleConnectionCheck(sendResponse);
        break;

      default:
        sendResponse({ error: 'Unknown message type' });
    }
  } catch (error) {
    sendResponse({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
}

async function handleConnectionCheck(sendResponse: (response: any) => void) {
  try {
    // Check if wallet is available in storage
    const result = await chrome.storage.local.get(['walletAddress', 'isLoggedIn']);

    sendResponse({
      connected: !!(result.isLoggedIn && result.walletAddress),
      chainId: '0x1', // Default to mainnet
    });
  } catch (error) {
    sendResponse({
      connected: false,
      chainId: '0x1',
    });
  }
}

async function handleWeb3Request(message: any, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) {
  const { method, params = [], requestId } = message;

  try {
    let result;

    switch (method) {
      case 'eth_requestAccounts':
        result = await handleRequestAccounts();
        break;

      case 'eth_accounts':
        result = await handleGetAccounts();
        break;

      case 'eth_getBalance':
        result = await handleGetBalance(params);
        break;

      case 'eth_sendTransaction':
        result = await handleSendTransaction(params);
        break;

      case 'eth_signTransaction':
        result = await handleSignTransaction(params);
        break;

      case 'personal_sign':
        result = await handlePersonalSign(params);
        break;

      case 'eth_signTypedData':
        result = await handleSignTypedData(params);
        break;

      case 'wallet_switchEthereumChain':
        result = await handleSwitchChain(params);
        break;

      case 'wallet_addEthereumChain':
        result = await handleAddChain(params);
        break;

      case 'sunbyte_checkConnection':
        result = await handleConnectionCheckHelper();
        break;

      default:
        throw new Error(`Unsupported method: ${method}`);
    }

    sendResponse({
      type: 'SUNBYTE_RESPONSE',
      requestId,
      result,
    });

  } catch (error) {
    sendResponse({
      type: 'SUNBYTE_RESPONSE',
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

async function handleConnectionCheckHelper() {
  const result = await chrome.storage.local.get(['walletAddress', 'isLoggedIn']);
  return {
    connected: !!(result.isLoggedIn && result.walletAddress),
    chainId: '0x1',
  };
}

async function handleRequestAccounts() {
  const result = await chrome.storage.local.get(['walletAddress', 'isLoggedIn']);

  if (!result.walletAddress) {
    // Try to open the extension popup
    try {
      await chrome.action.openPopup();
    } catch (error) {
      // Fallback: Create a notification to guide the user
      try {
        await chrome.notifications.create('wallet-connection', {
          type: 'basic',
          iconUrl: 'assets/SunByte-B10GhH0q.svg',
          title: 'SunByte Wallet',
          message: 'Please click the SunByte Wallet extension icon to create a wallet first.',
          priority: 2
        });
      } catch (notificationError) {
        // Silent fallback
      }
    }

    throw new Error('Please create a wallet first');
  }

  if (!result.isLoggedIn) {
    // Try to open the extension popup for login
    try {
      await chrome.action.openPopup();
    } catch (error) {
      // Fallback: Create a notification
      try {
        await chrome.notifications.create('wallet-login', {
          type: 'basic',
          iconUrl: 'assets/SunByte-B10GhH0q.svg',
          title: 'SunByte Wallet',
          message: 'Please click the SunByte Wallet extension icon to unlock your wallet.',
          priority: 2
        });
      } catch (notificationError) {
        // Silent fallback
      }
    }

    throw new Error('Please unlock your wallet');
  }

  return [result.walletAddress];
}

async function handleGetAccounts() {
  const result = await chrome.storage.local.get(['walletAddress', 'isLoggedIn']);

  if (!result.isLoggedIn || !result.walletAddress) {
    return [];
  }

  return [result.walletAddress];
}

async function handleGetBalance(params: any[]) {
  const [address, blockTag] = params;

  try {
    const response = await fetch(`http://localhost:8080/wallet/${address}/balance`);
    if (!response.ok) {
      throw new Error('Failed to fetch balance');
    }
    const balanceData = await response.json();
    return balanceData.balance || '0x0';
  } catch (error) {
    return '0x0';
  }
}

async function handleSendTransaction(params: any[]) {
  const [transaction] = params;

  try {
    const result = await chrome.storage.local.get(['walletAddress']);

    if (!result.walletAddress) {
      throw new Error('No wallet found');
    }

    const response = await fetch('http://localhost:8080/wallet/prepare-transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fromAddress: result.walletAddress,
        toAddress: transaction.to,
        amount: transaction.value || '0x0',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to prepare transaction');
    }

    const { unsignedTx } = await response.json();

    // For now, we'll need user confirmation through the popup
    // In a full implementation, this would open a confirmation dialog
    throw new Error('Transaction requires user confirmation through wallet popup');

  } catch (error) {
    throw error;
  }
}

async function handleSignTransaction(params: any[]) {
  throw new Error('Sign transaction not implemented yet');
}

async function handlePersonalSign(params: any[]) {
  throw new Error('Personal sign not implemented yet');
}

async function handleSignTypedData(params: any[]) {
  throw new Error('Sign typed data not implemented yet');
}

async function handleSwitchChain(params: any[]) {
  // For now, just return null (success)
  return null;
}

async function handleAddChain(params: any[]) {
  // For now, just return null (success)
  return null;
}
