"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Fuel } from 'lucide-react';
import { truncateAddress } from '../utils/formatters';

interface VaultHeaderProps {
  walletAddress: string;
  onDisconnect: () => void;
}

const VaultHeader: React.FC<VaultHeaderProps> = ({ walletAddress, onDisconnect }) => {
  return (
    <motion.header
      className="flex justify-between items-center mb-8 py-3"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-3">
        <motion.div
          className="p-2.5 bg-gradient-to-br from-orange-400 via-amber-500 to-orange-600 rounded-xl shadow-md"
          whileHover={{ rotate: 180, scale: 1.05 }}
          transition={{ duration: 0.5 }}
        >
          <Fuel className="w-6 h-6 text-white" />
        </motion.div>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            sunByte Vault
          </h1>
          <p className="text-xs text-gray-500">Gas Tank Protocol</p>
        </div>
      </div>

      <motion.button
        onClick={onDisconnect}
        className="px-5 py-2.5 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl font-medium hover:border-orange-300 hover:shadow-md transition-all duration-300 text-sm text-gray-700 hover:from-orange-50 hover:to-amber-50"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          {truncateAddress(walletAddress)}
        </div>
      </motion.button>
    </motion.header>
  );
};

export default VaultHeader;
