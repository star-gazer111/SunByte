import React, { useState } from 'react';
import type {
  TransferParams,
  TransferResult,
  SimulationResult,
} from '@avail-project/nexus-core';
import { getSDK, isInitialized } from '../api/nexus';

interface SmartTransferButtonProps {
  className?: string;
  token?: string;
  amount?: number;
  chainId?: number; // Destination chain ID
  sourceChains?: number[]; // Source chains list
  recipient: string;
  onResult?: (r: TransferResult | SimulationResult) => void;
}

const SmartTransferButton: React.FC<SmartTransferButtonProps> = ({
  className = '',
  token = 'USDC',
  amount = 1,
  chainId = 1,
  sourceChains = [],
  recipient,
  onResult,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);

  const handleTransfer = async () => {
    if (!isInitialized()) {
      alert('Please connect your wallet to Nexus first using the "Connect to Nexus" button above.');
      return;
    }
    if (!recipient) {
      alert('Recipient address is required.');
      return;
    }

    try {
      setIsLoading(true);

      // Simulate the transfer to preview route & costs
      const sim = await getSDK().simulateTransfer({
        token,
        amount,
        chainId,
        sourceChains,
        recipient,
      } as TransferParams);

      setSimulation(sim);
      console.log('Simulation result:', sim);

      const userConfirmed = window.confirm(
        `Simulated Fees: ${sim.intent.fees.total}\nProceed with transfer?`
      );

      if (!userConfirmed) return;

      // Execute transfer
      const result = await getSDK().transfer({
        token,
        amount,
        chainId,
        sourceChains,
        recipient,
      } as TransferParams);

      console.log('Transfer result:', result);
      onResult?.(result);
      alert('Transfer completed successfully!');
    } catch (err) {
      console.error('Transfer failed:', err);
      alert(`Transfer failed: ${String(err)}. The Nexus SDK may not be fully compatible with this environment.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className={`px-4 py-2 rounded-lg font-medium transition-all ${
        isLoading || !isInitialized()
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-green-600 hover:bg-green-700 text-white'
      } ${className}`}
      onClick={handleTransfer}
      disabled={!isInitialized() || isLoading}
    >
      {isLoading
        ? 'Processing...'
        : simulation
        ? 'Confirm & Send'
        : 'Smart Transfer'}
    </button>
  );
};

export default SmartTransferButton;
