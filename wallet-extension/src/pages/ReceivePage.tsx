import { ChevronLeft } from 'lucide-react';

interface ReceivePageProps {
  setCurrentPage: (page: string) => void;
  walletAddress: string;
}

export const ReceivePage = ({ setCurrentPage, walletAddress }: ReceivePageProps) => {
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
            <h2 className="text-lg font-semibold">Receive</h2>
            <div className="w-9"></div>
          </div>
        </div>
        <div className="p-6">
          <div className="bg-white rounded-2xl p-6 shadow-md text-center">
            <div className="w-48 h-48 bg-gray-100 rounded-xl mx-auto mb-6 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">📱</div>
                <p className="text-xs text-gray-500">QR Code</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-2">Your wallet address</p>
              <div className="bg-gray-50 p-3 rounded-lg font-mono text-sm break-all">
                {walletAddress}
              </div>
            </div>
            
            <button 
              onClick={() => {
                navigator.clipboard.writeText(walletAddress);
                // You might want to add a toast notification here
              }}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-xl font-medium transition-colors"
            >
              Copy Address
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
