'use client';

/**
 * SignalsList — Simple list of signal cards with section header.
 * Supports toggling between list and map view.
 */

import type { ReactElement, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import type { Signal, ChainId, BountyId } from '@cocuyo/types';
import { SignalCard, AnimatedList, EmptyState, SkeletonSignalCard, type SignalBountyInfo } from '@cocuyo/ui';
import { SectionHeader } from './SectionHeader';
import { SignalMapView } from '@/components/Map';

export type ViewMode = 'list' | 'map';

interface SignalsListProps {
  signals: Signal[];
  chainTitles: Record<string, string>;
  hasMore: boolean;
  /** Section title */
  title: string;
  /** Title for the info popover */
  infoTitle?: string | undefined;
  /** Body content for the info popover */
  infoBody?: ReactNode | undefined;
  /** Whether the list is currently filtered */
  isFiltered?: boolean | undefined;
  /** Whether loading */
  isLoading?: boolean | undefined;
  /** Custom empty state message */
  emptyStateMessage?: string | undefined;
  /** Map of signal IDs to bounty info (for display) */
  signalBountyMap?: Record<string, SignalBountyInfo> | undefined;
  /** Current view mode */
  viewMode?: ViewMode | undefined;
  /** Callback when view mode changes */
  onViewModeChange?: ((mode: ViewMode) => void) | undefined;
}

export function SignalsList({
  signals,
  chainTitles,
  hasMore,
  title,
  infoTitle,
  infoBody,
  isFiltered = false,
  isLoading = false,
  emptyStateMessage,
  signalBountyMap = {},
  viewMode = 'list',
  onViewModeChange,
}: SignalsListProps): ReactElement {
  const router = useRouter();
  const locale = useLocale();

  const handleSignalClick = (signal: Signal): void => {
    router.push(`/${locale}/signal/${signal.id}`);
  };

  const handleChainClick = (chainId: ChainId): void => {
    router.push(`/${locale}/chain/${chainId}`);
  };

  const handleBountyClick = (bountyId: BountyId): void => {
    router.push(`/${locale}/bounty/${bountyId}`);
  };

  const handleAuthorClick = (credentialHash: string): void => {
    router.push(`/${locale}/profile/${credentialHash}`);
  };

  // View mode toggle component
  const viewToggle = onViewModeChange !== undefined && (
    <div className="flex items-center gap-1 bg-[var(--bg-surface-nested)] rounded-lg p-1">
      <button
        type="button"
        onClick={() => onViewModeChange('list')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          viewMode === 'list'
            ? 'bg-[var(--bg-primary)] text-[var(--fg-primary)] shadow-sm'
            : 'text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]'
        }`}
        aria-pressed={viewMode === 'list'}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
        <span>List</span>
      </button>
      <button
        type="button"
        onClick={() => onViewModeChange('map')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          viewMode === 'map'
            ? 'bg-[var(--bg-primary)] text-[var(--fg-primary)] shadow-sm'
            : 'text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]'
        }`}
        aria-pressed={viewMode === 'map'}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <span>Map</span>
      </button>
    </div>
  );

  // Show loading skeletons
  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <SectionHeader title={title} infoTitle={infoTitle} infoBody={infoBody} className="mb-0" />
          {viewToggle}
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonSignalCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <SectionHeader title={title} infoTitle={infoTitle} infoBody={infoBody} className="mb-0" />
        {viewToggle}
      </div>

      {viewMode === 'map' ? (
        <SignalMapView
          signals={signals}
          locale={locale}
          className="h-[500px] rounded-lg"
        />
      ) : signals.length > 0 ? (
        <AnimatedList className="grid gap-4" variant="fast">
          {signals.map((signal) => {
            const chainTitle =
              signal.chainLinks.length > 0
                ? chainTitles[signal.chainLinks[0] as string]
                : undefined;
            const bounty = signalBountyMap[signal.id];
            return (
              <SignalCard
                key={signal.id}
                signal={signal}
                {...(chainTitle !== undefined && { chainTitle })}
                {...(bounty !== undefined && { bounty })}
                onClick={() => handleSignalClick(signal)}
                onChainClick={handleChainClick}
                onBountyClick={handleBountyClick}
                onAuthorClick={handleAuthorClick}
              />
            );
          })}
        </AnimatedList>
      ) : (
        <div className="py-8">
          <EmptyState
            title={emptyStateMessage ?? (isFiltered ? 'No signals found' : 'No signals yet')}
            description={
              isFiltered
                ? 'No signals match your current filters.'
                : 'Be the first to illuminate. Share what you observe.'
            }
            size="md"
          />
        </div>
      )}

      {viewMode === 'list' && hasMore && (
        <div className="mt-10 text-center">
          <button
            type="button"
            className="px-6 py-2.5 text-sm font-medium border border-[var(--color-border-default)] rounded-small hover:border-[var(--fg-accent)] hover:text-[var(--fg-accent)] transition-colors"
          >
            Load more signals
          </button>
        </div>
      )}
    </div>
  );
}
