'use client';

/**
 * BountiesHeader — Hero section for the bounties page.
 *
 * Clean, impactful header with title, description, and subtle visual flair.
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
    <section className="pt-12 pb-8">
      <div className="container-wide">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className="
              shrink-0 w-12 h-12 rounded-xl
              flex items-center justify-center
              bg-gradient-to-br from-[var(--color-firefly-gold)]/20 to-[var(--color-firefly-gold)]/5
              border border-[var(--color-firefly-gold)]/30
            "
          >
            <FireflySymbol size={24} color="gold" />
          </div>

          {/* Text */}
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-display font-bold text-primary">
              {title}
            </h1>
            <p className="text-secondary max-w-2xl leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
