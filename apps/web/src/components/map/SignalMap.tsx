'use client';

/**
 * SignalMap — Leaflet map component for displaying signals and chains geographically.
 *
 * Uses dark map tiles to match the Firefly Network aesthetic.
 * Signals are shown as small gold dots, chains as larger green rings.
 */

import { useState, useEffect, type ReactElement } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Signal } from '@cocuyo/types';
import { SignalMapMarker } from './SignalMapMarker';
import { ChainMapMarker, type ChainWithCoords } from './ChainMapMarker';

// Import Leaflet CSS from node_modules
import 'leaflet/dist/leaflet.css';

// Fix for Leaflet default icon issue
delete (L.Icon.Default.prototype as { _getIconUrl?: () => string })._getIconUrl;

interface SignalMapProps {
  signals: Signal[];
  chains?: ChainWithCoords[];
  onSignalClick?: (signal: Signal) => void;
  onChainClick?: (chain: ChainWithCoords) => void;
  className?: string;
}

/**
 * Component to invalidate map size on mount and fit bounds to markers.
 */
function MapController({
  signals,
  chains,
  showSignals,
  showChains,
}: {
  signals: Signal[];
  chains: ChainWithCoords[];
  showSignals: boolean;
  showChains: boolean;
}): null {
  const map = useMap();

  // Invalidate map size on mount to fix rendering issues
  useEffect(() => {
    // Small delay to ensure container is fully rendered
    const timeout = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => clearTimeout(timeout);
  }, [map]);

  // Fit bounds to markers
  useEffect(() => {
    const points: [number, number][] = [];

    if (showSignals) {
      signals
        .filter((s) => s.context.location != null)
        .forEach((s) => {
          points.push([s.context.location!.latitude, s.context.location!.longitude]);
        });
    }

    if (showChains) {
      chains.forEach((c) => {
        points.push([c.coordinates.latitude, c.coordinates.longitude]);
      });
    }

    if (points.length === 0) {
      // Default view: US centered
      map.setView([39.8283, -98.5795], 4);
      return;
    }

    if (points.length === 1) {
      const point = points[0];
      if (point != null) {
        map.setView(point, 10);
      }
      return;
    }

    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [map, signals, chains, showSignals, showChains]);

  return null;
}

export function SignalMap({
  signals,
  chains = [],
  onSignalClick,
  onChainClick,
  className = '',
}: SignalMapProps): ReactElement {
  const [showSignals, setShowSignals] = useState(true);
  const [showChains, setShowChains] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure client-side rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filter signals that have coordinates
  const signalsWithCoords = signals.filter((s) => s.context.location != null);

  const hasContent = signalsWithCoords.length > 0 || chains.length > 0;
  const visibleSignals = showSignals ? signalsWithCoords.length : 0;
  const visibleChains = showChains ? chains.length : 0;

  // Show loading state until mounted
  if (!isMounted) {
    return (
      <div className={`relative ${className}`}>
        <div className="flex items-center justify-center bg-[var(--color-bg-tertiary)] rounded-lg h-full">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[var(--color-text-secondary)]">
              Loading map...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <MapContainer
        center={[39.8283, -98.5795]}
        zoom={4}
        style={{ height: '100%', width: '100%' }}
        className="z-0 rounded-lg"
        zoomControl={false}
      >
        {/* Map tiles - OpenStreetMap */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Chain markers (render first so signals appear on top) */}
        {showChains &&
          chains.map((chain) => (
            <ChainMapMarker
              key={chain.id}
              chain={chain}
              {...(onChainClick != null && { onClick: onChainClick })}
            />
          ))}

        {/* Signal markers */}
        {showSignals &&
          signalsWithCoords.map((signal) => (
            <SignalMapMarker
              key={signal.id}
              signal={signal}
              {...(onSignalClick != null && { onClick: onSignalClick })}
            />
          ))}

        {/* Map controller for size invalidation and bounds fitting */}
        <MapController
          signals={signals}
          chains={chains}
          showSignals={showSignals}
          showChains={showChains}
        />
      </MapContainer>

      {/* Empty state overlay */}
      {!hasContent && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-bg-tertiary)]/80 rounded-lg">
          <p className="text-[var(--color-text-secondary)] text-center px-4">
            No signals or chains with location data to display.
          </p>
        </div>
      )}

      {/* Layer toggles */}
      <div className="absolute top-4 left-4 z-[1000] p-3 bg-white border border-[#222] rounded-lg shadow-md">
        <p className="text-xs text-[#666] mb-3 font-medium">
          Show on map
        </p>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showSignals}
              onChange={(e) => setShowSignals(e.target.checked)}
              className="w-4 h-4 rounded border-[#ccc] bg-white accent-[#E8B931]"
            />
            <span className="flex items-center gap-2 text-sm text-[#111]">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: '#E8B931' }}
              />
              Signals ({signalsWithCoords.length})
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showChains}
              onChange={(e) => setShowChains(e.target.checked)}
              className="w-4 h-4 rounded border-[#ccc] bg-white accent-[#4ADE80]"
            />
            <span className="flex items-center gap-2 text-sm text-[#111]">
              <span
                className="w-3 h-3 rounded-full border-2"
                style={{
                  borderColor: '#4ADE80',
                  backgroundColor: 'rgba(74, 222, 128, 0.3)',
                }}
              />
              Story Chains ({chains.length})
            </span>
          </label>
        </div>
      </div>

      {/* Count display */}
      <div className="absolute top-4 right-4 z-[1000] px-3 py-2 bg-white border border-[#222] rounded-lg shadow-md">
        <p className="text-sm text-[#111]">
          <span className="text-[#E8B931] font-medium">{visibleSignals}</span>
          {' '}signal{visibleSignals !== 1 ? 's' : ''}
          {visibleChains > 0 && (
            <>
              {', '}
              <span className="text-[#4ADE80] font-medium">{visibleChains}</span>
              {' '}chain{visibleChains !== 1 ? 's' : ''}
            </>
          )}
        </p>
      </div>
    </div>
  );
}
