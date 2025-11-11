import { rpcClient } from '../client';

export const chainService = {
  async getBlockNumber(): Promise<number> {
    return rpcClient.call<number>('eth_blockNumber');
  },

  async getChainId(): Promise<string> {
    return rpcClient.call<string>('eth_chainId');
  },

  async getTransactionCount(address: string, blockNumber: string = 'latest'): Promise<string> {
    return rpcClient.call<string>('eth_getTransactionCount', [address, blockNumber]);
  },

  async getTransactionReceipt(txHash: string): Promise<any> {
    return rpcClient.call('eth_getTransactionReceipt', [txHash]);
  },

  async getBalance(address: string): Promise<string> {
    return rpcClient.call<string>('eth_getBalance', [address, 'latest']);
  },

  async call(transaction: {
    to: string;
    data: string;
    from?: string;
    gas?: string;
    gasPrice?: string;
    value?: string;
  }, blockNumber: string = 'latest'): Promise<string> {
    return rpcClient.call<string>('eth_call', [transaction, blockNumber]);
  },

  async estimateGas(transaction: {
    from?: string;
    to: string;
    data?: string;
    value?: string;
  }): Promise<string> {
    return rpcClient.call<string>('eth_estimateGas', [transaction]);
  },
};
