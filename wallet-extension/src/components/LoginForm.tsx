import React, { useState, Dispatch, SetStateAction } from 'react';
import { Eye, EyeOff, Lock, KeyRound, Key } from 'lucide-react';
import SunByteIcon from '../assets/SunByte.svg';
import { WalletData } from '../types/wallet';

interface LoginFormProps {
  onCreateWallet: (password: string) => Promise<WalletData>;
  onImportWallet: (privateKey: string, password: string) => Promise<{ address: string, privateKey?: string }>;
  onBackupComplete: () => void;
  setWalletDetails: Dispatch<SetStateAction<WalletData | null>>;
  isCreatingWallet: boolean;
}

type FormMode = 'create' | 'import';

const LoginForm: React.FC<LoginFormProps> = ({
  onCreateWallet,
  onImportWallet,
  onBackupComplete,
  setWalletDetails,
  isCreatingWallet
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [showBackupInfo, setShowBackupInfo] = useState(false);
  const [mode, setMode] = useState<FormMode>('create');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [walletDetails, setWalletDetailsState] = useState<WalletData | null>(null);

  const validatePrivateKey = (key: string): boolean => {
    const cleanKey = key.startsWith('0x') ? key.slice(2) : key;
    return /^[0-9a-fA-F]{64}$/.test(cleanKey);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (mode === 'import') {
      if (!privateKey.trim()) {
        setError('Private key is required');
        return;
      }
      if (!validatePrivateKey(privateKey)) {
        setError('Invalid private key format. Must be 64 hex characters.');
        return;
      }
    }

    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'create') {
        const wallet = await onCreateWallet(password);
        const details = {
          address: wallet.address,
          mnemonic: wallet.mnemonic || '',
          privateKey: wallet.privateKey
        };
        setWalletDetailsState(details);
        setWalletDetails(details);
        setShowBackupInfo(true);
      } else if (mode === 'import') {
        const result = await onImportWallet(privateKey, password);
        const details = {
          address: result.address,
          mnemonic: '',
          privateKey: result.privateKey || ''
        };
        setWalletDetailsState(details);
        setWalletDetails(details);
        setShowBackupInfo(true);
      }
    } catch (error: any) {
      console.error('Authentication failed:', error);
      if (mode === 'import') {
        setError(error.message || 'Failed to import wallet. Please check your private key.');
      } else {
        setError('Failed to create wallet. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackupComplete = () => {
    setShowBackupInfo(false);
    if (onBackupComplete) {
      onBackupComplete();
    }
  };

  const switchMode = (newMode: FormMode) => {
    setMode(newMode);
    setPassword('');
    setConfirmPassword('');
    setPrivateKey('');
    setError('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowPrivateKey(false);
  };

  const getTitle = () => {
    return mode === 'create' ? 'Create New Wallet' : 'Import Wallet';
  };

  const getDescription = () => {
    return mode === 'create' 
      ? 'Set a secure password for your SunByte wallet'
      : 'Import your existing wallet using private key';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-2 mt-2">
            <img
              src={SunByteIcon}
              alt="SunByte Wallet"
              className="w-36 h-36"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {getTitle()}
          </h1>
          <p className="text-gray-600">
            {getDescription()}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Private Key Input (Import Mode Only) */}
            {mode === 'import' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Private Key
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Key className="w-5 h-5" />
                  </div>
                  <input
                    type={showPrivateKey ? 'text' : 'password'}
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    placeholder="0x... or 64 hex characters"
                    className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all font-mono text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPrivateKey(!showPrivateKey)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
                    disabled={isLoading || isCreatingWallet}
                  >
                    {showPrivateKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Enter your 64-character hexadecimal private key (with or without 0x prefix)
                </p>
              </div>
            )}

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {mode === 'import' ? 'Set Password' : 'Create Password'}
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
                  disabled={isLoading || isCreatingWallet}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
                  disabled={isLoading || isCreatingWallet}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                isLoading ||
                !password.trim() ||
                password !== confirmPassword ||
                (mode === 'import' && !privateKey.trim())
              }
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg mt-6"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {mode === 'create' ? 'Creating Wallet...' : 'Importing Wallet...'}
                </div>
              ) : mode === 'create' ? 'Create Wallet' : 'Import Wallet'}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="text-center">
              <button
                type="button"
                className="text-sm text-gray-600 hover:text-orange-500 focus:outline-none transition-colors font-medium"
                onClick={() => switchMode(mode === 'create' ? 'import' : 'create')}
              >
                {mode === 'create' 
                  ? 'Already have a private key? Import Wallet →' 
                  : '← Create New Wallet Instead'}
              </button>
            </div>
          </div>
        </div>

        {/* Security Note */}
        <p className="text-center text-xs text-gray-500 mt-6">
          🔒 Your wallet is encrypted and stored securely
        </p>
      </div>

      {/* Backup Information Modal */}
      {showBackupInfo && walletDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl">🔐</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Secure Your Wallet</h2>
              <p className="text-sm text-gray-600">
                Save these details in a secure location. Anyone with access can control your funds.
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl">
                <label className="block text-xs font-semibold text-orange-700 mb-1">Wallet Address</label>
                <div className="flex items-center justify-between">
                  <code className="text-xs text-gray-700 break-all flex-1">{walletDetails?.address}</code>
                  <button
                    onClick={() => navigator.clipboard.writeText(walletDetails?.address || '')}
                    className="ml-2 text-orange-500 hover:text-orange-600 transition-colors"
                    title="Copy to clipboard"
                  >
                    📋
                  </button>
                </div>
              </div>

              {walletDetails?.mnemonic && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <label className="block text-xs font-semibold text-amber-700 mb-1">Mnemonic Phrase</label>
                  <div className="flex items-center justify-between">
                    <code className="text-xs text-gray-700 break-all flex-1">{walletDetails?.mnemonic}</code>
                    <button
                      onClick={() => navigator.clipboard.writeText(walletDetails?.mnemonic || '')}
                      className="ml-2 text-amber-500 hover:text-amber-600 transition-colors"
                      title="Copy to clipboard"
                    >
                      📋
                    </button>
                  </div>
                </div>
              )}

              <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl">
                <label className="block text-xs font-semibold text-orange-700 mb-1">Private Key</label>
                <div className="flex items-center justify-between">
                  <code className="text-xs text-gray-700 break-all flex-1">{walletDetails?.privateKey}</code>
                  <button
                    onClick={() => navigator.clipboard.writeText(walletDetails?.privateKey || '')}
                    className="ml-2 text-orange-500 hover:text-orange-600 transition-colors"
                    title="Copy to clipboard"
                  >
                    📋
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowBackupInfo(false);
                  setWalletDetailsState(null);
                  setWalletDetails(null);
                }}
                className="flex-1 px-4 py-3 text-sm text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Close
              </button>
              <button
                onClick={handleBackupComplete}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all font-semibold shadow-md"
              >
                I've Saved It ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginForm;
