// API configuration and base URLs

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
export const RPC_NODE_URL = import.meta.env.VITE_RPC_NODE_URL || 'https://rpc.hyperevm.xyz/evm';

export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};
