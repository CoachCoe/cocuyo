'use client';

/**
 * Client component wrapper for signal cards with interactivity.
 */

import type { ReactElement } from 'react';
import { SignalCard } from '@cocuyo/ui';
import type { Signal } from '@cocuyo/types';

interface SignalListProps {
  signals: Signal[];
  chainTitles: Record<string, string>;
}

export function SignalList({ signals, chainTitles }: SignalListProps): ReactElement {
  return (
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
            onChainClick={(chainId) => {
              window.location.href = `/chain/${chainId}`;
            }}
          />
        );
      })}
    </div>
  );
}
