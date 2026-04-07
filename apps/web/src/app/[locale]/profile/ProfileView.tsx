'use client';

/**
 * ProfileView — Client component for profile page.
 *
 * Shows topic-weighted reputation scores for the connected user.
 * Requires wallet connection to view.
 */

import type { ReactElement } from 'react';
import { useSigner } from '@/hooks';
import { EmptyState } from '@cocuyo/ui';
import { ReputationRadar } from './ReputationRadar';

export interface ProfileViewTranslations {
  signInRequired: string;
  signInDescription: string;
  reputation: string;
  overallScore: string;
  topicScores: string;
  contributions: string;
  posts: string;
  corroborations: string;
  challenges: string;
  noActivity: string;
}

export interface ProfileViewProps {
  /** Topic slug to translated name map */
  topicTranslations: Record<string, string>;
  /** Translation strings */
  translations: ProfileViewTranslations;
}

// Mock reputation data for demo
const mockReputation = {
  overall: 72,
  topics: {
    economy: 78,
    health: 65,
    politics: 58,
    transparency: 82,
    infrastructure: 70,
  },
  contributions: {
    posts: 12,
    corroborations: 45,
    challenges: 3,
  },
};

export function ProfileView({
  topicTranslations,
  translations: t,
}: ProfileViewProps): ReactElement {
  const { isConnected, selectedAccount } = useSigner();

  // Access gate for non-connected users
  if (!isConnected) {
    return (
      <div className="py-16">
        <EmptyState
          title={t.signInRequired}
          description={t.signInDescription}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* User identifier (anonymous) */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-[var(--bg-surface-nested)] border border-[var(--border-default)]">
          <span className="text-2xl font-medium text-[var(--fg-primary)]">
            {selectedAccount?.address.slice(0, 2).toUpperCase() ?? 'FF'}
          </span>
        </div>
        <p className="text-sm text-[var(--fg-tertiary)] font-mono">
          {selectedAccount?.address.slice(0, 8)}...{selectedAccount?.address.slice(-6)}
        </p>
      </div>

      {/* Overall reputation score */}
      <div className="bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-container p-6 text-center">
        <h2 className="text-sm font-medium text-[var(--fg-secondary)] mb-2">
          {t.overallScore}
        </h2>
        <div className="text-4xl font-display font-bold text-[var(--fg-primary)]">
          {mockReputation.overall}
        </div>
        <div className="text-xs text-[var(--fg-tertiary)] mt-1">
          / 100
        </div>
      </div>

      {/* Topic reputation radar */}
      <div className="bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-container p-6">
        <h2 className="text-lg font-medium text-[var(--fg-primary)] mb-4">
          {t.topicScores}
        </h2>
        <ReputationRadar
          scores={mockReputation.topics}
          topicTranslations={topicTranslations}
        />
      </div>

      {/* Contribution stats */}
      <div className="bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-container p-6">
        <h2 className="text-lg font-medium text-[var(--fg-primary)] mb-4">
          {t.contributions}
        </h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-semibold text-[var(--fg-primary)]">
              {mockReputation.contributions.posts}
            </div>
            <div className="text-sm text-[var(--fg-secondary)]">
              {t.posts}
            </div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-[var(--fg-success)]">
              {mockReputation.contributions.corroborations}
            </div>
            <div className="text-sm text-[var(--fg-secondary)]">
              {t.corroborations}
            </div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-[var(--fg-warning)]">
              {mockReputation.contributions.challenges}
            </div>
            <div className="text-sm text-[var(--fg-secondary)]">
              {t.challenges}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
