'use client';

/**
 * MapClient — Client-side wrapper for the SignalMap.
 *
 * Uses Next.js dynamic import with ssr: false to avoid SSR issues with Leaflet.
 */

import dynamic from 'next/dynamic';
import type { ReactElement } from 'react';
import type { Signal } from '@cocuyo/types';
import type { ChainWithCoords } from './ChainMapMarker';

interface MapClientProps {
  signals: Signal[];
  chains?: ChainWithCoords[];
  onSignalClick?: (signal: Signal) => void;
  onChainClick?: (chain: ChainWithCoords) => void;
  className?: string;
}

// Dynamically import SignalMap with SSR disabled
const SignalMapDynamic = dynamic(
  () => import('./SignalMap').then((mod) => mod.SignalMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center bg-[var(--color-bg-tertiary)] rounded-lg h-full">
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

export function MapClient({
  signals,
  chains,
  onSignalClick,
  onChainClick,
  className = '',
}: MapClientProps): ReactElement {
  return (
    <SignalMapDynamic
      signals={signals}
      {...(chains != null && { chains })}
      {...(onSignalClick != null && { onSignalClick })}
      {...(onChainClick != null && { onChainClick })}
      className={className}
    />
  );
}
