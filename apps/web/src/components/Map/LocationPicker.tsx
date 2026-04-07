'use client';

/**
 * LocationPicker — Location selection with map or manual input.
 *
 * Automatically falls back to manual input when:
 * - Running inside Triangle (network restricted)
 * - Map fails to load
 * - User prefers manual input
 */

import {
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import dynamic from 'next/dynamic';
import { canMakeExternalRequests } from '@/lib/host/detect';
import { reverseGeocode, formatLocation, type GeoLocation } from '@/lib/geo';
import { ManualLocationInput } from './ManualLocationInput';

// Dynamic import with SSR disabled - Leaflet requires window
const BaseMap = dynamic(
  () => import('./BaseMap').then((m) => m.BaseMap),
  { ssr: false }
);

export interface LocationPickerValue {
  coordinates: GeoLocation | undefined;
  locationName: string;
}

interface LocationPickerProps {
  value: LocationPickerValue;
  onChange: (value: LocationPickerValue) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

type InputMode = 'auto' | 'map' | 'manual';

/**
 * Loading spinner for map.
 */
function MapLoader(): ReactNode {
  return (
    <div className="h-64 bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-lg flex items-center justify-center">
      <div className="flex flex-col items-center gap-2 text-[var(--fg-tertiary)]">
        <svg
          className="w-8 h-8 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        <span className="text-sm">Loading map...</span>
      </div>
    </div>
  );
}

export function LocationPicker({
  value,
  onChange,
  label = 'Location',
  placeholder = 'Click map or enter location',
  disabled = false,
}: LocationPickerProps): ReactNode {
  const [mode, setMode] = useState<InputMode>('auto');
  const [mapAvailable, setMapAvailable] = useState<boolean | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Determine if map should be available (requires network for tile loading)
  useEffect(() => {
    setMapAvailable(canMakeExternalRequests());
  }, []);

  // Handle map click - reverse geocode the location
  const handleMapClick = useCallback(
    async (location: GeoLocation): Promise<void> => {
      if (disabled) return;

      setIsGeocoding(true);

      try {
        const result = await reverseGeocode(location.lat, location.lon);
        const locationName = result ? formatLocation(result) : '';

        onChange({
          coordinates: location,
          locationName,
        });
      } catch {
        // If geocoding fails, still set coordinates
        onChange({
          coordinates: location,
          locationName: '',
        });
      } finally {
        setIsGeocoding(false);
      }
    },
    [disabled, onChange]
  );

  // Handle manual input change
  const handleManualChange = useCallback(
    (locationName: string): void => {
      onChange({
        coordinates: undefined,
        locationName,
      });
    },
    [onChange]
  );

  // Determine effective mode
  const effectiveMode =
    mode === 'auto' ? (mapAvailable === true ? 'map' : 'manual') : mode;

  // Still checking availability
  if (mapAvailable === null) {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-[var(--fg-primary)]">
            {label}
          </label>
        )}
        <MapLoader />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Label and mode toggle */}
      <div className="flex items-center justify-between">
        {label && (
          <label className="block text-sm font-medium text-[var(--fg-primary)]">
            {label}
          </label>
        )}

        {mapAvailable && (
          <div className="flex gap-1 text-xs">
            <button
              type="button"
              onClick={() => setMode(effectiveMode === 'map' ? 'manual' : 'map')}
              className="px-2 py-1 rounded text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-surface-nested)] transition-colors"
            >
              {effectiveMode === 'map' ? 'Type instead' : 'Use map'}
            </button>
          </div>
        )}
      </div>

      {/* Map view */}
      {effectiveMode === 'map' && (
        <div className="space-y-2">
          <BaseMap
            center={value.coordinates ?? { lat: 20, lon: 0 }}
            zoom={value.coordinates ? 12 : 2}
            onClick={(loc) => void handleMapClick(loc)}
            markers={
              value.coordinates
                ? [
                    {
                      id: 'selected',
                      position: value.coordinates,
                      color: 'gold',
                    },
                  ]
                : []
            }
            className="h-64"
          />

          {/* Show geocoded name or loading state */}
          {value.coordinates && (
            <div className="flex items-center gap-2 text-sm">
              <svg
                className="w-4 h-4 text-[var(--fg-tertiary)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
              </svg>
              {isGeocoding ? (
                <span className="text-[var(--fg-tertiary)]">
                  Looking up location...
                </span>
              ) : value.locationName ? (
                <span className="text-[var(--fg-primary)]">
                  {value.locationName}
                </span>
              ) : (
                <span className="text-[var(--fg-tertiary)]">
                  {value.coordinates.lat.toFixed(4)}, {value.coordinates.lon.toFixed(4)}
                </span>
              )}
            </div>
          )}

          <p className="text-xs text-[var(--fg-tertiary)]">
            Click the map to select a location
          </p>
        </div>
      )}

      {/* Manual input view */}
      {effectiveMode === 'manual' && (
        <ManualLocationInput
          value={value.locationName}
          onChange={handleManualChange}
          placeholder={placeholder}
          disabled={disabled}
          helpText={
            !mapAvailable
              ? 'Map unavailable in this environment. Enter location manually.'
              : undefined
          }
        />
      )}
    </div>
  );
}
