'use client';

/**
 * ExploreView — Main client component for the explore page.
 *
 * Manages filter state and renders two-column layout:
 * - Left: Story chain filters (sidebar)
 * - Right: Signal feed (filtered or all)
 */

import { useState, useMemo, useCallback, type ReactElement, type ReactNode } from 'react';
import type { ChainPreview, ChainId, Signal } from '@cocuyo/types';
import { useIlluminate } from '@/hooks/useIlluminate';
import { StoryFilters } from './StoryFilters';
import { SignalsList } from './SignalsList';

export interface ExploreViewProps {
  /** Available story chains */
  chains: readonly ChainPreview[];
  /** All signals */
  signals: Signal[];
  /** Chain titles map for signal cards */
  chainTitles: Record<string, string>;
  /** Whether there are more signals to load */
  hasMore: boolean;
  /** Translation strings */
  translations: {
    allSignals: string;
    storyChainsLabel: string;
    recentSignalsLabel: string;
    storiesInfoTitle: string;
    signalsInfoTitle: string;
  };
  /** Info popover content for stories */
  storiesInfoBody?: ReactNode | undefined;
  /** Info popover content for signals */
  signalsInfoBody?: ReactNode | undefined;
}

export function ExploreView({
  chains,
  signals,
  chainTitles,
  hasMore,
  translations,
  storiesInfoBody,
  signalsInfoBody,
}: ExploreViewProps): ReactElement {
  const [activeFilter, setActiveFilter] = useState<ChainId | null>(null);
  const { openModal } = useIlluminate();

  // Handle illuminate button click on a story chain
  const handleIlluminate = useCallback(
    (chainId: ChainId) => {
      openModal({ chainId: chainId as string });
    },
    [openModal]
  );

  // Filter signals based on active filter
  const filteredSignals = useMemo(() => {
    if (activeFilter === null) {
      return signals;
    }
    return signals.filter((signal) =>
      signal.chainLinks.includes(activeFilter)
    );
  }, [signals, activeFilter]);

  // Determine the signals section title based on filter
  const signalsSectionTitle = useMemo(() => {
    if (activeFilter === null) {
      return translations.recentSignalsLabel;
    }
    const chain = chains.find((c) => c.id === activeFilter);
    return chain?.title ?? translations.recentSignalsLabel;
  }, [activeFilter, chains, translations.recentSignalsLabel]);

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar - Story Filters */}
      <aside className="md:w-72 lg:w-80 shrink-0">
        <div className="md:sticky md:top-24">
          <StoryFilters
            chains={chains}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            onIlluminate={handleIlluminate}
            allSignalsLabel={translations.allSignals}
            sectionLabel={translations.storyChainsLabel}
            infoTitle={translations.storiesInfoTitle}
            infoBody={storiesInfoBody}
          />
        </div>
      </aside>

      {/* Main content - Signal Feed */}
      <main className="flex-1 min-w-0">
        <SignalsList
          signals={filteredSignals}
          chainTitles={chainTitles}
          hasMore={hasMore && activeFilter === null}
          title={signalsSectionTitle}
          infoTitle={activeFilter === null ? translations.signalsInfoTitle : undefined}
          infoBody={activeFilter === null ? signalsInfoBody : undefined}
          isFiltered={activeFilter !== null}
        />
      </main>
    </div>
  );
}
