import { httpClient } from '../http/client';

export interface WalletBalance {
  asset: string;
  balance: string;
  decimals: number;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
}

export const walletService = {
  async getBalances(address: string): Promise<WalletBalance[]> {
    return httpClient.get<WalletBalance[]>(`/wallets/${address}/balances`);
  },

  async getTransactions(address: string, limit = 10, offset = 0): Promise<Transaction[]> {
    return httpClient.get<Transaction[]>('/transactions', {
      params: { address, limit, offset },
    });
  },

  async sendTransaction(signedTx: string): Promise<{ txHash: string }> {
    return httpClient.post<{ txHash: string }>('/transactions', {
      body: { tx: signedTx },
    });
  },

  async getGasPrice(): Promise<string> {
    return httpClient.get<string>('/gas/price');
  },
};
