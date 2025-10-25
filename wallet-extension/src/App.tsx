import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import { walletService } from './api/walletService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { WalletData, ChromeStorageData, PendingRequest } from './types/wallet';
import { WelcomeScreen } from './components/WelcomeScreen';
import Web3RequestConfirmation from './components/Web3RequestConfirmation';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [balance, setBalance] = useState('0.00');
  const [isLoading, setIsLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<PendingRequest | null>(null);
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [walletDetails, setWalletDetails] = useState<WalletData | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);

  // Store wallet data in chrome.storage
  const storeWalletAddress = useCallback((walletAddress: string) => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set({ walletAddress });
    }
  }, []);

  const updateLoginState = useCallback((isLoggedIn: boolean) => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set({ isLoggedIn });
    }
    setIsLoggedIn(isLoggedIn);
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        if (typeof chrome !== 'undefined' && chrome.storage?.local) {
          const result = await new Promise<ChromeStorageData>((resolve) => {
            chrome.storage.local.get(['walletAddress'], (data) => {
              resolve(data);
              setWalletAddress(data.walletAddress);
            });
          });

          if (result.walletAddress) {
            setIsLoggedIn(true);
            try {
              const balanceData = await walletService.getBalance(result.walletAddress);
              setBalance(balanceData.balance || '0.00');
            } catch (error) {
              console.error('Error fetching balance:', error);
              toast.error('Failed to fetch wallet balance');
            }
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
        toast.error('Failed to check session');
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  // Listen for Web3 requests from background script
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
      const handleMessage = (message: any, sender: any, sendResponse: any) => {
        if (message.type === 'WEB3_REQUEST' && message.requestId) {
          const newRequest: PendingRequest = {
            id: message.requestId,
            type: message.requestType,
            data: message.data,
            timestamp: Date.now()
          };

          setPendingRequests(prev => [...prev, newRequest]);
          setCurrentRequest(newRequest);
          setShowConfirmation(true);

          // Send acknowledgment back to background
          sendResponse({ received: true });
          return true;
        }
      };

      chrome.runtime.onMessage.addListener(handleMessage);
      return () => {
        if (chrome.runtime?.onMessage && typeof chrome.runtime.onMessage.removeListener === 'function') {
          chrome.runtime.onMessage.removeListener(handleMessage);
        }
      };
    }
  }, []);

  // Handle confirmation approval
  const handleConfirmRequest = async (requestPassword?: string) => {
    const passwordToUse = requestPassword || password;
    if (!currentRequest || !passwordToUse) return;

    try {
      setIsProcessing(true);
      let result;

      switch (currentRequest.type) {
        case 'transaction':
          result = await walletService.signAndBroadcast({
            fromAddress: walletAddress,
            password: passwordToUse,
            unsignedTx: currentRequest.data
          });
          break;

        case 'message':
          result = await walletService.signMessage({
            fromAddress: walletAddress,
            password: passwordToUse,
            message: currentRequest.data
          });
          break;

        case 'typedData':
          result = await walletService.signTypedData({
            fromAddress: walletAddress,
            password: passwordToUse,
            typedData: currentRequest.data
          });

          // Update balance if contract interaction occurred
          // Note: contractResult is no longer available since we return only signature
          break;
      }

      // Send success response back to background script
      if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
        chrome.runtime.sendMessage({
          type: 'WEB3_RESPONSE',
          requestId: currentRequest.id,
          success: true,
          result
        });
      }

      // Update balance if it was a transaction
      if (currentRequest.type === 'transaction') {
        const balanceData = await walletService.getBalance(walletAddress);
        setBalance(balanceData.balance || '0.00');
      }

      toast.success(`${currentRequest.type} completed successfully!`);
      handleCloseConfirmation();

    } catch (error) {
      // Send error response back to background script
      if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
        chrome.runtime.sendMessage({
          type: 'WEB3_RESPONSE',
          requestId: currentRequest.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      toast.error(error instanceof Error ? error.message : 'Request failed');
    } finally {
      setIsProcessing(false);
      setPassword('');
    }
  };

  // Handle confirmation rejection
  const handleRejectRequest = () => {
    if (!currentRequest) return;

    // Send rejection response back to background script
    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({
        type: 'WEB3_RESPONSE',
        requestId: currentRequest.id,
        success: false,
        error: 'User rejected the request'
      });
    }

    toast.info('Request rejected');
    handleCloseConfirmation();
  };

  // Close confirmation dialog
  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    setCurrentRequest(null);
    setPassword('');
    setIsProcessing(false);

    // Remove the processed request from pending list
    setPendingRequests(prev => prev.filter(req => req.id !== currentRequest?.id));
  };

  const handleCreateWallet = async (password: string) => {
    try {
      setIsCreatingWallet(true);

      // 1. Create the wallet
      const wallet = await walletService.createWallet({ password });

      // 3. Store wallet data in chrome.storage
      storeWalletAddress(wallet.address);

      // 4. Update UI state but don't set isLoggedIn yet
      setWalletAddress(wallet.address);
      setBalance('0.00');
      updateLoginState(true);

      // 5. Return the wallet details for backup
      return wallet.address;
    } catch (error) {
      console.error('Error creating wallet:', error);

      // Clean up any partial state on error
      updateLoginState(false);
      setWalletAddress('');
      setBalance('0.00');

      const errorMessage = error instanceof Error ? error.message : 'Failed to create wallet';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsCreatingWallet(false);
    }
  };

  const handleBackupComplete = () => {
    // Only set logged in after user confirms backup
    setIsLoggedIn(true);
    toast.success('Wallet created and backed up successfully!');
  };

  const handleImportWallet = async (privateKey: string, password: string) => {
    try {
      setIsLoading(true);

      // Import the wallet using the private key and password
      const wallet = await walletService.importFromPrivateKey({
        privateKey,
        password
      });

      // Store the wallet data
      storeWalletAddress(wallet.address);

      // Update UI state
      setWalletAddress(wallet.address);
      setBalance('0.00');
      updateLoginState(true);

      toast.success('Wallet imported successfully!');
      return {address: wallet.address,privateKey: wallet.privateKey};
    } catch (error) {
      console.error('Error importing wallet:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to import wallet';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTransaction = async (toAddress: string, amount: string) => {
    try {
      setIsLoading(true);

      // Get the current wallet data
      const result = await new Promise<ChromeStorageData>((resolve) => {
        chrome.storage.local.get(['walletAddress'], (data) => {
          resolve(data as ChromeStorageData);
        });
      });

      if (!result.walletAddress) {
        throw new Error('No wallet found');
      }

      // Prepare the transaction
      const { unsignedTx } = await walletService.prepareTransaction({
        fromAddress: result.walletAddress,
        toAddress,
        amount
      });

      // Prompt for password to sign the transaction
      const password = prompt('Enter your password to confirm the transaction:');
      if (!password) {
        throw new Error('Transaction cancelled by user');
      }

      // Sign and broadcast the transaction
      const txResult = await walletService.signAndBroadcast({
        fromAddress: result.walletAddress,
        password,
        unsignedTx
      });

      toast.success(`Transaction sent! Hash: ${txResult.txHash}`);

      // Update balance after successful transaction
      const balanceData = await walletService.getBalance(result.walletAddress);
      setBalance(balanceData.balance || '0.00');

    } catch (error) {
      console.error('Error sending transaction:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send transaction';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      updateLoginState(false);
      toast.info('Logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Failed to log out');
    }
  };

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      
      <AnimatePresence mode="wait">
        {showWelcome ? (
          <WelcomeScreen onComplete={handleWelcomeComplete} />
        ) : isLoggedIn ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <Dashboard
              walletAddress={walletAddress}
              balance={balance}
              onLogout={handleLogout}
              onSendTransaction={handleSendTransaction}
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <LoginForm 
              onCreateWallet={handleCreateWallet}
              onBackupComplete={handleBackupComplete}
              setWalletDetails={setWalletDetails}
              isCreatingWallet={isCreatingWallet} 
              onImportWallet={handleImportWallet}       
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Web3 Request Confirmation Dialog */}
      <Web3RequestConfirmation
        request={currentRequest}
        isOpen={showConfirmation}
        onClose={handleCloseConfirmation}
        onApprove={handleConfirmRequest}
        onReject={handleRejectRequest}
        isProcessing={isProcessing}
        walletAddress={walletAddress}
        password={password}
        onPasswordChange={setPassword}
      />
    </div>
  );
};

export default App;