'use client';

/**
 * SignalsList — Simple list of signal cards with section header.
 */

import type { ReactElement, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import type { Signal, ChainId } from '@cocuyo/types';
import { SignalCard, AnimatedList } from '@cocuyo/ui';
import { SectionHeader } from './SectionHeader';

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
  /** Whether the list is currently filtered by a story */
  isFiltered?: boolean | undefined;
}

export function SignalsList({
  signals,
  chainTitles,
  hasMore,
  title,
  infoTitle,
  infoBody,
  isFiltered = false,
}: SignalsListProps): ReactElement {
  const router = useRouter();
  const locale = useLocale();

  const handleSignalClick = (signal: Signal): void => {
    router.push(`/${locale}/signal/${signal.id}`);
  };

  const handleChainClick = (chainId: ChainId): void => {
    router.push(`/${locale}/chain/${chainId}`);
  };

  const handleAuthorClick = (credentialHash: string): void => {
    router.push(`/${locale}/profile/${credentialHash}`);
  };

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
        <p className="text-secondary text-center py-12">
          {isFiltered
            ? 'No signals in this story chain yet.'
            : 'No signals yet. Be the first to illuminate.'}
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
