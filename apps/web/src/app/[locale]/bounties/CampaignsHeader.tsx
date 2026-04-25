'use client';

/**
 * CampaignsHeader — Page header with info popover.
 *
 * Displays the campaigns page title, description, and an info popover
 * explaining what campaigns are and how they work.
 */

import type { ReactElement, ReactNode } from 'react';
import { InfoPopover } from '@cocuyo/ui';

interface CampaignsHeaderProps {
  title: string;
  description: string;
  infoTitle: string;
  infoBody: ReactNode;
}

export function CampaignsHeader({
  title,
  description,
  infoTitle,
  infoBody,
}: CampaignsHeaderProps): ReactElement {
  return (
    <section className="pb-8 pt-16">
      <div className="container-wide">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="mb-4 font-display text-3xl font-bold text-primary md:text-4xl lg:text-5xl">
            {title}
          </h1>
          <p className="mb-6 text-lg leading-relaxed text-secondary">{description}</p>
          <div className="flex justify-center">
            <InfoPopover title={infoTitle} position="bottom">
              {infoBody}
            </InfoPopover>
          </div>
        </div>
      </div>
    </section>
  );
}
