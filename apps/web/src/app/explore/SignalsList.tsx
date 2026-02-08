'use client';

/**
 * SignalsList — Simple list of signal cards.
 */

import type { ReactElement } from 'react';
import type { Signal, ChainId } from '@cocuyo/types';
import { SignalCard } from '@cocuyo/ui';

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
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Recent Signals</h2>

      {signals.length > 0 ? (
        <div className="grid gap-4 max-w-3xl">
          {signals.map((signal) => {
            const chainTitle =
              signal.chainLinks.length > 0
                ? chainTitles[signal.chainLinks[0] as string]
                : undefined;
            return (
              <SignalCard
                key={signal.id}
                signal={signal}
                {...(chainTitle != null && { chainTitle })}
                onChainClick={(chainId: ChainId) => {
                  window.location.href = `/chain/${chainId}`;
                }}
              />
            );
          })}
        </div>
      ) : (
        <p className="text-[var(--color-text-secondary)] text-center py-12">
          No signals yet. Be the first to illuminate.
        </p>
      )}

      {hasMore && (
        <div className="mt-8 text-center">
          <button
            type="button"
            className="px-6 py-2 text-sm border border-[var(--color-border-default)] rounded hover:border-[var(--color-border-emphasis)] transition-colors"
          >
            Load more signals
          </button>
        </div>
      )}
    </div>
  );
}
