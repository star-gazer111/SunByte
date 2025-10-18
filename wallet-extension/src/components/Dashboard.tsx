import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, Repeat, ShoppingCart, TrendingUp, LogOut, ChevronDown, X } from 'lucide-react';
import { 
  TransactionsPage,
  BuyPage, 
  SendPage, 
  ReceivePage, 
  EarnPage 
} from '../pages';
<<<<<<< Updated upstream
import SunByteIcon from '../assets/SunByte.svg';

=======
import SunBiteIcon from '../assets/SunBite.svg';
>>>>>>> Stashed changes

interface Asset {
  name: string;
  symbol: string;
  amount: string;
  value: string;
  chain: string;
  chainIcon: string;
  chainColor: string;
  tokenIcon?: string;
}


const SunByteDashboard = ({ walletAddress, balance, onLogout, onSendTransaction }: any) => {
  const [currentPage, setCurrentPage] = useState('home');
  const [showAssetsSheet, setShowAssetsSheet] = useState(false);

  // Prevent body scroll when bottom sheet is open
  useEffect(() => {
    if (showAssetsSheet) {
      // Store current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }

    // Cleanup on unmount
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [showAssetsSheet]);

  const assets: Asset[] = [
    { name: 'Ethereum', symbol: 'ETH', amount: '0.85', value: '1,234.50', chain: 'Ethereum', chainIcon: '⟠', chainColor: 'bg-blue-500', tokenIcon: 'Ξ' },
    { name: 'Polygon', symbol: 'MATIC', amount: '520', value: '456.82', chain: 'Polygon', chainIcon: '⬡', chainColor: 'bg-purple-500', tokenIcon: '⬡' },
    { name: 'Arbitrum', symbol: 'ARB', amount: '650', value: '767.00', chain: 'Arbitrum', chainIcon: '◆', chainColor: 'bg-cyan-500', tokenIcon: '◆' },
    { name: 'USD Coin', symbol: 'USDC', amount: '1,200', value: '1,200.00', chain: 'Ethereum', chainIcon: '⟠', chainColor: 'bg-blue-500', tokenIcon: '$' },
    { name: 'Wrapped BTC', symbol: 'WBTC', amount: '0.02', value: '890.50', chain: 'Polygon', chainIcon: '⬡', chainColor: 'bg-purple-500', tokenIcon: '₿' },
    { name: 'DAI', symbol: 'DAI', amount: '850', value: '850.00', chain: 'Arbitrum', chainIcon: '◆', chainColor: 'bg-cyan-500', tokenIcon: '◈' },
  ];


  const quickActions = [
    { 
      name: 'Buy', 
      icon: ShoppingCart, 
      gradient: 'from-orange-400 to-orange-600',
      onClick: () => setCurrentPage('buy')
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
    { id: 3, type: 'Swap', token: 'ARB → ETH', amount: '500', value: '650.00', time: '3d ago', color: 'text-blue-500' },
    { id: 4, type: 'Received', token: 'ETH', amount: '0.5', value: '1,234.50', from: '0x1a2b...3c4d', time: '2h ago', color: 'text-green-500' },
  ];


  // Get unique chains with their details
  const uniqueChains = assets
    .filter((asset, index, self) => 
      index === self.findIndex(a => a.chain === asset.chain)
    )
    .map(asset => ({
      chain: asset.chain,
      chainIcon: asset.chainIcon,
      chainColor: asset.chainColor
    }));


  // Route to the appropriate page component
  switch (currentPage) {
    case 'transactions':
      return <TransactionsPage setCurrentPage={setCurrentPage} transactions={recentTransactions} />;
    case 'buy':
      return <BuyPage setCurrentPage={setCurrentPage} />;
    case 'send':
      return <SendPage setCurrentPage={setCurrentPage} />;
    case 'receive':
      return <ReceivePage setCurrentPage={setCurrentPage} walletAddress={walletAddress} />;
    case 'earn':
      return <EarnPage setCurrentPage={setCurrentPage} />;
    default:
      break;
  }


  // Home Page
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="max-w-md mx-auto relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 pt-6 pb-20 rounded-b-2xl shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <img 
                src={SunByteIcon} 
                alt="SunByte" 
                className="w-12 h-12" 
              />
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Logout Button */}
              <button 
                onClick={onLogout}
                className="p-2 hover:bg-white/20 rounded-full transition-colors group"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>


          {/* Total Balance */}
          <div className="text-center mb-4">
            <p className="text-orange-100 text-xs mb-1">Total Assets</p>
            <h2 className="text-4xl font-light tracking-tight mb-1">${balance || '2,458.32'}</h2>
            <p className="text-green-300 text-xs">+3.25% today</p>
          </div>


          {/* Asset Chain Selector - Styled like the image */}
          <div className="flex items-center justify-center mt-6">
            <button
              onClick={() => setShowAssetsSheet(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full transition-all duration-200 backdrop-blur-sm border border-white/30"
            >
              {/* Chain Icons Stack */}
              <div className="flex items-center -space-x-2">
                {uniqueChains.map((chain, idx) => (
                  <div 
                    key={chain.chain} 
                    className={`w-6 h-6 ${chain.chainColor} rounded-full flex items-center justify-center text-white text-xs border-2 border-white shadow-md transition-transform hover:scale-110`}
                    title={chain.chain}
                    style={{ zIndex: uniqueChains.length - idx }}
                  >
                    {chain.chainIcon}
                  </div>
                ))}
              </div>
              
              {/* Dropdown Text */}
              <span className="text-white text-sm font-medium">
                {uniqueChains.length} Chain{uniqueChains.length > 1 ? 's' : ''}
              </span>
              
              {/* Chevron Icon */}
              <ChevronDown className="w-4 h-4 text-white" />
            </button>
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


        {/* Recent Transactions */}
        <div className="px-4 pb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-700 font-semibold text-sm flex items-center ml-4">
               Recent Activity
            </h3>
            <button 
              onClick={() => setCurrentPage('transactions')}
              className="text-orange-500 text-xs font-medium hover:text-orange-600"
            >
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


        {/* iOS-style Assets Bottom Sheet */}
        {showAssetsSheet && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 z-40 transition-opacity"
              onClick={() => setShowAssetsSheet(false)}
            />
            
            {/* Bottom Sheet */}
            <div className="fixed inset-x-0 bottom-0 z-50 animate-slide-up">
              <div className="bg-white rounded-t-3xl shadow-2xl max-w-md mx-auto">
                {/* Handle Bar */}
                <div className="flex justify-center pt-3 pb-2">
                  <div className="w-10 h-1 bg-gray-300 rounded-full" />
                </div>
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800">All Assets</h3>
                  <button
                    onClick={() => setShowAssetsSheet(false)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>


                {/* Assets List */}
                <div className="px-4 py-3 max-h-96 overflow-y-auto">
                  {assets.map((asset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        // Handle asset selection if needed
                        setShowAssetsSheet(false);
                      }}
                      className="w-full flex items-center justify-between p-4 rounded-xl mb-2 bg-gray-50 hover:bg-gray-100 transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        {/* Token Icon with Chain Badge */}
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md">
                            {asset.tokenIcon || asset.symbol.charAt(0)}
                          </div>
                          {/* Chain Badge - Top Right */}
                          <div className={`absolute -top-1 -right-1 w-5 h-5 ${asset.chainColor} rounded-full flex items-center justify-center text-white text-xs border-2 border-white shadow-sm`}>
                            {asset.chainIcon}
                          </div>
                        </div>
                        
                        {/* Token Info */}
                        <div className="text-left">
                          <p className="font-semibold text-gray-800">{asset.symbol}</p>
                          <p className="text-xs text-gray-500">{asset.amount} {asset.symbol}</p>
                        </div>
                      </div>
                      
                      {/* Value */}
                      <div className="text-right">
                        <p className="font-semibold text-gray-800">${asset.value}</p>
                        <p className="text-xs text-gray-500">{asset.chain}</p>
                      </div>
                    </button>
                  ))}
                </div>


                {/* Safe Area Bottom Padding */}
                <div className="h-8" />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};


export default SunByteDashboard;
