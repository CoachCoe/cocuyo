/**
 * Host API permissions
 *
 * Requests network and device permissions from Triangle sandbox.
 * The sandbox blocks all external HTTP(S) and device access by default —
 * products must request permission via the Host API, which prompts the user.
 *
 * Once granted, permissions persist in the host's storage.
 *
 * Pattern rules (from Host API spec):
 * - Protocol must match exactly (https://)
 * - "*" matches exactly one DNS label (single-level subdomain)
 * - Path "/" matches any path on the domain
 */

import { hostApi } from '@novasamatech/product-sdk';

import { isHosted } from './detect';

// ═══ Network permissions ═══

/**
 * URL patterns that Firefly Network needs access to.
 */
const NETWORK_PERMISSIONS = [
  // Map tiles - CARTO basemaps (used by Triangle)
  'https://basemaps.cartocdn.com/',
  // Reverse geocoding
  'https://nominatim.openstreetmap.org/',
  // AI claim extraction worker
  'https://claim-extractor.cocuyo.workers.dev/',
];

// ═══ Device permissions ═══

type DevicePermission = 'Camera' | 'Microphone' | 'Location';

const DEVICE_PERMISSIONS: DevicePermission[] = [
  'Location', // Geolocation for map/distance
];

/**
 * Request all permissions from the Host on startup.
 * Runs in parallel so it doesn't block app init.
 *
 * Note: TransactionSubmit is NOT requested here — it's requested on-demand
 * when the first Bulletin upload is attempted, to avoid unnecessary prompts.
 */
export async function requestExternalPermissions(): Promise<void> {
  const all = [
    ...NETWORK_PERMISSIONS.map((pattern) => requestNetwork(pattern)),
    ...DEVICE_PERMISSIONS.map((device) => requestDevice(device)),
  ];
  await Promise.allSettled(all);
}

async function requestNetwork(pattern: string): Promise<void> {
  try {
    const result = hostApi.permission({
      tag: 'v1',
      value: { tag: 'ExternalRequest', value: pattern },
    });
    // Wait for permission dialog to complete - we don't need to check result
    // The host persists granted permissions, denied ones degrade gracefully
    await result.match(
      () => undefined,
      () => undefined
    );
  } catch {
    // User denied or host doesn't support this
  }
}

/**
 * Request blanket permission for transaction submissions (preimages).
 * Once granted, bulletin uploads won't prompt for each transaction.
 *
 * Called on-demand before the first Bulletin upload, not at startup.
 */
export async function requestTransactionSubmit(): Promise<void> {
  try {
    const result = hostApi.permission({
      tag: 'v1',
      value: { tag: 'TransactionSubmit', value: undefined },
    });
    await result.match(
      () => undefined,
      () => undefined
    );
  } catch {
    // User denied or host doesn't support this
  }
}

async function requestDevice(device: DevicePermission): Promise<void> {
  try {
    const result = hostApi.devicePermission({
      tag: 'v1',
      value: device,
    });
    // Wait for permission dialog to complete
    await result.match(
      () => undefined,
      () => undefined
    );
  } catch {
    // User denied or host doesn't support this
  }
}

// ═══ Safe browser API wrappers ═══

/**
 * Get user's geolocation — requests Host API permission first if in Triangle.
 * Use this instead of navigator.geolocation.getCurrentPosition() directly.
 *
 * @throws Error if geolocation is not available
 */
export async function getGeolocation(options?: PositionOptions): Promise<GeolocationPosition> {
  if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
    throw new Error('Geolocation not available');
  }

  if (isHosted()) {
    await requestDevice('Location');
  }

  return new Promise<GeolocationPosition>((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, options)
  );
}
