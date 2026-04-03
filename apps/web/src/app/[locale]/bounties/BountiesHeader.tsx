'use client';

/**
 * BountiesHeader — Hero section for the bounties page.
 *
 * Centered, impactful header with large title and description.
 */

import type { ReactElement } from 'react';

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
