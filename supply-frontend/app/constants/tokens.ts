export interface Token {
  symbol: string;
  name: string;
  price: number;
  icon: string;
}

export const tokens: Token[] = [
  { symbol: 'ETH', name: 'Ethereum', price: 2650.50, icon: '⟠' },
  { symbol: 'USDC', name: 'USD Coin', price: 1.00, icon: '◉' },
  { symbol: 'USDT', name: 'Tether', price: 1.00, icon: '◈' },
  { symbol: 'DAI', name: 'Dai', price: 1.00, icon: '◇' },
  { symbol: 'WBTC', name: 'Wrapped Bitcoin', price: 67420.00, icon: '₿' },
  { symbol: 'LINK', name: 'Chainlink', price: 14.25, icon: '⬡' }
];
