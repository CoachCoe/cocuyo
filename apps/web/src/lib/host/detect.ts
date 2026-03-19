/**
 * Host Detection Module
 *
 * Detects whether the app is running inside Triangle host environment
 * and provides access to host APIs when available.
 */

import {
  injectSpektrExtension,
  createAccountsProvider,
  createMetaProvider,
} from '@novasamatech/product-sdk';
import type { AccountConnectionStatus } from '@novasamatech/product-sdk';

let initialized = false;
let hosted = false;

// Type for the accounts provider returned by createAccountsProvider
type AccountsProviderType = ReturnType<typeof createAccountsProvider>;
type MetaProviderType = ReturnType<typeof createMetaProvider>;

let _accountsProvider: AccountsProviderType | null = null;
let _metaProvider: MetaProviderType | null = null;

/**
 * Check if we're running inside an iframe (Triangle host).
 */
function detectHostEnvironment(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    // Triangle hosts the app in an iframe
    // Check if we're in an iframe by comparing window to parent
    const inIframe = window.self !== window.top;

    // Additional check: Triangle sets this in the iframe context
    // The product-sdk communicates via postMessage with the parent
    return inIframe;
  } catch {
    // Cross-origin iframe access throws - this means we ARE in an iframe
    // but can't access parent (which is expected for Triangle)
    return true;
  }
}

/**
 * Initialize host detection.
 * Must be called once at app startup.
 */
export function initHostDetection(): void {
  if (initialized) return;
  initialized = true;

  // First check if we're actually in a host environment
  hosted = detectHostEnvironment();

  if (!hosted) {
    _accountsProvider = null;
    _metaProvider = null;
    return;
  }

  try {
    // Inject the Spektr extension which enables host communication
    void injectSpektrExtension();

    // Create providers
    _accountsProvider = createAccountsProvider();
    _metaProvider = createMetaProvider();
  } catch {
    // If provider creation fails, mark as not hosted
    hosted = false;
    _accountsProvider = null;
    _metaProvider = null;
  }
}

/**
 * Check if the app is running inside Triangle host.
 */
export function isHosted(): boolean {
  if (!initialized) {
    initHostDetection();
  }
  return hosted;
}

/**
 * Get the accounts provider (if available).
 */
export function getAccountsProvider(): AccountsProviderType | null {
  if (!initialized) {
    initHostDetection();
  }
  return _accountsProvider;
}

/**
 * Get the meta provider (if available).
 */
export function getMetaProvider(): MetaProviderType | null {
  if (!initialized) {
    initHostDetection();
  }
  return _metaProvider;
}

// Re-export the connection status type
export type { AccountConnectionStatus };
