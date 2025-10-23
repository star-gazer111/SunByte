import VaultModel from '../models/vaultModel';

class VaultController {
  model: VaultModel;
  listeners: (() => void)[];

  constructor(model: VaultModel) {
    this.model = model;
    this.listeners = [];
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
  }

  notify() {
    this.listeners.forEach(listener => listener());
  }

  async connectWallet() {
    const mockAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
    this.model.connectWallet(mockAddress);
    this.notify();
  }

  disconnectWallet() {
    this.model.disconnectWallet();
    this.notify();
  }

  deposit(token: string, amount: string, chain: number) {
    if (!this.model.wallet) {
      alert('Please connect your wallet first');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    this.model.addDeposit(token, parseFloat(amount), chain);
    this.notify();
  }
}

export default VaultController;
