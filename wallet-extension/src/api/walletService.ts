const API_BASE_URL = 'http://localhost:8080';

interface CreateWalletParams {
  password: string;
}

interface ImportMnemonicParams {
  mnemonic: string;
  password: string;
}

interface ImportPrivateKeyParams {
  privateKey: string;
  password: string;
}

interface PrepareTxParams {
  fromAddress: string;
  toAddress: string;
  amount: string;
}

interface SignAndBroadcastParams {
  fromAddress: string;
  password: string;
  unsignedTx: any;
}

export const walletService = {
  async createWallet(params: CreateWalletParams) {
    const response = await fetch(`${API_BASE_URL}/wallet/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    return handleResponse(response);
  },

  async importFromMnemonic(params: ImportMnemonicParams) {
    const response = await fetch(`${API_BASE_URL}/wallet/import-mnemonic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    return handleResponse(response);
  },

  async importFromPrivateKey(params: ImportPrivateKeyParams) {
    const response = await fetch(`${API_BASE_URL}/wallet/import-private-key`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    return handleResponse(response);
  },

  async getBalance(address: string) {
    const response = await fetch(`${API_BASE_URL}/wallet/${address}/balance`);
    return handleResponse(response);
  },

  async prepareTransaction(params: PrepareTxParams) {
    const response = await fetch(`${API_BASE_URL}/wallet/prepare-transaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    return handleResponse(response);
  },

  async signAndBroadcast(params: SignAndBroadcastParams) {
    const response = await fetch(`${API_BASE_URL}/wallet/sign-and-broadcast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    return handleResponse(response);
  },
};

async function handleResponse(response: Response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Something went wrong');
  }
  return response.json();
}
