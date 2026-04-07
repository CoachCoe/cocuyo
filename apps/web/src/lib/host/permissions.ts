/**
 * Host API remote permissions
 *
 * Requests network access permissions from Triangle sandbox.
 * The sandbox blocks all external HTTP(S) by default — products must
 * request permission via the Host API, which prompts the user.
 *
 * Once granted, permissions persist in the host's storage.
 *
 * Pattern rules (from Host API spec):
 * - Protocol must match exactly (https://)
 * - "*" matches exactly one DNS label (single-level subdomain)
 * - Path "/" matches any path on the domain
 */

import { hostApi } from '@novasamatech/product-sdk';

/**
 * URL patterns that Firefly Network needs access to.
 */
const REQUIRED_PERMISSIONS = [
  // Map tiles - OpenStreetMap uses subdomains a/b/c.tile.openstreetmap.org
  'https://*.tile.openstreetmap.org',
  // Reverse geocoding
  'https://nominatim.openstreetmap.org',
];

/**
 * Request remote network permissions from the Host.
 *
 * Should be called early when running inside Triangle.
 * Each pattern triggers a user-facing permission dialog
 * (only on first request — granted permissions are persisted).
 *
 * Failures are silently caught — the map will degrade gracefully.
 */
export async function requestExternalPermissions(): Promise<void> {
  for (const pattern of REQUIRED_PERMISSIONS) {
    try {
      const result = await hostApi.permission({
        tag: 'v1',
        value: { tag: 'ExternalRequest', value: pattern },
      });
      // We don't need to check the result - just requesting is enough.
      // The host persists granted permissions, and denied requests
      // result in graceful degradation (map tiles won't load).
      void result;
    } catch {
      // User denied or host doesn't support this yet
    }
  }
}
