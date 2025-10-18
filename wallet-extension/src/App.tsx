import React, { useState, useEffect, useCallback } from 'react';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import { walletService } from './api/walletService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { WalletData, ChromeStorageData } from './types/wallet';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [balance, setBalance] = useState('0.00');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [walletDetails, setWalletDetails] = useState<WalletData | null>(null);

  // Store wallet data in chrome.storage
  const storeWalletData = useCallback((walletData: WalletData) => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set({ walletData });
    }
  }, []);

  // Clear wallet data from chrome.storage
  const clearWalletData = useCallback(() => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.remove(['walletData']);
    }
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        if (typeof chrome !== 'undefined' && chrome.storage?.local) {
          const result = await new Promise<ChromeStorageData>((resolve) => {
            chrome.storage.local.get(['walletData'], (data) => {
              resolve(data);
            });
          });
          
          if (result.walletData) {
            setIsLoggedIn(true);
            try {
              const balanceData = await walletService.getBalance(result.walletData.address);
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
      
      // 2. Create wallet data object
      const walletData = {
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic
      };
      
      // 3. Store wallet data in chrome.storage
      storeWalletData(walletData);
      
      // 4. Update UI state but don't set isLoggedIn yet
      setWalletAddress(wallet.address);
      setBalance('0.00');
      
      // 5. Return the wallet details for backup
      return walletData;
    } catch (error) {
      console.error('Error creating wallet:', error);
      
      // Clean up any partial state on error
      setIsLoggedIn(false);
      setWalletAddress('');
      setBalance('0.00');
      await clearWalletData();
      
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
      
      // Create wallet data object
      const walletData = {
        address: wallet.address,
        privateKey: wallet.privateKey
        // Note: No mnemonic when importing by private key
      };
      
      // Store the wallet data
      storeWalletData(walletData);
      
      // Update UI state
      setWalletAddress(wallet.address);
      setBalance('0.00');
      setIsLoggedIn(true);
      
      toast.success('Wallet imported successfully!');
    } catch (error) {
      console.error('Error importing wallet:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to import wallet';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (password: string) => {
    try {
      setIsLoading(true);
      
      // Get the stored wallet data
      const result = await new Promise<ChromeStorageData>((resolve) => {
        chrome.storage.local.get(['walletData'], (data) => {
          resolve(data as ChromeStorageData);
        });
      });

      if (!result.walletData) {
        throw new Error('No wallet found. Please create a new wallet.');
      }

      // In a real app, you would verify the password here
      // For now, we'll assume the password is correct if we have wallet data
      setWalletAddress(result.walletData.address);
      setIsLoggedIn(true);
      
      try {
        const balanceData = await walletService.getBalance(result.walletData.address);
        setBalance(balanceData.balance || '0.00');
        toast.success('Successfully logged in!');
      } catch (error) {
        console.error('Error fetching balance:', error);
        toast.error('Failed to fetch wallet balance');
      }
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await clearWalletData();
      setIsLoggedIn(false);
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
        chrome.storage.local.get(['walletData'], (data) => {
          resolve(data as ChromeStorageData);
        });
      });

      if (!result.walletData) {
        throw new Error('No wallet found');
      }

      // Prepare the transaction
      const { unsignedTx } = await walletService.prepareTransaction({
        fromAddress: result.walletData.address,
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
        fromAddress: result.walletData.address,
        password,
        unsignedTx
      });
      
      toast.success(`Transaction sent! Hash: ${txResult.txHash}`);
      
      // Update balance after successful transaction
      const balanceData = await walletService.getBalance(result.walletData.address);
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

  return (
    <div className="min-h-screen bg-gray-900 text-white">
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
      
      {isLoggedIn ? (
        <Dashboard
          walletAddress={walletAddress}
          balance={balance}
          onLogout={handleLogout}
          onSendTransaction={handleSendTransaction}
        />
      ) : (
        <LoginForm 
          onLogin = {handleLogin}
          onCreateWallet={handleCreateWallet}
          onBackupComplete={handleBackupComplete}
          setWalletDetails={setWalletDetails}
          isCreatingWallet={isCreatingWallet}
        />
      )}
    </div>
  );
};

export default App;