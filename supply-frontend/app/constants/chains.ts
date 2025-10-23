export interface Chain {
  id: number;
  name: string;
  symbol: string;
  color: string;
}

export const chains: Chain[] = [
  { id: 1, name: 'Ethereum', symbol: 'ETH', color: 'from-orange-500 to-amber-500' },
  { id: 2, name: 'Polygon', symbol: 'MATIC', color: 'from-amber-500 to-orange-500' },
  { id: 3, name: 'Arbitrum', symbol: 'ARB', color: 'from-orange-400 to-amber-400' },
  { id: 4, name: 'Optimism', symbol: 'OP', color: 'from-amber-400 to-orange-400' },
  { id: 5, name: 'Base', symbol: 'BASE', color: 'from-orange-600 to-amber-600' },
  { id: 6, name: 'Avalanche', symbol: 'AVAX', color: 'from-amber-600 to-orange-600' }
];
