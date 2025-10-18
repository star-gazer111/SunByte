import React, { useState } from 'react';
import { getUnifiedBalances, isInitialized } from '../api/nexus';

interface FetchUnifiedBalanceButtonProps {
  className?: string;
  onResult?: (r: any) => void;
}

const FetchUnifiedBalanceButton: React.FC<FetchUnifiedBalanceButtonProps> = ({
  className = '',
  onResult,
}) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!isInitialized()) {
      alert('Please initialize Nexus first.');
      return;
    }

    try {
      setLoading(true);
      const res = await getUnifiedBalances();
      onResult?.(res);
      console.log('Unified balances:', res);
      alert('Unified balances fetched successfully!');
    } catch (err: any) {
      console.error('Failed to fetch balances:', err);
      alert(err?.message ?? 'Failed to fetch unified balances.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!isInitialized() || loading}
      className={`px-4 py-2 rounded-lg font-medium transition-all ${
        !isInitialized() || loading
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-purple-600 hover:bg-purple-700 text-white'
      } ${className}`}
    >
      {loading ? 'Fetching...' : 'Fetch Unified Balances'}
    </button>
  );
};

export default FetchUnifiedBalanceButton;
