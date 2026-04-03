'use client';

/**
 * BountiesView — Main client component for the bounties page.
 *
 * Clean single-column layout with filter bar above bounty cards.
 * Defaults to showing "Open" bounties.
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
  /** Topic slug to translated name map */
  topicTranslations: Record<string, string>;
  /** Whether there are more bounties to load */
  hasMore: boolean;
  /** Translation strings */
  translations: {
    all: string;
    statusLabel: string;
    statusOpen: string;
    statusFulfilled: string;
    statusExpired: string;
    statusCancelled: string;
    bountyWord: string;
    bountiesWord: string;
    ofWord: string;
    clearFilters: string;
    whatsThis: string;
    filterByTopic: string;
    searchPlaceholder: string;
    topicsSelected: string;
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
  topicTranslations,
  hasMore,
  translations: t,
  infoBody,
}: BountiesViewProps): ReactElement {
  const router = useRouter();
  const locale = useLocale();
  const { openModal } = useIlluminate();

  // Filter state - default to "open" status
  const [statusFilter, setStatusFilter] = useState<BountyStatus | null>('open');
  const [topicFilters, setTopicFilters] = useState<readonly string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

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

    // Status filter
    if (statusFilter !== null) {
      result = result.filter((b) => b.status === statusFilter);
    }

    // Topic filters (OR logic - matches any selected topic)
    if (topicFilters.length > 0) {
      result = result.filter((b) =>
        b.topics.some((topic) =>
          topicFilters.some((filter) => topic.toLowerCase() === filter.toLowerCase())
        )
      );
    }

    // Search filter
    if (searchQuery.trim().length > 0) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(query) ||
          b.topics.some((topic) => topic.toLowerCase().includes(query)) ||
          (b.location?.toLowerCase().includes(query) ?? false)
      );
    }

    return result;
  }, [bounties, statusFilter, topicFilters, searchQuery]);

  const isFiltered = statusFilter !== null || topicFilters.length > 0 || searchQuery.length > 0;

  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <BountyFilters
        topics={topics}
        topicTranslations={topicTranslations}
        activeStatus={statusFilter}
        activeTopics={topicFilters}
        searchQuery={searchQuery}
        onStatusChange={setStatusFilter}
        onTopicsChange={setTopicFilters}
        onSearchChange={setSearchQuery}
        totalCount={bounties.length}
        filteredCount={filteredBounties.length}
        translations={{
          all: t.all,
          statusLabel: t.statusLabel,
          statusOpen: t.statusOpen,
          statusFulfilled: t.statusFulfilled,
          statusExpired: t.statusExpired,
          statusCancelled: t.statusCancelled,
          bountyWord: t.bountyWord,
          bountiesWord: t.bountiesWord,
          ofWord: t.ofWord,
          clearFilters: t.clearFilters,
          whatsThis: t.whatsThis,
          filterByTopic: t.filterByTopic,
          searchPlaceholder: t.searchPlaceholder,
          topicsSelected: t.topicsSelected,
        }}
        infoTitle={t.infoTitle}
        infoBody={infoBody}
      />

      {/* Bounty cards */}
      <BountiesList
        bounties={filteredBounties}
        topicTranslations={topicTranslations}
        hasMore={hasMore && !isFiltered}
        isFiltered={isFiltered}
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
