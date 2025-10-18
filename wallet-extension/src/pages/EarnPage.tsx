import { ChevronLeft } from 'lucide-react';

interface EarnPageProps {
  setCurrentPage: (page: string) => void;
}

export const EarnPage = ({ setCurrentPage }: EarnPageProps) => {
  const earningOptions = [
    {
      id: 1,
      title: 'Staking',
      description: 'Earn passive income by staking your tokens',
      apy: '5-15%',
      lockPeriod: 'Flexible',
      icon: '🪙'
    },
    {
      id: 2,
      title: 'Liquidity Mining',
      description: 'Provide liquidity and earn trading fees',
      apy: '15-50%',
      lockPeriod: 'Flexible',
      icon: '🔄'
    },
    {
      id: 3,
      title: 'Yield Farming',
      description: 'Earn high yields with DeFi strategies',
      apy: '20-100%+',
      lockPeriod: '7-90 days',
      icon: '🌾'
    }
  ];

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
            <h2 className="text-lg font-semibold">Earn</h2>
            <div className="w-9"></div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Earn Rewards</h3>
            <p className="text-gray-600">Grow your crypto with these earning opportunities</p>
          </div>
          
          <div className="space-y-4">
            {earningOptions.map((option) => (
              <div key={option.id} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{option.icon}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-gray-800">{option.title}</h4>
                      <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {option.apy} APY
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      <span>Lock: {option.lockPeriod}</span>
                      <span className="mx-2">•</span>
                      <button className="text-orange-500 hover:text-orange-600 font-medium">
                        Learn more
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 bg-orange-50 rounded-xl p-4 text-orange-700 text-sm">
            <p>🔒 All earning opportunities are secured by smart contracts on the blockchain.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
