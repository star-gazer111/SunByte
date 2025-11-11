"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet } from 'lucide-react';
import { fadeInUp, staggerContainer } from '../constants/animations';

interface HoldingsCardProps {
  depositsByToken: { [key: string]: number };
  tokens: any[];
  model: any;
}

const HoldingsCard: React.FC<HoldingsCardProps> = ({ depositsByToken, tokens, model }) => {
  return (
    <motion.div
      className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <h3 className="text-lg font-semibold mb-5 flex items-center gap-2 text-gray-800">
        <div className="w-1 h-6 bg-gradient-to-b from-orange-400 via-amber-500 to-orange-600 rounded-full" />
        Holdings
      </h3>

      <AnimatePresence mode="wait">
        {Object.keys(depositsByToken).length === 0 ? (
          <motion.div
            className="text-center py-10 text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Wallet className="w-8 h-8 opacity-50" />
            </div>
            <p className="text-sm">No deposits yet</p>
            <p className="text-xs text-gray-400 mt-1">Start by depositing tokens</p>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-3"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {Object.entries(depositsByToken).map(([token, amount]) => {
              const price = model.getTokenPrice(token);
              const value = amount * price;
              const tokenInfo = tokens.find(t => t.symbol === token);
              return (
                <motion.div
                  key={token}
                  className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all"
                  variants={fadeInUp}
                  whileHover={{ x: 4 }}
                  layout
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 via-amber-500 to-orange-600 rounded-xl flex items-center justify-center text-white text-xl shadow-sm">
                        {tokenInfo?.icon}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{token}</div>
                        <div className="text-xs text-gray-500">
                          {amount.toFixed(4)} tokens
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-orange-600">
                        ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs text-gray-500">
                        @ ${price.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default HoldingsCard;
