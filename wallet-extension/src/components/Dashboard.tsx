import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, Repeat, ShoppingCart, TrendingUp, ChevronRight, LogOut, ChevronLeft } from 'lucide-react';
import { 
  AssetsPage, 
  BuyPage, 
  SwapPage, 
  SendPage, 
  ReceivePage, 
  EarnPage 
} from '../pages';

interface Asset {
  name: string;
  symbol: string;
  amount: string;
  value: string;
  chain: string;
  chainIcon: string;
  chainColor: string;
}

const SunbiteDashboard = ({ walletAddress, balance, onLogout, onSendTransaction }: any) => {
  const [currentPage, setCurrentPage] = useState('home'); // home, assets, buy, swap, send, receive, earn

  // Sample asset data with chains
  const assets: Asset[] = [
    { name: 'Ethereum', symbol: 'ETH', amount: '0.85', value: '1,234.50', chain: 'Ethereum', chainIcon: '⟠', chainColor: 'bg-blue-500' },
    { name: 'Polygon', symbol: 'MATIC', amount: '520', value: '456.82', chain: 'Polygon', chainIcon: '⬡', chainColor: 'bg-purple-500' },
    { name: 'Arbitrum', symbol: 'ARB', amount: '650', value: '767.00', chain: 'Arbitrum', chainIcon: '◆', chainColor: 'bg-cyan-500' },
    { name: 'USD Coin', symbol: 'USDC', amount: '1,200', value: '1,200.00', chain: 'Ethereum', chainIcon: '⟠', chainColor: 'bg-blue-500' },
    { name: 'Wrapped BTC', symbol: 'WBTC', amount: '0.02', value: '890.50', chain: 'Polygon', chainIcon: '⬡', chainColor: 'bg-purple-500' }
  ];

  const quickActions = [
    { 
      name: 'Buy', 
      icon: ShoppingCart, 
      gradient: 'from-orange-400 to-orange-600',
      onClick: () => setCurrentPage('buy')
    },
    { 
      name: 'Swap', 
      icon: Repeat, 
      gradient: 'from-orange-500 to-amber-600',
      onClick: () => setCurrentPage('swap')
    },
    { 
      name: 'Send', 
      icon: ArrowUpRight, 
      gradient: 'from-amber-500 to-orange-500',
      onClick: () => setCurrentPage('send')
    },
    { 
      name: 'Receive', 
      icon: ArrowDownLeft, 
      gradient: 'from-orange-400 to-orange-600',
      onClick: () => setCurrentPage('receive')
    },
    { 
      name: 'Earn', 
      icon: TrendingUp, 
      gradient: 'from-orange-500 to-amber-600',
      onClick: () => setCurrentPage('earn')
    }
  ];

  const recentTransactions = [
    { id: 1, type: 'Received', token: 'ETH', amount: '0.5', value: '1,234.50', from: '0x1a2b...3c4d', time: '2h ago', color: 'text-green-500' },
    { id: 2, type: 'Sent', token: 'MATIC', amount: '150', value: '245.00', to: '0x5e6f...7g8h', time: '1d ago', color: 'text-orange-500' },
    { id: 3, type: 'Swap', token: 'ARB → ETH', amount: '500', value: '650.00', time: '3d ago', color: 'text-blue-500' }
  ];

  // Route to the appropriate page component
  switch (currentPage) {
    case 'assets':
      return <AssetsPage setCurrentPage={setCurrentPage} assets={assets} />;
    case 'buy':
      return <BuyPage setCurrentPage={setCurrentPage} />;
    case 'swap':
      return <SwapPage setCurrentPage={setCurrentPage} />;
    case 'send':
      return <SendPage setCurrentPage={setCurrentPage} />;
    case 'receive':
      return <ReceivePage setCurrentPage={setCurrentPage} walletAddress={walletAddress} />;
    case 'earn':
      return <EarnPage setCurrentPage={setCurrentPage} />;
    default:
      // Default to home page
      break;
  }

  // Home Page
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 pt-6 pb-20 rounded-b-2xl shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <span className="text-xl">☀️</span>
              </div>
              <div>
                <h1 className="text-base font-bold">Sunbite</h1>
                <p className="text-orange-100 text-xs">sunbite.wallet</p>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="p-2 hover:bg-white/20 rounded-full transition-colors group"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* Total Balance */}
          <div className="text-center">
            <p className="text-orange-100 text-xs mb-1">Total Assets</p>
            <h2 className="text-4xl font-light tracking-tight mb-1">${balance || '2,458.32'}</h2>
            <p className="text-green-300 text-xs">+3.25% today</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-4 -mt-14 mb-4">
          <div className="bg-white rounded-xl shadow-xl p-4">
            <div className="flex justify-between items-center">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={action.onClick}
                  className="flex flex-col items-center group"
                >
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-1 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-200`}>
                    <action.icon className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                  <span className="text-xs font-medium text-gray-700">{action.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Assets by Chain - Clickable Option */}
        <div className="px-4 mb-4">
          <button 
            onClick={() => setCurrentPage('assets')}
            className="w-full bg-white rounded-xl p-3 flex items-center justify-between shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center">
                <span className="text-lg">⛓️</span>
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-800 text-sm">Assets by Chain</p>
                <p className="text-xs text-gray-500">View all your tokens</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
          </button>
        </div>

        {/* Recent Transactions */}
        <div className="px-4 pb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-700 font-semibold text-sm flex items-center">
              <span className="mr-2">📊</span> Recent Activity
            </h3>
            <button className="text-orange-500 text-xs font-medium hover:text-orange-600">
              View All
            </button>
          </div>
          <div className="space-y-2">
            {recentTransactions.map((tx) => (
              <div 
                key={tx.id}
                className="bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-9 h-9 ${tx.color === 'text-green-500' ? 'bg-green-50' : tx.color === 'text-orange-500' ? 'bg-orange-50' : 'bg-blue-50'} rounded-full flex items-center justify-center`}>
                      <span className={`text-lg ${tx.color}`}>
                        {tx.type === 'Received' ? '↓' : tx.type === 'Sent' ? '↑' : '⇄'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{tx.type}</p>
                      <p className="text-xs text-gray-500">{tx.token}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold text-sm ${tx.color}`}>
                      {tx.type === 'Received' ? '+' : tx.type === 'Sent' ? '-' : ''}${tx.value}
                    </p>
                    <p className="text-xs text-gray-400">{tx.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SunbiteDashboard;