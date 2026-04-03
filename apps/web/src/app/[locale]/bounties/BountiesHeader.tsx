'use client';

/**
 * BountiesHeader — Hero section for the bounties page.
 *
 * Centered, impactful header with large title and description.
 */

import type { ReactElement } from 'react';
import { FireflySymbol } from '@cocuyo/ui';

export interface BountiesHeaderProps {
  /** Page title */
  title: string;
  /** Page description */
  description: string;
}

export function BountiesHeader({
  title,
  description,
}: BountiesHeaderProps): ReactElement {
  return (
    <section className="pt-16 pb-8">
      <div className="container-wide">
        <div className="text-center max-w-2xl mx-auto">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div
              className="
                w-14 h-14 rounded-2xl
                flex items-center justify-center
                bg-gradient-to-br from-[var(--color-firefly-gold)]/20 to-[var(--color-firefly-gold)]/5
                border border-[var(--color-firefly-gold)]/30
              "
            >
              <FireflySymbol size={28} color="gold" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-primary mb-4">
            {title}
          </h1>

          {/* Description */}
          <p className="text-lg text-secondary leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}
