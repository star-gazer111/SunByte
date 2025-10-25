// Injected script that provides the Web3 provider interface
(function() {
  'use strict';

  function SunByteProvider() {
    this.isSunByte = true;
    this.isMetaMask = false;
    this.isConnected = false;
    this.chainId = '0x1';
    this.requestId = 0;
    this.pendingRequests = new Map();

    this.setupEventListeners();
    this.checkConnection();
  }

  SunByteProvider.prototype.setupEventListeners = function() {
    var self = this;

    // Listen for messages from content script
    window.addEventListener('message', function(event) {
      if (event.source !== window) return;

      var data = event.data;
      if (data.type === 'SUNBYTE_RESPONSE') {
        self.handleResponse(data.requestId, data);
      }
    });

    // Note: chrome.runtime is not available in page context, so we don't use it here
  };

  SunByteProvider.prototype.handleResponse = function(requestId, response) {
    var request = this.pendingRequests.get(requestId);
    if (request) {
      this.pendingRequests.delete(requestId);
      if (response.error) {
        request.reject(new Error(response.error));
      } else {
        request.resolve(response.result);
      }
    }
  };

  SunByteProvider.prototype.sendToExtension = function(method, params) {
    var self = this;
    params = params || [];

    return new Promise(function(resolve, reject) {
      var requestId = (++self.requestId).toString();

      self.pendingRequests.set(requestId, { resolve: resolve, reject: reject });

      var message = {
        type: 'SUNBYTE_REQUEST',
        method: method,
        params: params,
        requestId: requestId,
      };

      // Send message to content script via window.postMessage
      window.postMessage(message, '*');

      // Timeout after 30 seconds
      setTimeout(function() {
        if (self.pendingRequests.has(requestId)) {
          self.pendingRequests.delete(requestId);
          reject(new Error('Request timeout'));
        }
      }, 30000);
    });
  };

  SunByteProvider.prototype.checkConnection = function() {
    var self = this;

    this.sendToExtension('sunbyte_checkConnection').then(function(response) {
      self.isConnected = response.connected;
      self.chainId = response.chainId || '0x1';
    }).catch(function(error) {
      self.isConnected = false;
    });
  };

  SunByteProvider.prototype.request = function(args) {
    var self = this;
    var method = args.method;
    var params = args.params || [];

    switch (method) {
      case 'eth_requestAccounts':
        return this.requestAccounts();

      case 'eth_accounts':
        return this.getAccounts();

      case 'eth_chainId':
        return Promise.resolve(this.chainId);

      case 'eth_getBalance':
        return this.sendToExtension('eth_getBalance', params);

      case 'eth_sendTransaction':
        return this.sendToExtension('eth_sendTransaction', params);

      case 'eth_signTransaction':
        return this.sendToExtension('eth_signTransaction', params);

      case 'eth_sign':
        return this.sendToExtension('eth_sign', params);

      case 'personal_sign':
        return this.sendToExtension('personal_sign', params);

      case 'personal_sign':
        return this.sendToExtension('personal_sign', params);

      case 'eth_signTypedData':
        return this.sendToExtension('eth_signTypedData', params);

      case 'eth_signTypedData_v4':
        return this.sendToExtension('eth_signTypedData_v4', params);

      case 'wallet_switchEthereumChain':
        return this.sendToExtension('wallet_switchEthereumChain', params);

      case 'wallet_addEthereumChain':
        return this.sendToExtension('wallet_addEthereumChain', params);

      case 'net_version':
        return Promise.resolve(parseInt(this.chainId, 16).toString());

      default:
        return this.sendToExtension(method, params);
    }
  };

  SunByteProvider.prototype.requestAccounts = function() {
    var self = this;

    return this.sendToExtension('eth_requestAccounts').then(function(accounts) {
      self.isConnected = true;
      return accounts;
    }).catch(function(error) {
      throw error;
    });
  };

  SunByteProvider.prototype.getAccounts = function() {
    return this.sendToExtension('eth_accounts').catch(function(error) {
      return [];
    });
  };

  SunByteProvider.prototype.on = function(event, handler) {
    window.addEventListener('sunbyte:' + event, handler);
  };

  SunByteProvider.prototype.removeListener = function(event, handler) {
    window.removeEventListener('sunbyte:' + event, handler);
  };

  SunByteProvider.prototype.emit = function(event) {
    var args = Array.prototype.slice.call(arguments, 1);
    window.dispatchEvent(new CustomEvent('sunbyte:' + event, { detail: args }));
  };

  // Create the provider instance
  var provider = new SunByteProvider();

  // Make it available as both sunByte and ethereum
  window.sunByte = provider;
  window.ethereum = provider;

  // Announce provider availability
  if (typeof window !== 'undefined' && window.dispatchEvent) {
    try {
      window.dispatchEvent(new CustomEvent('ethereum#initialized'));
      window.dispatchEvent(new CustomEvent('sunbyte#initialized', { detail: provider }));
    } catch (error) {
      // Silent fallback for build-time initialization
    }
  }
})();
