export interface WalletData {
  address: string;
  privateKey: string;
  mnemonic?: string;
}

export interface ChromeStorageData {
  walletAddress?: string;
  walletData?: WalletData;
}
