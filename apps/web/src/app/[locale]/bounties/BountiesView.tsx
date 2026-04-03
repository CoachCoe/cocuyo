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
    all: string;
    statusOpen: string;
    statusFulfilled: string;
    statusExpired: string;
    statusCancelled: string;
    bountyWord: string;
    bountiesWord: string;
    ofWord: string;
    clearFilters: string;
    whatsThis: string;
    infoTitle: string;
    // BountyCard translations
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
  };
  /** Info popover content */
  infoBody?: ReactNode | undefined;
}

export function BountiesView({
  bounties,
  topics,
  hasMore,
  translations: t,
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
        b.topics.some((topic) => topic.toLowerCase() === topicFilter.toLowerCase())
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
        totalCount={bounties.length}
        filteredCount={filteredBounties.length}
        translations={{
          all: t.all,
          statusOpen: t.statusOpen,
          statusFulfilled: t.statusFulfilled,
          statusExpired: t.statusExpired,
          statusCancelled: t.statusCancelled,
          bountyWord: t.bountyWord,
          bountiesWord: t.bountiesWord,
          ofWord: t.ofWord,
          clearFilters: t.clearFilters,
          whatsThis: t.whatsThis,
        }}
        infoTitle={t.infoTitle}
        infoBody={infoBody}
      />

      {/* Bounty cards */}
      <BountiesList
        bounties={filteredBounties}
        hasMore={hasMore && statusFilter === null && topicFilter === null}
        isFiltered={statusFilter !== null || topicFilter !== null}
        onBountyClick={handleBountyClick}
        onIlluminate={handleIlluminate}
        translations={{
          expired: t.expired,
          expiresSoon: t.expiresSoon,
          hoursLeftSuffix: t.hoursLeftSuffix,
          dayLeft: t.dayLeft,
          daysLeftSuffix: t.daysLeftSuffix,
          signalWord: t.signalWord,
          signalsWord: t.signalsWord,
          illuminate: t.illuminate,
          paymentPublic: t.paymentPublic,
          paymentPrivate: t.paymentPrivate,
          statusOpen: t.statusOpen,
          statusFulfilled: t.statusFulfilled,
          statusExpired: t.statusExpired,
          statusCancelled: t.statusCancelled,
        }}
      />
    </div>
  );
}
