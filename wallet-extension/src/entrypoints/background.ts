import { defineBackground } from '#imports';

export default defineBackground(() => {
  // Store pending requests that need user confirmation
  const pendingRequests = new Map();

  // Handle messages from content script and injected script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    handleMessage(message, sender, sendResponse, pendingRequests);
    return true;
  });

  // Handle extension installation
  chrome.runtime.onInstalled.addListener(() => {
  });
});

async function handleMessage(message: any, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void, pendingRequests: Map<string, any>) {
  try {
    switch (message.type) {
      case 'SUNBYTE_REQUEST':
        await handleWeb3Request(message, sender, sendResponse, pendingRequests);
        break;

      case 'WEB3_RESPONSE':
        handleWeb3Response(message, pendingRequests);
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

function handleWeb3Response(message: any, pendingRequests: Map<string, any>) {
  const { requestId, success, result, error } = message;

  const pendingRequest = pendingRequests.get(requestId);
  if (pendingRequest) {
    pendingRequests.delete(requestId);

    if (success) {
      pendingRequest.resolve(result);
    } else {
      pendingRequest.reject(new Error(error || 'Request failed'));
    }
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

async function handleWeb3Request(message: any, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void, pendingRequests: Map<string, any>) {
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
        result = await handleSendTransaction(params, pendingRequests, requestId);
        break;

      case 'eth_signTransaction':
        result = await handleSignTransaction(params, pendingRequests, requestId);
        break;

      case 'eth_sign':
        result = await handlePersonalSign(params, pendingRequests, requestId);
        break;

      case 'eth_signTypedData':
        result = await handleSignTypedData(params, pendingRequests, requestId);
        break;

      case 'eth_signTypedData_v4':
        result = await handleSignTypedData(params, pendingRequests, requestId);
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

async function handleSendTransaction(params: any[], pendingRequests: Map<string, any>, requestId: string) {
  const [transaction] = params;

  try {
    const result = await chrome.storage.local.get(['walletAddress']);

    if (!result.walletAddress) {
      throw new Error('No wallet found');
    }

    // Call backend to prepare transaction
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
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to prepare transaction');
    }

    const { unsignedTx } = await response.json();

    // Open the extension popup for user confirmation and password input
    try {
      await chrome.action.openPopup();

      // Send the request details to the popup
      if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
        chrome.runtime.sendMessage({
          type: 'WEB3_REQUEST',
          requestType: 'transaction',
          requestId: requestId,
          data: transaction
        });
      }
    } catch (error) {
      // Fallback: Create a notification
      try {
        await chrome.notifications.create('transaction-sign', {
          type: 'basic',
          iconUrl: 'assets/SunByte-B10GhH0q.svg',
          title: 'SunByte Wallet',
          message: 'Please click the SunByte Wallet extension icon to confirm the transaction.',
          priority: 2
        });
      } catch (notificationError) {
        // Silent fallback
      }
    }

    // Create a promise that will be resolved by the popup response
    return new Promise((resolve, reject) => {
      pendingRequests.set(requestId, { resolve, reject });
    });

  } catch (error) {
    throw error;
  }
}

async function handleSignTransaction(params: any[], pendingRequests: Map<string, any>, requestId: string) {
  const [transaction] = params;

  try {
    const result = await chrome.storage.local.get(['walletAddress']);

    if (!result.walletAddress) {
      throw new Error('No wallet found');
    }

    // Call backend to prepare transaction
    const prepareResponse = await fetch('http://localhost:8080/wallet/prepare-transaction', {
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

    if (!prepareResponse.ok) {
      const errorData = await prepareResponse.json();
      throw new Error(errorData.error || 'Failed to prepare transaction');
    }

    const { unsignedTx } = await prepareResponse.json();

    // Open the extension popup for user confirmation and password input
    try {
      await chrome.action.openPopup();
    } catch (error) {
      // Fallback: Create a notification
      try {
        await chrome.notifications.create('transaction-sign', {
          type: 'basic',
          iconUrl: 'assets/SunByte-B10GhH0q.svg',
          title: 'SunByte Wallet',
          message: 'Please click the SunByte Wallet extension icon to confirm the transaction.',
          priority: 2
        });
      } catch (notificationError) {
        // Silent fallback
      }
    }

    // Create a promise that will be resolved by the popup response
    return new Promise((resolve, reject) => {
      pendingRequests.set(requestId, { resolve, reject });
    });

  } catch (error) {
    throw error;
  }
}

async function handlePersonalSign(params: any[], pendingRequests: Map<string, any>, requestId: string) {
  const [message, account] = params;

  try {
    const result = await chrome.storage.local.get(['walletAddress']);

    if (!result.walletAddress) {
      throw new Error('No wallet found');
    }

    // Validate that the account matches the wallet
    if (account && account.toLowerCase() !== result.walletAddress.toLowerCase()) {
      throw new Error('Account mismatch');
    }

    // Open the extension popup for user confirmation and password input
    try {
      await chrome.action.openPopup();

      // Send the request details to the popup
      if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
        chrome.runtime.sendMessage({
          type: 'WEB3_REQUEST',
          requestType: 'message',
          requestId: requestId,
          data: message
        });
      }
    } catch (error) {
      // Fallback: Create a notification
      try {
        await chrome.notifications.create('message-sign', {
          type: 'basic',
          iconUrl: 'assets/SunByte-B10GhH0q.svg',
          title: 'SunByte Wallet',
          message: 'Please click the SunByte Wallet extension icon to sign the message.',
          priority: 2
        });
      } catch (notificationError) {
        // Silent fallback
      }
    }

    // Create a promise that will be resolved by the popup response
    return new Promise((resolve, reject) => {
      pendingRequests.set(requestId, { resolve, reject });
    });

  } catch (error) {
    throw error;
  }
}

async function handleSignTypedData(params: any[], pendingRequests: Map<string, any>, requestId: string) {
  const [account, typedData] = params;

  try {
    const result = await chrome.storage.local.get(['walletAddress']);

    if (!result.walletAddress) {
      throw new Error('No wallet found');
    }

    // Validate that the account matches the wallet
    if (account && account.toLowerCase() !== result.walletAddress.toLowerCase()) {
      throw new Error('Account mismatch');
    }

    // Open the extension popup for user confirmation and password input
    try {
      await chrome.action.openPopup();

      // Send the request details to the popup
      if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
        chrome.runtime.sendMessage({
          type: 'WEB3_REQUEST',
          requestType: 'typedData',
          requestId: requestId,
          data: typedData
        });
      }
    } catch (error) {
      // Fallback: Create a notification
      try {
        await chrome.notifications.create('typed-data-sign', {
          type: 'basic',
          iconUrl: 'assets/SunByte-B10GhH0q.svg',
          title: 'SunByte Wallet',
          message: 'Please click the SunByte Wallet extension icon to sign the typed data.',
          priority: 2
        });
      } catch (notificationError) {
        // Silent fallback
      }
    }

    // Create a promise that will be resolved by the popup response
    return new Promise((resolve, reject) => {
      pendingRequests.set(requestId, { resolve, reject });
    });

  } catch (error) {
    throw error;
  }
}

async function handleSwitchChain(params: any[]) {
  // For now, just return null (success)
  return null;
}

async function handleAddChain(params: any[]) {
  // For now, just return null (success)
  return null;
}
