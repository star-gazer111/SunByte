export interface WalletData {
  address: string;
  privateKey?: string;
  mnemonic?: string;
}

export interface ChromeStorageData {
  walletAddress?: string;
}

export interface PendingRequest {
  id: string;
  type: 'transaction' | 'message' | 'typedData';
  data: any;
  timestamp: number;
}
