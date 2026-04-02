'use client';

/**
 * BountiesList — Displays a list of bounty cards.
 *
 * Handles empty states and loading states.
 */

import type { ReactElement } from 'react';
import type { BountyPreview, BountyId } from '@cocuyo/types';
import { BountyCard, EmptyState } from '@cocuyo/ui';

export interface BountiesListProps {
  /** Bounties to display */
  bounties: readonly BountyPreview[];
  /** Whether there are more bounties to load */
  hasMore: boolean;
  /** Section title */
  title: string;
  /** Whether filters are active */
  isFiltered: boolean;
  /** Callback when a bounty card is clicked */
  onBountyClick: (bountyId: BountyId) => void;
  /** Callback when illuminate is clicked on a bounty */
  onIlluminate: (bountyId: BountyId) => void;
}

export function BountiesList({
  bounties,
  hasMore: _hasMore,
  title,
  isFiltered,
  onBountyClick,
  onIlluminate,
}: BountiesListProps): ReactElement {
  const isEmpty = bounties.length === 0;

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-secondary uppercase tracking-wide">
          {title}
        </h2>
        {!isEmpty && (
          <span className="text-xs text-tertiary">
            {bounties.length} bounti{bounties.length === 1 ? 'y' : 'es'}
          </span>
        )}
      </div>

      {/* Empty state */}
      {isEmpty && (
        <EmptyState
          title={isFiltered ? 'No matching bounties' : 'No bounties yet'}
          description={
            isFiltered
              ? 'Try adjusting your filters to find bounties.'
              : 'Be the first to post a bounty for information your community needs.'
          }
        />
      )}

      {/* Bounty cards */}
      {!isEmpty && (
        <div className="grid gap-4">
          {bounties.map((bounty) => (
            <BountyCard
              key={bounty.id}
              bounty={bounty}
              onClick={onBountyClick}
              onIlluminate={onIlluminate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
