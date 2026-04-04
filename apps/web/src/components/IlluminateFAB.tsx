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
      {/* Firefly icon - stylized light burst */}
      <svg
        className="w-6 h-6 group-hover:scale-110 transition-transform"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {/* Central light */}
        <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
        {/* Light rays */}
        <line x1="12" y1="2" x2="12" y2="6" />
        <line x1="12" y1="18" x2="12" y2="22" />
        <line x1="2" y1="12" x2="6" y2="12" />
        <line x1="18" y1="12" x2="22" y2="12" />
        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
        <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
        <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
        <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
      </svg>
    </button>
  );
}
