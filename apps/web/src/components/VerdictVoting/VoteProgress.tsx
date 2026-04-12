'use client';

/**
 * VoteProgress — Visual progress indicator for verdict voting.
 *
 * Shows vote counts, agreement percentage, and threshold progress.
 */

import type { ReactElement } from 'react';
import type { VotingProgress, VerdictStatus } from '@cocuyo/types';

export interface VoteProgressProps {
  /** Voting progress data */
  progress: VotingProgress;
  /** Translations */
  translations?: {
    votes?: string;
    required?: string;
    agreement?: string;
    threshold?: string;
    thresholdReached?: string;
  };
}

const STATUS_COLORS: Record<VerdictStatus, string> = {
  confirmed: 'bg-[var(--color-firefly-gold)]',
  disputed: 'bg-amber-500',
  false: 'bg-[var(--fg-error)]',
  synthetic: 'bg-orange-500',
  inconclusive: 'bg-[var(--fg-tertiary)]',
};

export function VoteProgress({
  progress,
  translations = {},
}: VoteProgressProps): ReactElement {
  const {
    totalVotes,
    requiredVotes,
    agreementPercentage,
    threshold,
    thresholdReached,
    voteCounts,
    leadingStatus,
  } = progress;

  const votePercentage = Math.min((totalVotes / requiredVotes) * 100, 100);

  return (
    <div className="space-y-4">
      {/* Vote count progress */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-[var(--fg-secondary)]">
            {translations.votes ?? 'Votes'}: {totalVotes}/{requiredVotes}
          </span>
          <span className="text-[var(--fg-tertiary)]">
            {translations.required ?? 'Required'}: {requiredVotes}
          </span>
        </div>
        <div className="h-2 bg-[var(--bg-surface-nested)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--fg-secondary)] transition-all duration-300"
            style={{ width: `${votePercentage}%` }}
          />
        </div>
      </div>

      {/* Agreement progress */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-[var(--fg-secondary)]">
            {translations.agreement ?? 'Agreement'}: {agreementPercentage.toFixed(0)}%
          </span>
          <span className="text-[var(--fg-tertiary)]">
            {translations.threshold ?? 'Threshold'}: {threshold}%
          </span>
        </div>
        <div className="h-2 bg-[var(--bg-surface-nested)] rounded-full overflow-hidden relative">
          <div
            className={`h-full transition-all duration-300 ${
              leadingStatus ? STATUS_COLORS[leadingStatus] : 'bg-[var(--fg-secondary)]'
            }`}
            style={{ width: `${agreementPercentage}%` }}
          />
          {/* Threshold marker */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white/50"
            style={{ left: `${threshold}%` }}
          />
        </div>
      </div>

      {/* Vote breakdown */}
      <div className="flex flex-wrap gap-3 text-xs">
        {(Object.entries(voteCounts) as [VerdictStatus, number][])
          .filter(([, count]) => count > 0)
          .sort(([, a], [, b]) => b - a)
          .map(([status, count]) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${STATUS_COLORS[status]}`} />
              <span className="text-[var(--fg-secondary)] capitalize">{status}</span>
              <span className="text-[var(--fg-tertiary)]">({count})</span>
            </div>
          ))}
      </div>

      {/* Threshold reached indicator */}
      {thresholdReached && (
        <div className="flex items-center gap-2 px-3 py-2 bg-[var(--color-firefly-gold)]/10 border border-[var(--color-firefly-gold)]/20 rounded-lg">
          <svg className="w-4 h-4 text-[var(--color-firefly-gold)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm text-[var(--color-firefly-gold)]">
            {translations.thresholdReached ?? 'Threshold reached — verdict will be finalized'}
          </span>
        </div>
      )}
    </div>
  );
}
