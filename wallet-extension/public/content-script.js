// Content script to inject Web3 provider into web pages and handle communication
(function() {
  'use strict';

  // Listen for messages from injected script
  window.addEventListener('message', function(event) {
    // Only accept messages from same origin
    if (event.source !== window) return;

    var message = event.data;

    // Handle messages from injected script
    if (message.type === 'SUNBYTE_REQUEST') {
      // Forward to background script
      chrome.runtime.sendMessage(message, function(response) {
        // Forward response back to injected script
        window.postMessage({
          type: 'SUNBYTE_RESPONSE',
          requestId: message.requestId,
          result: response.result,
          error: response.error
        }, '*');
      });
    }
  });

  // Check if provider is already injected
  if (window.sunByte || window.ethereum) {
    return;
  }

  // Create and inject the provider script
  var script = document.createElement('script');
  script.src = chrome.runtime.getURL('injected-script.js');
  script.onload = function() {
    script.remove();
  };
  script.onerror = function() {
    // Silent error handling
  };

  (document.head || document.documentElement).appendChild(script);
})();
