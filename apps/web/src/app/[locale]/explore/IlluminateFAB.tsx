'use client';

/**
 * IlluminateFAB — Mobile floating action button for illuminating signals.
 *
 * Fixed position in bottom-right corner on mobile devices.
 * Hidden on desktop where the header button is used instead.
 */

import type { ReactElement } from 'react';
import { FireflySymbol } from '@cocuyo/ui';
import { useIlluminate } from '@/hooks/useIlluminate';

export interface IlluminateFABProps {
  /** Accessible label */
  'aria-label'?: string;
}

export function IlluminateFAB({
  'aria-label': ariaLabel = 'Illuminate a new signal',
}: IlluminateFABProps): ReactElement {
  const { openModal } = useIlluminate();

  const handleClick = (): void => {
    openModal();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="
        fixed bottom-6 right-6 z-50
        flex items-center justify-center
        w-14 h-14 rounded-full
        bg-[var(--bg-accent-firefly)] text-black
        shadow-glow
        hover:scale-105 hover:brightness-110
        active:scale-95
        transition-all duration-150
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fg-accent)]
        md:hidden
      "
      aria-label={ariaLabel}
    >
      <FireflySymbol size={24} color="inherit" aria-hidden="true" />
    </button>
  );
}
