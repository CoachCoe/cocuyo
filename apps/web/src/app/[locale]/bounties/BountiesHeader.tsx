'use client';

/**
 * BountiesHeader — Header section for the bounties page.
 *
 * Shows title and description.
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
    <section className="pt-16 pb-4">
      <div className="container-wide">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-primary mb-2">
              {title}
            </h1>
            <p className="text-secondary max-w-xl">
              {description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
