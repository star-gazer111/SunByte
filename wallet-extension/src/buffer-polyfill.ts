/**
 * Buffer and Process Polyfills for Browser Extensions
 * Provides Node.js globals for browser compatibility
 */

// Import the proper buffer implementation
import { Buffer } from 'buffer';

// Make Buffer available globally in the extension context
if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
}

if (typeof globalThis !== 'undefined') {
  (globalThis as any).Buffer = Buffer;
}

if (typeof global !== 'undefined') {
  (global as any).Buffer = Buffer;
}

if (typeof self !== 'undefined') {
  (self as any).Buffer = Buffer;
}

// Process polyfill for Node.js compatibility
const processPolyfill = {
  env: {
    NODE_ENV: 'development',
  },
  version: 'v16.0.0',
  versions: {
    node: '16.0.0',
    v8: '8.0.0',
    openssl: '1.1.1',
  },
  platform: 'browser',
  arch: 'x64',
  cwd: () => '/',
  nextTick: (callback: Function, ...args: any[]) => {
    setTimeout(() => callback(...args), 0);
  },
  hrtime: {
    bigint: () => BigInt(Date.now()) * BigInt(1000000),
  },
};

// Add __dirname polyfill
Object.defineProperty(processPolyfill, '__dirname', {
  get: () => {
    // Return a sensible default for browser environment
    return '/';
  }
});

// Make __dirname available as a global variable
if (typeof window !== 'undefined') {
  (window as any).__dirname = '/';
}

if (typeof globalThis !== 'undefined') {
  (globalThis as any).__dirname = '/';
}

if (typeof global !== 'undefined') {
  (global as any).__dirname = '/';
}

if (typeof self !== 'undefined') {
  (self as any).__dirname = '/';
}

// Make process available globally
if (typeof window !== 'undefined') {
  (window as any).process = processPolyfill;
}

if (typeof globalThis !== 'undefined') {
  (globalThis as any).process = processPolyfill;
}

if (typeof global !== 'undefined') {
  (global as any).process = processPolyfill;
}

if (typeof self !== 'undefined') {
  (self as any).process = processPolyfill;
}

// Add additional browser globals that Node.js code might expect
if (typeof window !== 'undefined') {
  // URL and URLSearchParams for browser compatibility
  if (!window.URL) {
    (window as any).URL = class URL {
      constructor(public href: string) {}
      get pathname() { return '/'; }
      get search() { return ''; }
      get hash() { return ''; }
    };
  }

  if (!window.URLSearchParams) {
    (window as any).URLSearchParams = class URLSearchParams {
      constructor() {}
      get(key: string) { return null; }
      set(key: string, value: string) {}
      toString() { return ''; }
    };
  }

  // Add fetch polyfill if needed
  if (!window.fetch) {
    (window as any).fetch = async (url: string) => {
      throw new Error('Fetch not available in extension context');
    };
  }
}

if (typeof globalThis !== 'undefined') {
  (globalThis as any).URL = (window as any).URL;
  (globalThis as any).URLSearchParams = (window as any).URLSearchParams;
  (globalThis as any).fetch = (window as any).fetch;
}

if (typeof global !== 'undefined') {
  (global as any).URL = (window as any).URL;
  (global as any).URLSearchParams = (window as any).URLSearchParams;
  (global as any).fetch = (window as any).fetch;
}

export { Buffer };
export default Buffer;
