import { useState } from 'react';
import type { BridgeParams, BridgeResult, SimulationResult } from '@avail-project/nexus-core';
import { sdk, isInitialized } from '../api/nexus';

export default function BridgeButton({
  className,
  token = 'USDC',
  amount = 1,
  destinationChainId = 42161, 
  sourceChains,
  onResult,
}: {
  className?: string;
  token?: string;
  amount?: number;
  destinationChainId?: number;
  sourceChains?: number[];
  onResult?: (r: BridgeResult | SimulationResult) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);

  const handleBridge = async () => {
    if (!isInitialized()) return alert('Initialize the SDK first.');

    try {
      setIsLoading(true);

      // Simulating the bridge
      const sim = await sdk.simulateBridge({
        token,
        amount,
        chainId: destinationChainId,
        sourceChains,
      } as BridgeParams);

      console.log('Simulation result:', sim);
      setSimulation(sim);

      const confirmBridge = window.confirm(
        `Estimated total fees: ${sim.intent.fees.total}\nProceed with bridging ${amount} ${token}?`
      );
      if (!confirmBridge) return;


      const result = await sdk.bridge({
        token,
        amount,
        chainId: destinationChainId,
        sourceChains,
      } as BridgeParams);

      console.log('Bridge result:', result);
      onResult?.(result);

      if (result.success) {
        alert(`Bridge successful! View on explorer:\n${result.explorerUrl}`);
      } else {
        alert(`Bridge failed: ${result.error}`);
      }
    } catch (err) {
      console.error('Bridge error:', err);
      alert(`Bridge failed: ${String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className={`px-4 py-2 rounded-xl font-medium shadow-md transition-colors ${
        isLoading
          ? 'bg-gray-400 text-white cursor-not-allowed'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      } ${className || ''}`}
      onClick={handleBridge}
      disabled={!isInitialized() || isLoading}
    >
      {isLoading
        ? 'Processing...'
        : simulation
        ? 'Confirm & Bridge'
        : 'Bridge Tokens'}
    </button>
  );
}
