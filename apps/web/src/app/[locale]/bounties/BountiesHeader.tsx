'use client';

/**
 * BountiesHeader — Hero section for the bounties page.
 *
 * Centered, impactful header with large title and description.
 */

import type { ReactElement, ReactNode } from 'react';
import { InfoPopover } from '@cocuyo/ui';

export interface BountiesHeaderProps {
  /** Page title */
  title: string;
  /** Page description */
  description: string;
  /** Info popover title */
  infoTitle?: string | undefined;
  /** Info popover content */
  infoBody?: ReactNode | undefined;
  /** Info trigger label */
  infoTriggerLabel?: string | undefined;
}

export function BountiesHeader({
  title,
  description,
  infoTitle,
  infoBody,
  infoTriggerLabel,
}: BountiesHeaderProps): ReactElement {
  const showInfo = infoTitle !== undefined && infoBody !== undefined;

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

          {/* Info popover */}
          {showInfo && (
            <div className="mt-4 flex justify-center">
              <InfoPopover
                title={infoTitle}
                position="bottom"
                {...(infoTriggerLabel !== undefined ? { triggerLabel: infoTriggerLabel } : {})}
              >
                {infoBody}
              </InfoPopover>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
