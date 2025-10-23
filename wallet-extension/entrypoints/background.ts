// Import Buffer polyfill first - this must be loaded before any other modules
import '../src/buffer-polyfill';

// Import wallet provider to make it available globally
import '../src/api/walletProvider';

import { defineBackground } from '#imports';

export default defineBackground(() => {
  // This is a basic background script for your extension
  console.log('Background script loaded!');

  // Example: Listen for extension installation
  chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed/updated');
  });
});
