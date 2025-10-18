import { ChevronLeft } from 'lucide-react';

interface Asset {
  chainColor: string;
  chainIcon: string;
  symbol: string;
  name: string;
  amount: string;
  value: string;
}

interface AssetsPageProps {
  setCurrentPage: (page: string) => void;
  assets: Asset[];
}

export const AssetsPage = ({ setCurrentPage, assets }: AssetsPageProps) => {
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
            <h2 className="text-lg font-semibold">Assets by Chain</h2>
            <div className="w-9"></div>
          </div>
        </div>

        <div className="px-4 py-4 space-y-2">
          {assets.map((asset, idx) => (
            <div 
              key={idx}
              className="bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow relative"
            >
              <div className={`absolute top-2 right-2 ${asset.chainColor} w-5 h-5 rounded-full flex items-center justify-center text-white text-xs`}>
                {asset.chainIcon}
              </div>
              
              <div className="flex items-center justify-between pr-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                    {asset.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{asset.name}</p>
                    <p className="text-xs text-gray-500">{asset.amount} {asset.symbol}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800 text-sm">${asset.value}</p>
                  <p className="text-xs text-green-500">+1.8%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
