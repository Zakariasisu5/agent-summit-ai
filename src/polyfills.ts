/**
 * Polyfills for 0G SDK compatibility in both browser and server environments
 */

// More aggressive URL.clone() polyfill for 0G SDK
// The SDK uses url.clone() internally which doesn't exist in standard Web API
(function applyUrlPolyfill() {
  if (typeof globalThis === 'undefined') return;
  
  const OriginalURL = globalThis.URL;
  if (!OriginalURL) return;
  
  // Check if already patched
  if (OriginalURL.prototype && OriginalURL.prototype.clone) {
    console.log('[Polyfills] URL.clone() already exists');
    return;
  }
  
  // Create extended URL class with clone method
  class PatchedURL extends OriginalURL {
    constructor(url, base) {
      super(url, base);
    }
    
    clone() {
      return new PatchedURL(this.href);
    }
  }
  
  // Copy static properties from original URL
  Object.getOwnPropertyNames(OriginalURL).forEach(prop => {
    if (prop !== 'length' && prop !== 'name' && prop !== 'prototype') {
      try {
        const descriptor = Object.getOwnPropertyDescriptor(OriginalURL, prop);
        if (descriptor) {
          Object.defineProperty(PatchedURL, prop, descriptor);
        }
      } catch (e) {
        // Ignore non-configurable properties
      }
    }
  });
  
  // Replace global URL
  try {
    Object.defineProperty(globalThis, 'URL', {
      value: PatchedURL,
      writable: true,
      enumerable: false,
      configurable: true
    });
  } catch (e) {
    // Fallback if defineProperty fails
    globalThis.URL = PatchedURL;
  }
  
  // Also patch original prototype as fallback
  if (OriginalURL.prototype && !OriginalURL.prototype.clone) {
    try {
      OriginalURL.prototype.clone = function() {
        return new PatchedURL(this.href);
      };
    } catch (e) {
      console.error('[Polyfills] Failed to patch URL.prototype:', e);
    }
  }
  
  console.log('[Polyfills] URL.clone() polyfill applied successfully');
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
    const testUrl = new (globalThis as any).URL('https://test.com');
    if (typeof testUrl.clone === 'function') {
      const cloned = testUrl.clone();
      console.log('[Polyfills] ✅ URL.clone() is available and working');
      console.log(`[Polyfills] Test: ${testUrl.href} -> ${cloned.href}`);
    } else {
      console.error('[Polyfills] ❌ URL.clone() is NOT available after polyfill');
    }
  } catch (e) {
    console.error('[Polyfills] ❌ Error testing URL.clone():', e);
  }
}
