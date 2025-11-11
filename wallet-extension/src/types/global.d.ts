declare module '*.svg' {
  import React = require('react');
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

// Web3 Provider Types
interface RequestArguments {
  method: string;
  params?: any[];
}

interface SunByteProvider {
  isSunByte: boolean;
  isMetaMask: boolean;
  isConnected: boolean;
  chainId: string;
  request(args: { method: string; params?: any[] }): Promise<any>;
  on(event: string, handler: (...args: any[]) => void): void;
  removeListener(event: string, handler: (...args: any[]) => void): void;
  emit(event: string, ...args: any[]): void;
}

interface EthereumProvider {
  isSunByte: boolean;
  isMetaMask: boolean;
  isConnected: boolean;
  chainId: string;
  selectedAddress?: string;
  networkVersion?: string;
  request(args: { method: string; params?: any[] }): Promise<any>;
  on(event: string, handler: (...args: any[]) => void): void;
  removeListener(event: string, handler: (...args: any[]) => void): void;
  emit(event: string, ...args: any[]): void;
}

declare global {
  interface Window {
    sunByte?: SunByteProvider;
    ethereum?: SunByteProvider;
  }
}

// Chrome extension types
declare namespace chrome {
  namespace runtime {
    function sendMessage(message: any): Promise<any>;
    const onMessage: {
      addListener(callback: (message: any, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) => void): void;
    };
  }
  namespace storage {
    const local: {
      get(keys: string[] | string): Promise<{ [key: string]: any }>;
      set(items: { [key: string]: any }): Promise<void>;
    };
  }
  namespace tabs {
    const query: (queryInfo: { active?: boolean; currentWindow?: boolean }) => Promise<chrome.tabs.Tab[]>;
    const sendMessage: (tabId: number, message: any) => Promise<any>;
  }
}
