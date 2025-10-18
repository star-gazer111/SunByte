import { ChevronLeft } from 'lucide-react';

interface BuyPageProps {
  setCurrentPage: (page: string) => void;
}

export const BuyPage = ({ setCurrentPage }: BuyPageProps) => {
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
            <h2 className="text-lg font-semibold">Buy Crypto</h2>
            <div className="w-9"></div>
          </div>
        </div>
        <div className="p-6 text-center">
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Coming Soon</h3>
            <p className="text-gray-600 mb-6">Buy crypto with your preferred payment method</p>
            <div className="bg-orange-50 rounded-xl p-4 text-orange-700">
              <p className="text-sm">We're working on integrating with trusted payment providers to bring you the best rates and lowest fees.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
