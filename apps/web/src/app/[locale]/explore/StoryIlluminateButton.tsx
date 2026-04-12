'use client';

/**
 * StoryIlluminateButton — Firefly button to illuminate a signal linked to a story.
 *
 * Opens the IlluminateModal with the chain pre-selected.
 * Visible on hover (desktop) or always (mobile) for touch accessibility.
 */

import type { ReactElement } from 'react';
import { FireflySymbol } from '@cocuyo/ui';
import { useIlluminate } from '@/hooks/useIlluminate';
import type { ChainId } from '@cocuyo/types';

export interface StoryIlluminateButtonProps {
  /** Chain ID to pre-select when opening the modal */
  chainId: ChainId;
  /** Accessible label */
  'aria-label'?: string;
}

export function StoryIlluminateButton({
  chainId,
  'aria-label': ariaLabel = 'Add signal to this story',
}: StoryIlluminateButtonProps): ReactElement {
  const { openModal } = useIlluminate();

  const handleClick = (event: React.MouseEvent): void => {
    event.preventDefault();
    event.stopPropagation();
    openModal({ chainId });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="hover:bg-[var(--bg-accent-firefly)]/10 rounded-nested p-2 text-tertiary opacity-0 transition-all duration-150 hover:text-[var(--fg-accent)] focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--fg-accent)] group-hover:opacity-100 sm:opacity-100 md:opacity-0 md:group-hover:opacity-100"
      aria-label={ariaLabel}
    >
      <FireflySymbol size={14} color="inherit" aria-hidden="true" />
    </button>
  );
}
