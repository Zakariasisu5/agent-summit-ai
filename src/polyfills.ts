/**
 * Polyfills for 0G SDK compatibility in both browser and server environments
 */

// More aggressive URL.clone() polyfill for 0G SDK
// The SDK uses url.clone() internally which doesn't exist in standard Web API
(function applyUrlPolyfill() {
  if (typeof globalThis === 'undefined') return;
  
  const OriginalURL = globalThis.URL;
  if (!OriginalURL) return;
  
  // Create extended URL class with clone method
  class PatchedURL extends OriginalURL {
    constructor(url, base) {
      super(url, base);
    }
    
    clone() {
      return new PatchedURL(this.href);
    }
  }
  
  // Copy static properties
  Object.getOwnPropertyNames(OriginalURL).forEach(prop => {
    if (prop !== 'length' && prop !== 'name' && prop !== 'prototype') {
      try {
        PatchedURL[prop] = OriginalURL[prop];
      } catch (e) {
        // Ignore non-configurable properties
      }
    }
  });
  
  // Replace global URL
  globalThis.URL = PatchedURL;
  
  // Also patch prototype for any existing URL instances
  if (OriginalURL.prototype && !OriginalURL.prototype.clone) {
    OriginalURL.prototype.clone = function() {
      return new PatchedURL(this.href);
    };
  }
  
  // Export for CommonJS environments
  if (typeof module !== 'undefined' && module.exports) {
    module.exports.URL = PatchedURL;
  }
})();

// Polyfill for global object (required by 0G Serving Broker SDK)
// The SDK expects 'global' to be defined, but modern environments use 'globalThis'
if (typeof globalThis !== 'undefined') {
  if (typeof (globalThis as any).global === 'undefined') {
    (globalThis as any).global = globalThis;
  }
}

// Additional polyfill for window environment (browser)
if (typeof window !== 'undefined' && typeof (window as any).global === 'undefined') {
  (window as any).global = window;
}

// Log that polyfills are loaded (helpful for debugging)
if (typeof console !== 'undefined' && console.log) {
  console.log('[Polyfills] 0G SDK compatibility polyfills loaded');
  // Test if URL.clone exists
  try {
    const testUrl = new URL('https://test.com');
    if (typeof (testUrl as any).clone === 'function') {
      console.log('[Polyfills] ✅ URL.clone() is available');
    } else {
      console.error('[Polyfills] ❌ URL.clone() is NOT available after polyfill');
    }
  } catch (e) {
    console.error('[Polyfills] Error testing URL.clone():', e);
  }
}
