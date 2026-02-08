'use client';

/**
 * ExploreView — Client component with list/map view toggle for the entire explore page.
 */

import { useState, useMemo, type ReactElement, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import type { Signal, StoryChain } from '@cocuyo/types';
import type { ChainWithCoords } from '@/components/map/ChainMapMarker';

// Dynamically import MapClient with SSR disabled
const MapClient = dynamic(
  () => import('@/components/map/MapClient').then((mod) => mod.MapClient),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center bg-[var(--color-bg-tertiary)] rounded-lg h-[600px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[var(--color-text-secondary)]">
            Loading map...
          </p>
        </div>
      </div>
    ),
  }
);

interface ExploreViewProps {
  signals: Signal[];
  chains: StoryChain[];
  children: ReactNode; // The list view content (Active Story Chains + Recent Signals)
}

type ViewMode = 'list' | 'map';

/**
 * Compute the centroid (average position) from a list of coordinates.
 */
function computeCentroid(
  coords: Array<{ latitude: number; longitude: number }>
): { latitude: number; longitude: number } | null {
  if (coords.length === 0) return null;

  const sum = coords.reduce(
    (acc, c) => ({
      latitude: acc.latitude + c.latitude,
      longitude: acc.longitude + c.longitude,
    }),
    { latitude: 0, longitude: 0 }
  );

  return {
    latitude: sum.latitude / coords.length,
    longitude: sum.longitude / coords.length,
  };
}

export function ExploreView({
  signals,
  chains,
  children,
}: ExploreViewProps): ReactElement {
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Count signals with coordinates
  const signalsWithCoords = signals.filter((s) => s.context.location != null);

  // Compute chain positions from their linked signals' coordinates
  const chainsWithCoords = useMemo((): ChainWithCoords[] => {
    const mapped = chains.map((chain) => {
      // Find signals that belong to this chain
      const chainSignals = signals.filter((s) =>
        s.chainLinks.some((link) => link === chain.id)
      );

      // Get coordinates from those signals
      const coords = chainSignals
        .filter((s) => s.context.location != null)
        .map((s) => s.context.location!);

      const centroid = computeCentroid(coords);

      if (centroid == null) return null;

      return {
        id: chain.id as string,
        title: chain.title,
        description: chain.description,
        topics: chain.topics,
        status: chain.status as string,
        signalCount: chain.stats.signalCount,
        totalCorroborations: chain.stats.totalCorroborations,
        coordinates: centroid,
      } as ChainWithCoords;
    });

    return mapped.filter((c): c is ChainWithCoords => c != null);
  }, [chains, signals]);

  const totalMapItems = signalsWithCoords.length + chainsWithCoords.length;

  return (
    <>
      {/* View Toggle */}
      <section className="py-6 border-b border-[var(--color-border-default)]">
        <div className="container-wide">
          <span className="text-sm text-[var(--color-text-tertiary)] block mb-3">
            View:
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-4 py-2.5 text-sm rounded-lg border transition-colors flex items-center gap-2 ${
                viewMode === 'list'
                  ? 'bg-[var(--color-bg-elevated)] border-[var(--color-border-emphasis)] text-[var(--color-text-primary)]'
                  : 'border-[var(--color-border-default)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-emphasis)] hover:text-[var(--color-text-primary)]'
              }`}
              aria-pressed={viewMode === 'list'}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
              List
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`px-4 py-2.5 text-sm rounded-lg border transition-colors flex items-center gap-2 ${
                viewMode === 'map'
                  ? 'bg-[var(--color-bg-elevated)] border-[var(--color-border-emphasis)] text-[var(--color-text-primary)]'
                  : 'border-[var(--color-border-default)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-emphasis)] hover:text-[var(--color-text-primary)]'
              }`}
              aria-pressed={viewMode === 'map'}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
              Map
              {totalMapItems > 0 && (
                <span className="text-xs text-[var(--color-accent)]">
                  ({totalMapItems})
                </span>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Content */}
      {viewMode === 'list' ? (
        children
      ) : (
        <section className="py-12">
          <div className="container-wide">
            <div className="h-[600px] md:h-[700px]">
              <MapClient
                signals={signals}
                chains={chainsWithCoords}
                onSignalClick={(signal) => {
                  if (signal.chainLinks.length > 0) {
                    window.location.href = `/chain/${signal.chainLinks[0]}`;
                  }
                }}
                onChainClick={(chain) => {
                  window.location.href = `/chain/${chain.id}`;
                }}
                className="h-full rounded-lg"
              />
            </div>
          </div>
        </section>
      )}
    </>
  );
}
