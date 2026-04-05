'use client';

/**
 * ExploreView — Main client component for the explore page.
 *
 * Manages filter state and renders two-column layout:
 * - Left: Filters sidebar (story chains + bounties)
 * - Right: Signal feed (filtered by chain, bounty, or all)
 */

import { useState, useMemo, useCallback, type ReactElement, type ReactNode } from 'react';
import type { ChainPreview, ChainId, Signal, BountyPreview, BountyId } from '@cocuyo/types';
import { useIlluminate } from '@/hooks/useIlluminate';
import { ExploreFilters, type ExploreFilterType } from './ExploreFilters';
import { SignalsList } from './SignalsList';

export interface ExploreViewProps {
  /** Available story chains */
  chains: readonly ChainPreview[];
  /** Mapping of chain ID to bounty (for chains with funding) */
  chainBountyMap: Record<string, BountyPreview[]>;
  /** Orphan bounties - open questions without stories yet */
  orphanBounties: readonly BountyPreview[];
  /** Mapping of bounty ID to contributing signal IDs */
  bountySignalsMap: Record<string, readonly string[]>;
  /** All signals */
  signals: Signal[];
  /** Chain titles map for signal cards */
  chainTitles: Record<string, string>;
  /** Whether there are more signals to load */
  hasMore: boolean;
  /** Translation strings */
  translations: {
    allSignals: string;
    storiesLabel: string;
    openBountiesLabel: string;
    recentSignalsLabel: string;
    storiesInfoTitle: string;
    signalsInfoTitle: string;
    openBountiesInfoTitle: string;
    noMatchingBountySignals: string;
  };
  /** Info popover content for stories */
  storiesInfoBody?: ReactNode | undefined;
  /** Info popover content for signals */
  signalsInfoBody?: ReactNode | undefined;
  /** Info popover content for open bounties */
  openBountiesInfoBody?: ReactNode | undefined;
}

export function ExploreView({
  chains,
  chainBountyMap,
  orphanBounties,
  bountySignalsMap,
  signals,
  chainTitles,
  hasMore,
  translations,
  storiesInfoBody,
  signalsInfoBody,
  openBountiesInfoBody,
}: ExploreViewProps): ReactElement {
  const [filterType, setFilterType] = useState<ExploreFilterType>(null);
  const [filterId, setFilterId] = useState<string | null>(null);
  const { openModal } = useIlluminate();

  // Handle filter change
  const handleFilterChange = useCallback((type: ExploreFilterType, id: string | null) => {
    setFilterType(type);
    setFilterId(id);
  }, []);

  // Handle illuminate button click on a story chain
  const handleIlluminateChain = useCallback(
    (chainId: ChainId) => {
      openModal({ chainId });
    },
    [openModal]
  );

  // Handle illuminate button click on a bounty
  const handleIlluminateBounty = useCallback(
    (bountyId: BountyId) => {
      openModal({ bountyId });
    },
    [openModal]
  );

  // Get the active bounty (if filtering by bounty)
  const activeBounty = useMemo(() => {
    if (filterType !== 'bounty' || filterId === null) return null;
    return orphanBounties.find((b) => b.id === filterId) ?? null;
  }, [filterType, filterId, orphanBounties]);

  // Filter signals based on active filter
  const filteredSignals = useMemo(() => {
    switch (filterType) {
      case null:
        return signals;
      case 'chain':
        return signals.filter((signal) => signal.chainLinks.includes(filterId as ChainId));
      case 'bounty': {
        if (filterId === null) return signals;
        const contributingSignalIds = bountySignalsMap[filterId] ?? [];
        return signals.filter((signal) => contributingSignalIds.includes(signal.id));
      }
    }
  }, [signals, filterType, filterId, bountySignalsMap]);

  // Determine the signals section title based on filter
  const signalsSectionTitle = useMemo(() => {
    switch (filterType) {
      case null:
        return translations.recentSignalsLabel;
      case 'chain': {
        const chain = chains.find((c) => c.id === filterId);
        return chain?.title ?? translations.recentSignalsLabel;
      }
      case 'bounty':
        return activeBounty?.title ?? translations.recentSignalsLabel;
    }
  }, [filterType, filterId, chains, activeBounty, translations.recentSignalsLabel]);

  // Determine empty state message
  const emptyStateMessage = useMemo(() => {
    if (filterType === 'bounty') {
      return translations.noMatchingBountySignals;
    }
    return undefined; // Use default
  }, [filterType, translations.noMatchingBountySignals]);

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar - Filters */}
      <aside className="md:w-72 lg:w-80 shrink-0">
        <div className="md:sticky md:top-24">
          <ExploreFilters
            chains={chains}
            chainBountyMap={chainBountyMap}
            orphanBounties={orphanBounties}
            activeFilterType={filterType}
            activeFilterId={filterId}
            onFilterChange={handleFilterChange}
            onIlluminateChain={handleIlluminateChain}
            onIlluminateBounty={handleIlluminateBounty}
            translations={{
              allSignalsLabel: translations.allSignals,
              storiesLabel: translations.storiesLabel,
              openBountiesLabel: translations.openBountiesLabel,
            }}
            storiesInfoTitle={translations.storiesInfoTitle}
            storiesInfoBody={storiesInfoBody}
            openBountiesInfoTitle={translations.openBountiesInfoTitle}
            openBountiesInfoBody={openBountiesInfoBody}
          />
        </div>
      </aside>

      {/* Main content - Signal Feed */}
      <main className="flex-1 min-w-0">
        <SignalsList
          signals={filteredSignals}
          chainTitles={chainTitles}
          hasMore={hasMore && filterType === null}
          title={signalsSectionTitle}
          infoTitle={filterType === null ? translations.signalsInfoTitle : undefined}
          infoBody={filterType === null ? signalsInfoBody : undefined}
          isFiltered={filterType !== null}
          emptyStateMessage={emptyStateMessage}
        />
      </main>
    </div>
  );
}
