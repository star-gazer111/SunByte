import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import InitButton from '../components/init-button';
import SmartTransferButton from '../components/transfer';
import { isInitialized } from '../api/nexus';

interface SendPageProps {
  setCurrentPage: (page: string) => void;
}

export const SendPage = ({ setCurrentPage }: SendPageProps) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [token, setToken] = useState('USDC');
  const [chainId, setChainId] = useState(1);

  const handleTransferResult = (result: any) => {
    console.log('Transfer completed:', result);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="max-w-md mx-auto">
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-4 rounded-b-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentPage('home')}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold">Send</h2>
            <div className="w-9"></div>
          </div>
        </div>
        <div className="p-6">
          <div className="bg-white rounded-2xl p-6 shadow-md mb-4">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Connect Your Wallet to Nexus</h3>
            <p className="text-gray-600 mb-4">Use your existing wallet with Nexus cross-chain transfers</p>
            <InitButton className="w-full" />
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Send Tokens</h3>
            <p className="text-gray-600 mb-6">Transfer crypto across chains using Nexus</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Address
                </label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="1.0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Token
                  </label>
                  <select
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="USDC">USDC</option>
                    <option value="USDT">USDT</option>
                    <option value="WETH">WETH</option>
                    <option value="WBTC">WBTC</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destination Chain
                </label>
                <select
                  value={chainId}
                  onChange={(e) => setChainId(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value={1}>Ethereum</option>
                  <option value={42161}>Arbitrum</option>
                  <option value={10}>Optimism</option>
                  <option value={137}>Polygon</option>
                  <option value={43114}>Avalanche</option>
                </select>
              </div>

              <SmartTransferButton
                className="w-full py-3 text-lg"
                recipient={recipient}
                amount={amount ? Number(amount) : 0}
                token={token}
                chainId={chainId}
                onResult={handleTransferResult}
              />

              <div className="bg-orange-50 rounded-xl p-4 text-orange-700">
                <p className="text-sm">💡 Your wallet will be used as the provider for Nexus cross-chain transfers. No external wallet required!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
