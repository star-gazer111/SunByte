import { ChevronLeft } from 'lucide-react';

interface SendPageProps {
  setCurrentPage: (page: string) => void;
}

export const SendPage = ({ setCurrentPage }: SendPageProps) => {
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
            <h2 className="text-lg font-semibold">Send</h2>
            <div className="w-9"></div>
          </div>
        </div>
        <div className="p-6">
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Coming Soon</h3>
            <p className="text-gray-600 mb-6">Send crypto to any address</p>
            <div className="space-y-4">
              <div className="bg-orange-50 rounded-xl p-4 text-orange-700">
                <p className="text-sm">You'll be able to send any supported cryptocurrency to any valid address.</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-gray-600">
                <p className="text-xs">Tip: Always double-check the recipient's address before sending.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
