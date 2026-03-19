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
 * Initialize host detection.
 * Must be called once at app startup.
 */
export function initHostDetection(): void {
  if (initialized) return;
  initialized = true;

  try {
    // Inject the Spektr extension which enables host detection
    void injectSpektrExtension();
    hosted = true;

    // Create providers
    _accountsProvider = createAccountsProvider();
    _metaProvider = createMetaProvider();
  } catch {
    // If injection fails, we're not in a host environment
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
