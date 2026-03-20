'use client';

/**
 * ExploreView — Client component for the explore page.
 *
 * Provides toggle between list view and map view.
 * Map uses bundled TopoJSON data — no external tile servers.
 */

import { useState, type ReactElement, type ReactNode } from 'react';
import { D3WorldMap, type MapMarker } from '@/components/map';

type ViewMode = 'list' | 'map';

interface ExploreViewProps {
  children: ReactNode;
  markers?: MapMarker[];
}

export function ExploreView({ children, markers = [] }: ExploreViewProps): ReactElement {
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  return (
    <>
      {/* View Toggle */}
      <section className="py-6 border-b border-DEFAULT">
        <div className="container-wide">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm rounded-nested border transition-colors ${
                viewMode === 'list'
                  ? 'border-emphasis bg-surface-nested text-primary'
                  : 'border-DEFAULT bg-transparent text-secondary hover:text-primary hover:border-emphasis'
              }`}
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
              className={`flex items-center gap-2 px-4 py-2.5 text-sm rounded-nested border transition-colors ${
                viewMode === 'map'
                  ? 'border-emphasis bg-surface-nested text-primary'
                  : 'border-DEFAULT bg-transparent text-secondary hover:text-primary hover:border-emphasis'
              }`}
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
            </button>
          </div>
        </div>
      </section>

      {/* Content */}
      {viewMode === 'list' ? (
        children
      ) : (
        <section className="h-[calc(100vh-280px)] min-h-[400px]">
          <D3WorldMap
            markers={markers}
            interactive={true}
            onMarkerClick={(marker) => {
              window.location.href = `/signal/${marker.id}`;
            }}
          />
        </section>
      )}
    </>
  );
}
