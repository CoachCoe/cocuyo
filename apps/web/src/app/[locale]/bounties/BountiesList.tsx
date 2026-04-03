'use client';

/**
 * BountiesList — Displays a grid of bounty cards.
 *
 * Clean card grid with smooth hover states and empty state handling.
 */

import type { ReactElement } from 'react';
import type { BountyPreview, BountyId } from '@cocuyo/types';
import { BountyCard, EmptyState } from '@cocuyo/ui';

export interface BountiesListProps {
  /** Bounties to display */
  bounties: readonly BountyPreview[];
  /** Topic slug to translated name map */
  topicTranslations: Record<string, string>;
  /** Whether there are more bounties to load */
  hasMore: boolean;
  /** Whether filters are active */
  isFiltered: boolean;
  /** Callback when a bounty card is clicked */
  onBountyClick: (bountyId: BountyId) => void;
  /** Callback when illuminate is clicked on a bounty */
  onIlluminate: (bountyId: BountyId) => void;
  /** Translation strings */
  translations: {
    expired: string;
    expiresSoon: string;
    hoursLeftSuffix: string;
    dayLeft: string;
    daysLeftSuffix: string;
    signalWord: string;
    signalsWord: string;
    illuminate: string;
    paymentPublic: string;
    paymentPrivate: string;
    statusOpen: string;
    statusFulfilled: string;
    statusExpired: string;
    statusCancelled: string;
  };
}

export function BountiesList({
  bounties,
  topicTranslations,
  hasMore: _hasMore,
  isFiltered,
  onBountyClick,
  onIlluminate,
  translations: t,
}: BountiesListProps): ReactElement {
  const isEmpty = bounties.length === 0;

  // Empty state
  if (isEmpty) {
    return (
      <div className="py-12">
        <EmptyState
          title={isFiltered ? 'No matching bounties' : 'No bounties yet'}
          description={
            isFiltered
              ? 'Try adjusting your filters to find bounties.'
              : 'Be the first to post a bounty for information your community needs.'
          }
        />
      </div>
    );
  }

  // Bounty card grid
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {bounties.map((bounty) => (
        <BountyCard
          key={bounty.id}
          bounty={bounty}
          onClick={onBountyClick}
          onIlluminate={onIlluminate}
          translations={t}
          topicTranslations={topicTranslations}
        />
      ))}
    </div>
  );
}
