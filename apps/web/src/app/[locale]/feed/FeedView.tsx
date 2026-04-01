'use client';

/**
 * FeedView — Client component for the personalized feed.
 *
 * Shows tabs for Following (signals matching user's topics)
 * and Discover (all recent signals).
 */

import type { ReactNode } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { Signal, ChainId } from '@cocuyo/types';
import { SignalCard, AnimatedList } from '@cocuyo/ui';
import { useIdentity } from '@/hooks/useIdentity';

interface FeedViewProps {
  signals: Signal[];
  chainTitles: Record<string, string>;
}

type FeedTab = 'following' | 'discover';

export function FeedView({
  signals,
  chainTitles,
}: FeedViewProps): ReactNode {
  const router = useRouter();
  const t = useTranslations('feed');
  const { status, profile } = useIdentity();
  const [activeTab, setActiveTab] = useState<FeedTab>('discover');

  // Filter signals based on active tab
  const filteredSignals = activeTab === 'following'
    ? signals.filter((signal) => {
        if (profile === null) return false;
        // Show signals matching user's followed topics
        return signal.context.topics.some((topic) =>
          profile.followedTopics.includes(topic)
        );
      })
    : signals;

  // Sort by creation time, newest first
  const sortedSignals = [...filteredSignals].sort((a, b) => b.createdAt - a.createdAt);

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--fg-primary)]">
          {t('title')}
        </h1>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-[var(--bg-surface-nested)] rounded-nested">
          <button
            type="button"
            onClick={() => setActiveTab('following')}
            className={`px-4 py-2 text-sm font-medium rounded-small transition-colors ${
              activeTab === 'following'
                ? 'bg-[var(--bg-surface-container)] text-[var(--fg-primary)]'
                : 'text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]'
            }`}
          >
            {t('following')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('discover')}
            className={`px-4 py-2 text-sm font-medium rounded-small transition-colors ${
              activeTab === 'discover'
                ? 'bg-[var(--bg-surface-container)] text-[var(--fg-primary)]'
                : 'text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]'
            }`}
          >
            {t('discover')}
          </button>
        </div>
      </div>

      {/* Setup prompt for Following tab */}
      {activeTab === 'following' && status !== 'ready' && (
        <div className="p-6 bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-container text-center">
          <p className="text-[var(--fg-secondary)] mb-4">
            {t('setupPrompt')}
          </p>
          <Link
            href="/onboarding"
            className="inline-block px-4 py-2 bg-[var(--color-firefly-gold)] text-[var(--bg-surface-main)] font-semibold rounded-nested hover:brightness-110 transition-all"
          >
            {t('completeSetup')}
          </Link>
        </div>
      )}

      {/* Empty state for Following tab with no matching signals */}
      {activeTab === 'following' && status === 'ready' && sortedSignals.length === 0 && (
        <div className="p-6 bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-container text-center">
          <p className="text-[var(--fg-secondary)] mb-2">
            {t('noMatchingSignals')}
          </p>
          <p className="text-sm text-[var(--fg-tertiary)]">
            {t('tryFollowingMore')}
          </p>
        </div>
      )}

      {/* Signal list */}
      {sortedSignals.length > 0 && (
        <AnimatedList className="space-y-4" variant="fast">
          {sortedSignals.map((signal) => {
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
      )}

      {/* Empty state for Discover tab */}
      {activeTab === 'discover' && sortedSignals.length === 0 && (
        <div className="p-6 bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-container text-center">
          <p className="text-[var(--fg-secondary)]">
            {t('noSignalsYet')}
          </p>
        </div>
      )}
    </div>
  );
}
