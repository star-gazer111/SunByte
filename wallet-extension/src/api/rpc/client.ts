import { RPC_NODE_URL } from '../config';

type RpcRequest = {
  method: string;
  params?: any[] | Record<string, any>;
  id?: number | string;
  jsonrpc?: '2.0';
};

export class RpcClient {
  private url: string;
  private nextId: number = 1;

  constructor(nodeUrl: string = RPC_NODE_URL) {
    this.url = nodeUrl;
  }

  async call<T = any>(method: string, params?: any[] | Record<string, any>): Promise<T> {
    const request: RpcRequest = {
      jsonrpc: '2.0',
      method,
      params,
      id: this.nextId++,
    };

    try {
      const response = await fetch(this.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`RPC call failed: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(`RPC error: ${data.error.message || 'Unknown error'}`);
      }

      return data.result;
    } catch (error) {
      console.error('RPC call failed:', error);
      throw error;
    }
  }
}

export const rpcClient = new RpcClient();
