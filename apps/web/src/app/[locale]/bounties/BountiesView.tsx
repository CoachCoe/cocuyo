'use client';

/**
 * BountiesView — Main client component for the bounties page.
 *
 * Manages filter state and renders two-column layout:
 * - Left: Filters (status, topics)
 * - Right: Bounty cards
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
    allBounties: string;
    filtersLabel: string;
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

  // Determine section title based on filters
  const sectionTitle = useMemo(() => {
    if (statusFilter === null && topicFilter === null) {
      return translations.allBounties;
    }
    const parts: string[] = [];
    if (statusFilter !== null) {
      parts.push(statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1));
    }
    if (topicFilter !== null) {
      parts.push(topicFilter.replace(/-/g, ' '));
    }
    return parts.join(' - ') + ' Bounties';
  }, [statusFilter, topicFilter, translations.allBounties]);

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar - Filters */}
      <aside className="md:w-72 lg:w-80 shrink-0">
        <div className="md:sticky md:top-24">
          <BountyFilters
            topics={topics}
            activeStatus={statusFilter}
            activeTopic={topicFilter}
            onStatusChange={setStatusFilter}
            onTopicChange={setTopicFilter}
            allBountiesLabel={translations.allBounties}
            filtersLabel={translations.filtersLabel}
            statusLabel={translations.statusLabel}
            topicsLabel={translations.topicsLabel}
            infoTitle={translations.infoTitle}
            infoBody={infoBody}
          />
        </div>
      </aside>

      {/* Main content - Bounty Cards */}
      <main className="flex-1 min-w-0">
        <BountiesList
          bounties={filteredBounties}
          hasMore={hasMore && statusFilter === null && topicFilter === null}
          title={sectionTitle}
          isFiltered={statusFilter !== null || topicFilter !== null}
          onBountyClick={handleBountyClick}
          onIlluminate={handleIlluminate}
        />
      </main>
    </div>
  );
}
