// @ts-nocheck
import { defineConfig } from 'wxt';

// Using a simple configuration without Vite plugins to avoid version conflicts
export default defineConfig({
  manifest: {
    name: 'SunByte Wallet',
    description: 'A modern Web3 wallet extension',
    version: '1.0.0',
    permissions: ['storage'],
    action: {
      default_popup: 'popup.html',
    },
  },
});