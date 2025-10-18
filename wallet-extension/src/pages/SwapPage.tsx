import { ChevronLeft } from 'lucide-react';

interface SwapPageProps {
  setCurrentPage: (page: string) => void;
}

export const SwapPage = ({ setCurrentPage }: SwapPageProps) => {
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
            <h2 className="text-lg font-semibold">Swap Tokens</h2>
            <div className="w-9"></div>
          </div>
        </div>
        <div className="p-6">
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Coming Soon</h3>
            <p className="text-gray-600 mb-6">Swap between different cryptocurrencies with ease</p>
            <div className="bg-orange-50 rounded-xl p-4 text-orange-700">
              <p className="text-sm">Our swap feature will support multiple DEX aggregators to ensure you get the best rates.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
