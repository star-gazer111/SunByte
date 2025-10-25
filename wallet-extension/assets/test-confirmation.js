// Test script to simulate Web3 requests for testing the confirmation system
// This can be injected into any web page to test the wallet confirmation

(function() {
  'use strict';

  console.log('🧪 Web3 Confirmation Test Script Loaded');
  console.log('Available test methods:');
  console.log('- testTransaction() - Test transaction confirmation');
  console.log('- testMessageSign() - Test message signing confirmation');
  console.log('- testTypedDataSign() - Test typed data signing confirmation');

  // Test transaction request
  window.testTransaction = function() {
    console.log('📤 Testing transaction request...');
    if (window.ethereum) {
      window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: '0x1234567890123456789012345678901234567890',
          to: '0x0987654321098765432109876543210987654321',
          value: '0x1' // 1 wei
        }]
      }).then(result => {
        console.log('✅ Transaction confirmed:', result);
      }).catch(error => {
        console.log('❌ Transaction rejected:', error.message);
      });
    } else {
      console.log('❌ window.ethereum not available');
    }
  };

  // Test message signing request
  window.testMessageSign = function() {
    console.log('📤 Testing message signing request...');
    if (window.ethereum) {
      window.ethereum.request({
        method: 'personal_sign',
        params: ['Hello Web3 World!', '0x1234567890123456789012345678901234567890']
      }).then(result => {
        console.log('✅ Message signed:', result);
      }).catch(error => {
        console.log('❌ Message signing rejected:', error.message);
      });
    } else {
      console.log('❌ window.ethereum not available');
    }
  };

  // Test typed data signing request
  window.testTypedDataSign = function() {
    console.log('📤 Testing typed data signing request...');
    if (window.ethereum) {
      const typedData = {
        domain: {
          name: 'SunByte Wallet',
          version: '1',
          chainId: 1,
          verifyingContract: '0x1234567890123456789012345678901234567890'
        },
        types: {
          Person: [
            { name: 'name', type: 'string' },
            { name: 'wallet', type: 'address' }
          ],
          Mail: [
            { name: 'from', type: 'Person' },
            { name: 'to', type: 'Person' },
            { name: 'contents', type: 'string' }
          ]
        },
        primaryType: 'Mail',
        message: {
          from: {
            name: 'Alice',
            wallet: '0x1234567890123456789012345678901234567890'
          },
          to: {
            name: 'Bob',
            wallet: '0x0987654321098765432109876543210987654321'
          },
          contents: 'Hello Bob from SunByte Wallet!'
        }
      };

      window.ethereum.request({
        method: 'eth_signTypedData_v4',
        params: ['0x1234567890123456789012345678901234567890', typedData]
      }).then(result => {
        console.log('✅ Typed data signed:', result);
      }).catch(error => {
        console.log('❌ Typed data signing rejected:', error.message);
      });
    } else {
      console.log('❌ window.ethereum not available');
    }
  };

  // Auto-detect if we're on a Web3 site and show test options
  if (document.querySelector('[href*="uniswap"], [href*="opensea"], [href*="pancakeswap"]') ||
      window.location.hostname.includes('app.uniswap.org') ||
      window.location.hostname.includes('opensea.io')) {
    console.log('🎯 Detected Web3 site! You can now test the confirmation system:');
    console.log('1. Try connecting to the wallet on this site');
    console.log('2. Try signing a transaction or message');
    console.log('3. The extension popup should open automatically for confirmation');
  }
})();
