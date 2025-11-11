import { chains } from '../constants/chains';
import { tokens } from '../constants/tokens';

class VaultModel {
  wallet: string | null;
  deposits: any[];
  chains: any[];
  tokens: any[];

  constructor() {
    this.wallet = null;
    this.deposits = [];
    this.chains = chains;
    this.tokens = tokens;
  }

  connectWallet(address: string) {
    this.wallet = address;
  }

  disconnectWallet() {
    this.wallet = null;
  }

  addDeposit(token: string, amount: number, chain: number) {
    const deposit = {
      id: Date.now(),
      token,
      amount: parseFloat(amount.toString()),
      chain,
      timestamp: Date.now(),
      initialPrice: this.getTokenPrice(token)
    };
    this.deposits.push(deposit);
    return deposit;
  }

  getTokenPrice(symbol: string) {
    const token = this.tokens.find(t => t.symbol === symbol);
    return token ? token.price : 0;
  }

  getTotalValue() {
    return this.deposits.reduce((total, deposit) => {
      const currentPrice = this.getTokenPrice(deposit.token);
      return total + (deposit.amount * currentPrice);
    }, 0);
  }

  getDepositsByToken() {
    const grouped: { [key: string]: number } = {};
    this.deposits.forEach(deposit => {
      if (!grouped[deposit.token]) {
        grouped[deposit.token] = 0;
      }
      grouped[deposit.token] += deposit.amount;
    });
    return grouped;
  }
}

export default VaultModel;
