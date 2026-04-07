'use client';

/**
 * ExploreHeader — Hero section for the explore page.
 *
 * Centered, impactful header with large title, description, and illuminate button.
 */

import type { ReactElement } from 'react';
import { FireflySymbol } from '@cocuyo/ui';
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
    <section className="pt-16 pb-8">
      <div className="container-wide">
        <div className="text-center max-w-2xl mx-auto">
          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-primary mb-4">
            {title}
          </h1>

          {/* Description */}
          <p className="text-lg text-secondary leading-relaxed mb-8">
            {description}
          </p>

          {/* Illuminate button */}
          <button
            type="button"
            onClick={handleIlluminate}
            className="
              inline-flex items-center gap-2
              px-8 py-3.5
              bg-[var(--bg-accent-firefly)] text-black
              font-semibold text-base
              rounded-full
              shadow-glow animate-pulse-subtle
              hover:brightness-110 hover:scale-[1.02]
              active:scale-[0.98]
              transition-all duration-150
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fg-accent)]
            "
          >
            <FireflySymbol size={18} color="inherit" />
            {illuminateLabel}
          </button>
        </div>
      </div>
    </section>
  );
}
