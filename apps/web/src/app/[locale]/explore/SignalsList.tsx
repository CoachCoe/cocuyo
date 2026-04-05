'use client';

/**
 * SignalsList — Simple list of signal cards with section header.
 */

import { useMemo, type ReactElement, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import type { Signal, ChainId, BountyId } from '@cocuyo/types';
import { SignalCard, AnimatedList, EmptyState, SkeletonSignalCard, type SignalBountyInfo } from '@cocuyo/ui';
import { SectionHeader } from './SectionHeader';
import { getBountiesForSignal } from '@/lib/services/mock-data-bounties';

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

  // Build a map of signal ID to bounty info for display
  const signalBountyMap = useMemo(() => {
    const map: Record<string, SignalBountyInfo> = {};
    for (const signal of signals) {
      const signalBounties = getBountiesForSignal(signal.id);
      if (signalBounties.length > 0 && signalBounties[0] !== undefined) {
        // Show the first bounty this signal contributes to
        const firstBounty = signalBounties[0];
        map[signal.id] = {
          id: firstBounty.id,
          title: firstBounty.title,
          fundingAmount: firstBounty.fundingAmount,
        };
      }
    }
    return map;
  }, [signals]);

  // Show loading skeletons
  if (isLoading) {
    return (
      <div>
        <SectionHeader title={title} infoTitle={infoTitle} infoBody={infoBody} />
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
      <SectionHeader title={title} infoTitle={infoTitle} infoBody={infoBody} />

      {signals.length > 0 ? (
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

      {hasMore && (
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
