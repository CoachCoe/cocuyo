'use client';

/**
 * BountiesView — Main client component for the bounties page.
 *
 * Clean single-column layout with horizontal filter bar above bounty cards.
 */

import { useState, useMemo, useCallback, type ReactElement, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import type { BountyPreview, BountyId, BountyStatus } from '@cocuyo/types';
import { useIlluminate } from '@/hooks/useIlluminate';
import { BountyFilters } from './BountyFilters';
import { BountiesList } from './BountiesList';

export interface BountiesViewProps {
  /** Available bounties */
  bounties: BountyPreview[];
  /** Available topics for filtering */
  topics: readonly string[];
  /** Whether there are more bounties to load */
  hasMore: boolean;
  /** Translation strings */
  translations: {
    allLabel: string;
    statusLabel: string;
    topicsLabel: string;
    infoTitle: string;
  };
  /** Info popover content */
  infoBody?: ReactNode | undefined;
}

export function BountiesView({
  bounties,
  topics,
  hasMore,
  translations,
  infoBody,
}: BountiesViewProps): ReactElement {
  const router = useRouter();
  const locale = useLocale();
  const { openModal } = useIlluminate();

  // Filter state
  const [statusFilter, setStatusFilter] = useState<BountyStatus | null>(null);
  const [topicFilter, setTopicFilter] = useState<string | null>(null);

  // Handle bounty card click - navigate to detail page
  const handleBountyClick = useCallback(
    (bountyId: BountyId) => {
      router.push(`/${locale}/bounty/${bountyId}`);
    },
    [router, locale]
  );

  // Handle illuminate button click on a bounty
  const handleIlluminate = useCallback(
    (bountyId: BountyId) => {
      openModal({ bountyId });
    },
    [openModal]
  );

  // Filter bounties based on active filters
  const filteredBounties = useMemo(() => {
    let result = bounties;

    if (statusFilter !== null) {
      result = result.filter((b) => b.status === statusFilter);
    }

    if (topicFilter !== null) {
      result = result.filter((b) =>
        b.topics.some((t) => t.toLowerCase() === topicFilter.toLowerCase())
      );
    }

    return result;
  }, [bounties, statusFilter, topicFilter]);

  return (
    <div className="space-y-6">
      {/* Horizontal filter bar */}
      <BountyFilters
        topics={topics}
        activeStatus={statusFilter}
        activeTopic={topicFilter}
        onStatusChange={setStatusFilter}
        onTopicChange={setTopicFilter}
        allLabel={translations.allLabel}
        statusLabel={translations.statusLabel}
        topicsLabel={translations.topicsLabel}
        totalCount={bounties.length}
        filteredCount={filteredBounties.length}
        infoTitle={translations.infoTitle}
        infoBody={infoBody}
      />

      {/* Bounty cards */}
      <BountiesList
        bounties={filteredBounties}
        hasMore={hasMore && statusFilter === null && topicFilter === null}
        isFiltered={statusFilter !== null || topicFilter !== null}
        onBountyClick={handleBountyClick}
        onIlluminate={handleIlluminate}
      />
    </div>
  );
}
