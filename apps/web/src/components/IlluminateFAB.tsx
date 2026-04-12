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
      className="animate-pulse-glow group fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-firefly-gold)] text-[var(--bg-primary)] shadow-[0_4px_20px_rgba(232,185,49,0.4)] transition-all duration-200 ease-out hover:scale-110 hover:shadow-[0_4px_30px_rgba(232,185,49,0.6)] active:scale-100 active:shadow-[0_2px_10px_rgba(232,185,49,0.3)]"
      aria-label={label}
      title={label}
    >
      {/* Firefly diamond icon - matches branding */}
      <span
        className="text-2xl leading-none transition-transform group-hover:scale-110"
        aria-hidden="true"
      >
        ✦
      </span>
    </button>
  );
}
