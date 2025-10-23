"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowUpRight } from 'lucide-react';
import { scaleIn } from '../constants/animations';
import VaultHeader from './VaultHeader';
import DepositCard from './DepositCard';
import HoldingsCard from './HoldingsCard';
import VaultModel from '../models/vaultModel';
import VaultController from '../controllers/vaultController';

interface VaultDashboardProps {
  model: VaultModel;
  controller: VaultController;
}

const VaultDashboard: React.FC<VaultDashboardProps> = ({ model, controller }) => {
  const [selectedToken, setSelectedToken] = useState('ETH');
  const [selectedChain, setSelectedChain] = useState(1);
  const [amount, setAmount] = useState('');

  const handleDeposit = () => {
    controller.deposit(selectedToken, amount, selectedChain);
    setAmount('');
  };

  const totalValue = model.getTotalValue();
  const depositsByToken = model.getDepositsByToken();

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <VaultHeader
          walletAddress={model.wallet!}
          onDisconnect={() => controller.disconnectWallet()}
        />

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Deposit Card */}
          <DepositCard
            chains={model.chains}
            tokens={model.tokens}
            selectedToken={selectedToken}
            selectedChain={selectedChain}
            amount={amount}
            onTokenChange={setSelectedToken}
            onChainChange={setSelectedChain}
            onAmountChange={setAmount}
            onDeposit={handleDeposit}
          />

          {/* Stats Card */}
          <motion.div
            className="space-y-6"
            initial="hidden"
            animate="visible"
          >
            {/* Total Value */}
            <motion.div
              className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100 shadow-lg"
              variants={scaleIn}
              whileHover={{ borderColor: "rgb(251 146 60)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-600 text-sm font-medium">Total Value</span>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <motion.div
                className="text-5xl font-bold mb-2 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent"
                key={totalValue}
                initial={{ scale: 1.05 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                ${totalValue.toFixed(2)}
              </motion.div>
              <div className="text-green-500 text-sm flex items-center gap-1 font-medium">
                <ArrowUpRight className="w-4 h-4" />
                <span>Secured in vault</span>
              </div>
            </motion.div>

            {/* Holdings */}
            <HoldingsCard
              depositsByToken={depositsByToken}
              tokens={model.tokens}
              model={model}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default VaultDashboard;
