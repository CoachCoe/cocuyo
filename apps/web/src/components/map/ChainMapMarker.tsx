'use client';

/**
 * ChainMapMarker — Map marker for a story chain.
 *
 * Chains are displayed as larger rings/circles to distinguish from signals.
 * The position is derived from the centroid of the chain's signals.
 */

import { useEffect, useRef, type ReactElement } from 'react';
import { CircleMarker, Popup } from 'react-leaflet';
import type { CircleMarker as LeafletCircleMarker } from 'leaflet';

export interface ChainWithCoords {
  id: string;
  title: string;
  description: string;
  topics: readonly string[];
  status: string;
  signalCount: number;
  totalCorroborations: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

interface ChainMapMarkerProps {
  chain: ChainWithCoords;
  onClick?: (chain: ChainWithCoords) => void;
}

// Chain marker color - using corroboration green to distinguish from signals
const CHAIN_COLOR = '#4ADE80';
const CHAIN_COLOR_DIM = 'rgba(74, 222, 128, 0.3)';

export function ChainMapMarker({
  chain,
  onClick,
}: ChainMapMarkerProps): ReactElement {
  const markerRef = useRef<LeafletCircleMarker>(null);

  useEffect(() => {
    // Add hover effect
    const marker = markerRef.current;
    if (marker == null) return;

    const handleMouseOver = (): void => {
      marker.setStyle({ fillOpacity: 0.6, weight: 3 });
    };

    const handleMouseOut = (): void => {
      marker.setStyle({ fillOpacity: 0.3, weight: 2 });
    };

    marker.on('mouseover', handleMouseOver);
    marker.on('mouseout', handleMouseOut);

    return () => {
      marker.off('mouseover', handleMouseOver);
      marker.off('mouseout', handleMouseOut);
    };
  }, []);

  const handleClick = (): void => {
    if (onClick != null) {
      onClick(chain);
    }
  };

  return (
    <CircleMarker
      ref={markerRef}
      center={[chain.coordinates.latitude, chain.coordinates.longitude]}
      radius={20}
      pathOptions={{
        color: CHAIN_COLOR,
        fillColor: CHAIN_COLOR_DIM,
        fillOpacity: 0.3,
        weight: 2,
      }}
      eventHandlers={{
        click: handleClick,
      }}
    >
      <Popup className="signal-popup">
        <div className="min-w-[200px] max-w-[280px]">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="w-3 h-3 rounded-full border-2"
              style={{ borderColor: CHAIN_COLOR, backgroundColor: CHAIN_COLOR_DIM }}
            />
            <span className="text-xs text-[#666] uppercase tracking-wide">
              Story Chain
            </span>
          </div>
          <h3 className="font-semibold text-[#111] text-sm mb-2 leading-tight">
            {chain.title}
          </h3>
          <p className="text-[#444] text-xs mb-3 line-clamp-2">
            {chain.description}
          </p>
          <div className="flex flex-wrap gap-1 mb-3">
            {chain.topics.slice(0, 3).map((topic) => (
              <span
                key={topic}
                className="px-1.5 py-0.5 text-[10px] bg-[#f0f0f0] text-[#444] rounded"
              >
                {topic}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#666]">
              <span className="text-[#111] font-medium">{chain.signalCount}</span> signals
            </span>
            <span style={{ color: CHAIN_COLOR }}>
              {chain.totalCorroborations} corroborations
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              window.location.href = `/chain/${chain.id}`;
            }}
            className="mt-3 w-full px-3 py-1.5 text-xs rounded border transition-colors"
            style={{ borderColor: CHAIN_COLOR, color: CHAIN_COLOR }}
          >
            View Chain
          </button>
        </div>
      </Popup>
    </CircleMarker>
  );
}
