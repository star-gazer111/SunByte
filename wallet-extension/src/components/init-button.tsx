import React, { useState } from 'react';
import { initializeWithProvider, isInitialized } from '../api/nexus';

interface InitButtonProps {
  className?: string;
  onReady?: () => void;
}

const InitButton: React.FC<InitButtonProps> = ({ className = '', onReady }) => {
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(isInitialized());

  const handleClick = async () => {
    const eth = (window as any)?.ethereum;
    if (!eth) {
      alert('MetaMask or another Ethereum provider is not detected.');
      return;
    }

    try {
      setLoading(true);
      await initializeWithProvider(eth);
      setInitialized(true);
      onReady?.();
      alert('Nexus initialized successfully!');
    } catch (err: any) {
      console.error(err);
      alert(err?.message ?? 'Initialization failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading || initialized}
      className={`px-4 py-2 rounded-lg font-medium transition-all ${
        initialized
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-blue-600 hover:bg-blue-700 text-white'
      } ${className}`}
    >
      {loading ? 'Initializing...' : initialized ? 'Nexus Initialized' : 'Initialize Nexus'}
    </button>
  );
};

export default InitButton;
