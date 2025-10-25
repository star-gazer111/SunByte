// @ts-nocheck
import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: 'SunByte Wallet',
    description: 'A modern Web3 wallet extension',
    version: '1.0.0',
    permissions: ['storage', 'tabs', 'activeTab', 'action', 'notifications'],
    host_permissions: [
      'http://*/*',
      'https://*/*',
    ],
    content_scripts: [
      {
        matches: ['http://*/*', 'https://*/*'],
        js: ['content-script.js'],
        run_at: 'document_start',
      },
    ],
    action: {
      default_popup: 'popup.html',
      default_title: 'SunByte Wallet',
    },
    web_accessible_resources: [
      {
        resources: ['injected-script.js'],
        matches: ['http://*/*', 'https://*/*'],
      },
    ],
  },
  vite: (env) => ({
    define: {
      global: 'globalThis',
    },
    optimizeDeps: {
      include: ['@tanstack/react-query'],
    },
  }),
});