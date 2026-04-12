/**
 * @deprecated Use SignerManager from @polkadot-apps/signer instead.
 * This module is being replaced by the SignerManager-based implementation
 * in @/lib/context/SignerContext.
 *
 * Host Detection Module
 *
 * Detects whether the app is running inside Triangle host environment
 * and provides access to host APIs when available.
 *
 * Based on get-local's implementation pattern.
 */

import type { AccountConnectionStatus as SDKAccountConnectionStatus } from '@novasamatech/product-sdk';

// Re-export the connection status type
export type AccountConnectionStatus = SDKAccountConnectionStatus;

let initialized = false;
let hosted = false;
let initPromise: Promise<boolean> | null = null;

// Type for the accounts provider returned by createAccountsProvider
type AccountsProviderType = ReturnType<
  typeof import('@novasamatech/product-sdk').createAccountsProvider
>;

let _accountsProvider: AccountsProviderType | null = null;

/**
 * Check if we're running inside Triangle host environment.
 *
 * Uses the official SDK detection when available, with fallback
 * to checking for Triangle-specific window markers.
 */
function isInsideContainer(): boolean {
  if (typeof window === 'undefined') return false;

  // Try SDK detection first (most reliable)
  try {
    // Dynamic import check - if sandboxProvider exists and reports correct environment
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const sdk = require('@novasamatech/product-sdk');
    if (sdk?.sandboxProvider?.isCorrectEnvironment?.()) {
      return true;
    }
  } catch {
    // SDK not available, fall through to manual detection
  }

  // Fallback: Check for Triangle-specific markers
  const inWebview = '__HOST_WEBVIEW_MARK__' in window;
  const hasApiPort = '__HOST_API_PORT__' in window;

  return inWebview || hasApiPort;
}

/**
 * Initialize host detection with timeout.
 * Returns true if successfully connected to host.
 */
export async function initHostDetection(): Promise<boolean> {
  if (initialized) return hosted;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    // First check if we're actually in a host environment
    if (!isInsideContainer()) {
      initialized = true;
      hosted = false;
      return false;
    }

    try {
      // Lazy load SDK and race against timeout
      const sdk = await Promise.race([
        import('@novasamatech/product-sdk'),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Host detection timeout')), 5000)
        ),
      ]);

      // Skip Spektr injection on dot.li (causes reload loop)
      const isDotLi = typeof window !== 'undefined' && window.location.hostname.endsWith('.dot.li');

      if (!isDotLi) {
        // Inject the Spektr extension which enables host communication
        await sdk.injectSpektrExtension();
      }

      // Create accounts provider with sandbox transport
      _accountsProvider = sdk.createAccountsProvider(sdk.sandboxTransport);

      // Request external network permissions early (map tiles, geocoding, etc.)
      // This prompts the user once per domain, then persists in host storage
      const { requestExternalPermissions } = await import('./permissions');
      await requestExternalPermissions();

      initialized = true;
      hosted = true;
      return true;
    } catch {
      // If initialization fails, mark as not hosted
      initialized = true;
      hosted = false;
      _accountsProvider = null;
      return false;
    }
  })();

  return initPromise;
}

/**
 * Synchronous check if the app is running inside Triangle host.
 * Will return false if initialization hasn't completed yet.
 */
export function isHosted(): boolean {
  return hosted;
}

/**
 * Check if we're inside a container (iframe/webview).
 * This is synchronous and can be called before initialization.
 */
export function isInContainer(): boolean {
  return isInsideContainer();
}

/**
 * Get the accounts provider (if available).
 */
export function getAccountsProvider(): AccountsProviderType | null {
  return _accountsProvider;
}

/**
 * Check if external (cross-origin) network requests will work.
 *
 * In Triangle sandbox, cross-origin fetch/XHR is blocked by the host.
 * Only same-origin requests (to Service Worker) are allowed.
 * Outside Triangle, network is always available.
 */
export function canMakeExternalRequests(): boolean {
  // Cross-origin requests are blocked in Triangle sandbox
  return !isInsideContainer();
}

/**
 * Check if geolocation is available.
 * Works both inside and outside Triangle.
 */
export function hasGeolocation(): boolean {
  return typeof navigator !== 'undefined' && 'geolocation' in navigator;
}

/**
 * Get current position using browser geolocation API.
 */
export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!hasGeolocation()) {
      reject(new Error('Geolocation not available'));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 300000, // 5 minutes
    });
  });
}
