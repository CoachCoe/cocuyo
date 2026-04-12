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
    <section className="pb-8 pt-16">
      <div className="container-wide">
        <div className="mx-auto max-w-2xl text-center">
          {/* Title */}
          <h1 className="mb-4 font-display text-3xl font-bold text-primary md:text-4xl lg:text-5xl">
            {title}
          </h1>

          {/* Description */}
          <p className="mb-8 text-lg leading-relaxed text-secondary">{description}</p>

          {/* Illuminate button */}
          <button
            type="button"
            onClick={handleIlluminate}
            className="animate-pulse-subtle inline-flex items-center gap-2 rounded-full bg-[var(--bg-accent-firefly)] px-8 py-3.5 text-base font-semibold text-black shadow-glow transition-all duration-150 hover:scale-[1.02] hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fg-accent)] active:scale-[0.98]"
          >
            <FireflySymbol size={18} color="inherit" />
            {illuminateLabel}
          </button>
        </div>
      </div>
    </section>
  );
}
