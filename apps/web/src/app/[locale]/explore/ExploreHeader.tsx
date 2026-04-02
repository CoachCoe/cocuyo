'use client';

/**
 * ExploreHeader — Page header with title and illuminate button.
 *
 * Desktop: Shows illuminate button in header.
 * Mobile: Button hidden, FAB is used instead.
 */

import type { ReactElement } from 'react';
import { Button, FireflySymbol } from '@cocuyo/ui';
import { useIlluminate } from '@/hooks/useIlluminate';

export interface ExploreHeaderProps {
  /** Page title */
  title: string;
  /** Page description */
  description: string;
  /** Button label */
  illuminateLabel: string;
}

export function ExploreHeader({
  title,
  description,
  illuminateLabel,
}: ExploreHeaderProps): ReactElement {
  const { openModal } = useIlluminate();

  const handleIlluminate = (): void => {
    openModal();
  };

  return (
    <section className="pt-8 pb-0">
      <div className="container-wide">
        <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{title}</h1>
              <p className="text-secondary text-sm md:text-base max-w-xl">
                {description}
              </p>
            </div>
            <div className="hidden md:block shrink-0">
              <button
                type="button"
                onClick={handleIlluminate}
                className="
                  inline-flex items-center gap-2
                  px-6 py-3
                  bg-[var(--bg-accent-firefly)] text-black
                  font-semibold text-base
                  rounded-lg
                  shadow-glow animate-pulse-subtle
                  hover:brightness-110 hover:scale-[1.02]
                  active:scale-[0.98]
                  transition-all duration-150
                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fg-accent)]
                "
              >
                <FireflySymbol size={18} color="currentColor" />
                {illuminateLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
