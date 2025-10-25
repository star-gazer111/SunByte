import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, XCircle, ArrowRight, Shield, Clock } from 'lucide-react';
import SunByteIcon from '../assets/SunByte.svg';

interface Web3Request {
  id: string;
  type: 'transaction' | 'message' | 'typedData';
  data: any;
  timestamp: number;
}

interface Web3RequestConfirmationProps {
  request: Web3Request | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (password: string) => Promise<void>;
  onReject: () => void;
  isProcessing: boolean;
  walletAddress: string;
  password: string;
  onPasswordChange: (password: string) => void;
}

const Web3RequestConfirmation: React.FC<Web3RequestConfirmationProps> = ({
  request,
  isOpen,
  onClose,
  onApprove,
  onReject,
  isProcessing,
  walletAddress,
  password,
  onPasswordChange,
}) => {
  if (!isOpen || !request) return null;

  const getRequestTitle = () => {
    switch (request.type) {
      case 'transaction': return 'Confirm Transaction';
      case 'message': return 'Sign Message';
      case 'typedData': return 'Sign Typed Data';
      default: return 'Confirm Request';
    }
  };

  const getRequestIcon = () => {
    switch (request.type) {
      case 'transaction': return <ArrowRight className="w-6 h-6" />;
      case 'message': return <Shield className="w-6 h-6" />;
      case 'typedData': return <Shield className="w-6 h-6" />;
      default: return <AlertTriangle className="w-6 h-6" />;
    }
  };

  const getRequestColor = () => {
    switch (request.type) {
      case 'transaction': return 'from-orange-500 to-amber-500';
      case 'message': return 'from-blue-500 to-cyan-500';
      case 'typedData': return 'from-purple-500 to-indigo-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getRequestDetails = () => {
    switch (request.type) {
      case 'transaction':
        return request.data ? {
          type: 'Transaction',
          to: request.data.to,
          value: request.data.value ? `${parseInt(request.data.value, 16) / 1e18} ETH` : '0 ETH',
          from: walletAddress
        } : null;

      case 'message':
        return request.data ? {
          type: 'Message',
          content: request.data.length > 100 ? `${request.data.substring(0, 100)}...` : request.data,
          from: walletAddress
        } : null;

      case 'typedData':
        return {
          type: 'Typed Data',
          domain: 'Structured data signing request',
          from: walletAddress
        };

      default:
        return null;
    }
  };

  const details = getRequestDetails();

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return 'Today';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${getRequestColor()} text-white p-6 rounded-t-2xl`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                {getRequestIcon()}
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {getRequestTitle()}
                </h2>
                <div className="flex items-center space-x-1 text-sm text-orange-100">
                  <Clock className="w-4 h-4" />
                  <span>{getTimeAgo(request.timestamp)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              disabled={isProcessing}
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          {/* Request Badge */}
          <div className="flex items-center justify-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
              <span className="text-sm font-medium">
                {details?.type || 'Unknown Request'}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {details && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Request Details:</p>
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 space-y-3 border border-orange-100">
                {details.type && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Type:</span>
                    <span className="text-sm text-gray-800 font-semibold">{details.type}</span>
                  </div>
                )}

                {details.from && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">From:</span>
                    <span className="text-sm text-gray-800 font-mono bg-white rounded-lg px-2 py-1">
                      {formatAddress(details.from)}
                    </span>
                  </div>
                )}

                {details.to && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">To:</span>
                    <span className="text-sm text-gray-800 font-mono bg-white rounded-lg px-2 py-1">
                      {formatAddress(details.to)}
                    </span>
                  </div>
                )}

                {details.value && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Value:</span>
                    <span className="text-sm text-gray-800 font-semibold">{details.value}</span>
                  </div>
                )}

                {details.content && (
                  <div className="pt-2 border-t border-gray-200">
                    <span className="text-sm font-medium text-gray-700 block mb-1">Content:</span>
                    <span className="text-sm text-gray-900 font-mono break-all">
                      {details.content}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Password to Confirm
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="Enter your wallet password"
              disabled={isProcessing}
              required
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onReject}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 disabled:opacity-50 transition-all font-medium"
            >
              Reject
            </button>
            <button
              onClick={() => onApprove(password)}
              disabled={!password || isProcessing}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-md hover:shadow-lg"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  Confirm
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              )}
            </button>
          </div>

          {/* Security Note */}
          <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="text-xs text-amber-800 font-medium">
                Only confirm if you initiated this request
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-center space-x-2">
              <img src={SunByteIcon} alt="SunByte" className="w-6 h-6" />
              <span className="text-xs text-gray-500 font-medium">Secured by SunByte</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Web3RequestConfirmation;
