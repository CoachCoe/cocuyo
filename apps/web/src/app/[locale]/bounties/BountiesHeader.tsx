'use client';

/**
 * BountiesHeader — Hero section for the bounties page.
 *
 * Centered, impactful header with large title and description.
 */

import type { ReactElement, ReactNode } from 'react';
import { InfoPopover } from '@cocuyo/ui';
import { useSigner } from '@/lib/context/SignerContext';
import { useCreateBounty } from '@/hooks/useCreateBounty';

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
  /** Create button label */
  createButtonLabel?: string | undefined;
}

export function BountiesHeader({
  title,
  description,
  infoTitle,
  infoBody,
  infoTriggerLabel,
  createButtonLabel,
}: BountiesHeaderProps): ReactElement {
  const showInfo = infoTitle !== undefined && infoBody !== undefined;
  const { isConnected } = useSigner();
  const { openModal } = useCreateBounty();

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

          {/* Info popover - right under description */}
          {showInfo && (
            <div className="mt-3 flex justify-center">
              <InfoPopover
                title={infoTitle}
                position="bottom"
                {...(infoTriggerLabel !== undefined ? { triggerLabel: infoTriggerLabel } : {})}
              >
                {infoBody}
              </InfoPopover>
            </div>
          )}

          {/* Create Bounty button - only shown when connected */}
          {isConnected && createButtonLabel !== undefined && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={openModal}
                className="px-6 py-3 bg-accent text-black font-semibold rounded-nested hover:bg-accent-hover transition-colors"
              >
                {createButtonLabel}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
