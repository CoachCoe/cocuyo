'use client';

/**
 * IlluminateFAB — Floating action button for illuminating signals.
 *
 * A glowing firefly-gold button that floats at the bottom-right of the screen.
 * Pulses gently to draw attention without being distracting.
 */

import type { ReactElement } from 'react';
import { useIlluminate } from '@/hooks/useIlluminate';
import { useSigner } from '@/hooks';

export interface IlluminateFABProps {
  /** Optional label for accessibility */
  label?: string;
}

export function IlluminateFAB({
  label = 'Illuminate a signal',
}: IlluminateFABProps): ReactElement | null {
  const { openModal } = useIlluminate();
  const { isConnected } = useSigner();

  // Don't show FAB if not connected
  if (!isConnected) {
    return null;
  }

  const handleClick = (): void => {
    openModal();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="
        fixed bottom-6 right-6 z-50
        w-14 h-14 rounded-full
        bg-[var(--color-firefly-gold)] text-[var(--bg-primary)]
        shadow-[0_4px_20px_rgba(232,185,49,0.4)]
        hover:shadow-[0_4px_30px_rgba(232,185,49,0.6)]
        hover:scale-110
        active:scale-100 active:shadow-[0_2px_10px_rgba(232,185,49,0.3)]
        transition-all duration-200 ease-out
        flex items-center justify-center
        animate-pulse-glow
        group
      "
      aria-label={label}
      title={label}
    >
      {/* Firefly diamond icon - matches branding */}
      <span
        className="text-2xl leading-none group-hover:scale-110 transition-transform"
        aria-hidden="true"
      >
        ✦
      </span>
    </button>
  );
}
