"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Sparkles } from 'lucide-react';
import { fadeInUp, staggerContainer, scaleIn } from '../constants/animations';
import { Chain } from '../constants/chains';
import { Token } from '../constants/tokens';

interface DepositCardProps {
  chains: Chain[];
  tokens: Token[];
  selectedToken: string;
  selectedChain: number;
  amount: string;
  onTokenChange: (token: string) => void;
  onChainChange: (chain: number) => void;
  onAmountChange: (amount: string) => void;
  onDeposit: () => void;
}

const DepositCard: React.FC<DepositCardProps> = ({
  chains,
  tokens,
  selectedToken,
  selectedChain,
  amount,
  onTokenChange,
  onChainChange,
  onAmountChange,
  onDeposit
}) => {
  return (
    <motion.div
      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
      initial="hidden"
      animate="visible"
      variants={scaleIn}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-orange-50 rounded-xl">
          <Zap className="w-5 h-5 text-orange-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800">Deposit Assets</h2>
      </div>

      <motion.div
        className="space-y-5"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Chain Selection */}
        <motion.div variants={fadeInUp}>
          <label className="block text-sm text-gray-600 mb-2 font-medium">Chain</label>
          <select
            value={selectedChain}
            onChange={(e) => onChainChange(Number(e.target.value))}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all cursor-pointer text-gray-700"
          >
            {chains.map(chain => (
              <option key={chain.id} value={chain.id}>
                {chain.name}
              </option>
            ))}
          </select>
        </motion.div>

        {/* Token Selection */}
        <motion.div variants={fadeInUp}>
          <label className="block text-sm text-gray-600 mb-2 font-medium">Token</label>
          <select
            value={selectedToken}
            onChange={(e) => onTokenChange(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all cursor-pointer text-gray-700"
          >
            {tokens.map(token => (
              <option key={token.symbol} value={token.symbol}>
                {token.icon} {token.name} - ${token.price.toLocaleString()}
              </option>
            ))}
          </select>
        </motion.div>

        {/* Amount Input */}
        <motion.div variants={fadeInUp}>
          <label className="block text-sm text-gray-600 mb-2 font-medium">Amount</label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all pr-16 text-gray-700"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
              {selectedToken}
            </div>
          </div>
        </motion.div>

        {/* Deposit Button */}
        <motion.button
          onClick={onDeposit}
          className="w-full py-3.5 bg-gradient-to-r from-orange-400 via-amber-500 to-orange-600 rounded-xl font-semibold text-white flex items-center justify-center gap-2 shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 transition-all duration-300 hover:scale-[1.02] border border-orange-300/30"
          variants={fadeInUp}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Sparkles className="w-4 h-4" />
          Deposit to Vault
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default DepositCard;
