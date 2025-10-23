/**
 * Custom Web3 Provider for the internal wallet
 * Implements EIP-1193 standard for Nexus SDK compatibility
 */

import { walletService } from './walletService';

// EIP-1193 Provider interface
interface EthereumProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, handler: (...args: any[]) => void) => void;
  removeListener: (event: string, handler: (...args: any[]) => void) => void;
  selectedAddress?: string;
  chainId?: string;
}

interface WalletData {
  address: string;
  privateKey: string;
}

class WalletProvider implements EthereumProvider {
  public selectedAddress?: string;
  public chainId: string = '0x1'; // Ethereum mainnet
  private eventListeners: { [event: string]: Function[] } = {};

  // Add domain property for SIWE compatibility
  public domain: string = 'localhost'; // Use localhost for development
  public origin: string = 'chrome-extension://fmghpldlmgnfjepijokabdfojgdfgcep';

  async connect(): Promise<string[]> {
    try {
      // Get wallet data from chrome storage
      const result = await new Promise<any>((resolve) => {
        chrome.storage.local.get(['walletAddress'], (data) => {
          resolve(data);
        });
      });

      if (!result.walletAddress) {
        throw new Error('No wallet found. Please create or import a wallet first.');
      }

      this.selectedAddress = result.walletAddress;
      this.emit('accountsChanged', [result.walletAddress]);
      return [result.walletAddress];
    } catch (error) {
      throw new Error('Failed to connect wallet: ' + (error as Error).message);
    }
  }

  async disconnect(): Promise<void> {
    this.selectedAddress = undefined;
    this.emit('accountsChanged', []);
  }

  async request({ method, params }: { method: string; params?: any[] }): Promise<any> {
    console.log('Wallet provider request:', method, params);

    try {
      switch (method) {
        case 'eth_requestAccounts':
          return await this.connect();

        case 'eth_accounts':
          // Ensure we always return an array, never undefined
          const accounts = this.selectedAddress ? [this.selectedAddress] : [];
          console.log('Returning accounts:', accounts);
          return accounts;
        case 'eth_getBalance':
          const address = params?.[0];
          if (!address) throw new Error('Address required');
          const balanceData = await walletService.getBalance(address);
          return balanceData?.balance || '0x0';

        case 'eth_getChainId':
          return this.chainId;

        case 'eth_blockNumber':
          return '0x0'; // Simplified for demo

        case 'eth_getCode':
          return '0x'; // No code for regular accounts

        case 'eth_getTransactionCount':
          return '0x1'; // Return 1 for simplicity (has transactions)

        case 'eth_getBlockByNumber':
          return null; // Simplified for demo

        case 'eth_getTransactionReceipt':
          return null; // Simplified for demo

        case 'eth_estimateGas':
          return '0x7530'; // 30000 gas in hex

        case 'eth_gasPrice':
          return '0x4A817C800'; // 20 gwei in hex

        case 'personal_sign':
          if (!params || params.length < 1) {
            throw new Error('Message required for personal_sign');
          }
          return await this.personalSignWithDomainFix(params[0], params[1]);

        case 'eth_signTypedData':
          if (!params || params.length < 2) {
            throw new Error('Address and typed data required');
          }
          return await this.signTypedDataWithDomainFix(params[0], params[1]);
