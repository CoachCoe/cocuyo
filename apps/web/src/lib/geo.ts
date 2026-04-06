/**
 * Geo utilities for map functionality.
 *
 * Provides reverse geocoding via Nominatim (OpenStreetMap)
 * and distance calculations via Haversine formula.
 *
 * When running inside Triangle, requests external network permission
 * via the Host API before making geocoding requests.
 */

import { canMakeExternalRequests, isInContainer } from './host/detect';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse';
const NOMINATIM_DOMAIN = 'nominatim.openstreetmap.org';

// Track if we've already been granted permission for the session
let nominatimPermissionGranted = false;

/**
 * Request permission to make external requests to Nominatim.
 * Only needed when running inside Triangle.
 */
async function requestNominatimPermission(): Promise<boolean> {
  if (nominatimPermissionGranted) {
    return true;
  }

  try {
    const { hostApi } = await import('@novasamatech/product-sdk');
    // The SDK uses versioned enums: { tag: "v1", value: { tag: "ExternalRequest", value: domain } }
    const result = await hostApi.permission({
      tag: 'v1',
      value: {
        tag: 'ExternalRequest',
        value: NOMINATIM_DOMAIN,
      },
    });

    // Result is { tag: "v1", value: boolean } when successful
    if (result.isOk() && result.value.value) {
      nominatimPermissionGranted = true;
      return true;
    }
    return false;
  } catch {
    // Host API not available or permission denied
    return false;
  }
}

export interface GeoLocation {
  lat: number;
  lon: number;
}

export interface ReverseGeocodeResult {
  city: string | null;
  country: string | null;
  displayName: string;
}

/**
 * Reverse geocode coordinates to a location name.
 * Uses Nominatim (OpenStreetMap's free geocoding service).
 *
 * When running inside Triangle, requests external network permission
 * via the Host API. Returns null if permission is denied or unavailable.
 */
export async function reverseGeocode(
  lat: number,
  lon: number
): Promise<ReverseGeocodeResult | null> {
  // Outside Triangle, network is always available
  // Inside Triangle, request permission via Host API
  if (!canMakeExternalRequests()) {
    if (!isInContainer()) {
      // Not in Triangle and can't make requests - something is wrong
      return null;
    }
    // Inside Triangle - request permission
    const hasPermission = await requestNominatimPermission();
    if (!hasPermission) {
      return null;
    }
  }

  try {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
      format: 'json',
    });

    const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
      headers: {
        'User-Agent': 'FireflyNetwork/1.0',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as {
      address?: {
        city?: string;
        town?: string;
        village?: string;
        municipality?: string;
        country?: string;
      };
      display_name?: string;
    };

    const address = data.address;
    const city =
      address?.city ??
      address?.town ??
      address?.village ??
      address?.municipality ??
      null;

    return {
      city,
      country: address?.country ?? null,
      displayName: data.display_name ?? '',
    };
  } catch {
    return null;
  }
}

/**
 * Calculate distance between two points using Haversine formula.
 * Returns distance in kilometers.
 */
export function calculateDistance(
  point1: GeoLocation,
  point2: GeoLocation
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(point2.lat - point1.lat);
  const dLon = toRadians(point2.lon - point1.lon);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.lat)) *
      Math.cos(toRadians(point2.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format a location for display.
 */
export function formatLocation(result: ReverseGeocodeResult): string {
  if (result.city !== null && result.country !== null) {
    return `${result.city}, ${result.country}`;
  }
  if (result.city !== null) {
    return result.city;
  }
  if (result.country !== null) {
    return result.country;
  }
  return result.displayName;
}
