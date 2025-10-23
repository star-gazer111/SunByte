// Import Buffer polyfill first - this must be loaded before any other modules
import './buffer-polyfill';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import { walletService } from './api/walletService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { WalletData, ChromeStorageData } from './types/wallet';
import { WelcomeScreen } from './components/WelcomeScreen';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [balance, setBalance] = useState('0.00');
  const [isLoading, setIsLoading] = useState(true);
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

  const handleLogout = async () => {
    try {
      updateLoginState(false);
      toast.info('Logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Failed to log out');
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading wallet...</p>
        </div>
      </div>
    );
  }

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
    </div>
  );
};

export default App;