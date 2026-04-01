'use client';

/**
 * SignalsList — Simple list of signal cards.
 */

import type { ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import type { Signal, ChainId } from '@cocuyo/types';
import { SignalCard, AnimatedList } from '@cocuyo/ui';

interface SignalsListProps {
  signals: Signal[];
  chainTitles: Record<string, string>;
  hasMore: boolean;
}

export function SignalsList({
  signals,
  chainTitles,
  hasMore,
}: SignalsListProps): ReactElement {
  const router = useRouter();

  const handleSignalClick = (signal: Signal): void => {
    router.push(`/signal/${signal.id}`);
  };

  const handleChainClick = (chainId: ChainId): void => {
    router.push(`/chain/${chainId}`);
  };

  const handleAuthorClick = (credentialHash: string): void => {
    router.push(`/profile/${credentialHash}`);
  };

  return (
    <div>
      <h2 className="text-xs font-medium text-tertiary uppercase tracking-wider mb-4">
        Recent Signals
      </h2>

      {signals.length > 0 ? (
        <AnimatedList className="grid gap-4" variant="fast">
          {signals.map((signal) => {
            const chainTitle =
              signal.chainLinks.length > 0
                ? chainTitles[signal.chainLinks[0] as string]
                : undefined;
            return (
              <SignalCard
                key={signal.id}
                signal={signal}
                {...(chainTitle !== undefined && { chainTitle })}
                onClick={() => handleSignalClick(signal)}
                onChainClick={handleChainClick}
                onAuthorClick={handleAuthorClick}
              />
            );
          })}
        </AnimatedList>
      ) : (
        <p className="text-[var(--color-text-secondary)] text-center py-12">
          No signals yet. Be the first to illuminate.
        </p>
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
