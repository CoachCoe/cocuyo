'use client';

/**
 * SignalCard — Display component for a signal.
 *
 * The signal card is the primary content element. It must feel substantial
 * without being heavy. Key features:
 * - Author with pseudonym (privacy-controlled)
 * - Verification badge (if verified)
 * - Context tags (topic, location, time)
 * - Signal content
 * - Corroboration summary
 * - Chain link (if part of a story chain)
 */

import type { ReactElement } from 'react';
import type { Signal, ChainId } from '@cocuyo/types';
import { VerificationBadge } from '../VerificationBadge';

export interface SignalCardProps {
  /** The signal to display */
  signal: Signal;
  /** Optional: Title of the linked chain for display */
  chainTitle?: string;
  /** Callback when the chain link is clicked */
  onChainClick?: (chainId: ChainId) => void;
  /** Callback when the card itself is clicked */
  onClick?: () => void;
  /** Callback when the author is clicked */
  onAuthorClick?: (credentialHash: string) => void;
}

/**
 * Format a Unix timestamp as a relative time string.
 */
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  // Handle both millisecond and second timestamps
  const ts = timestamp > 1e12 ? timestamp : timestamp * 1000;
  const diff = now - ts;

  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${String(minutes)}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${String(hours)}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${String(days)}d ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${String(weeks)}w ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${String(months)}mo ago`;

  const years = Math.floor(days / 365);
  return `${String(years)}y ago`;
}

export function SignalCard({
  signal,
  chainTitle,
  onChainClick,
  onClick,
  onAuthorClick,
}: SignalCardProps): ReactElement {
  const { author, content, context, corroborations, verification, chainLinks, createdAt } = signal;

  const handleChainClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    if (onChainClick !== undefined && chainLinks.length > 0 && chainLinks[0] !== undefined) {
      onChainClick(chainLinks[0]);
    }
  };

  const handleAuthorClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    if (onAuthorClick !== undefined) {
      onAuthorClick(author.credentialHash);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <article
      className={`
        bg-[var(--bg-surface-nested)] border border-[var(--border-default)]
        rounded-container p-6 transition-colors
        ${onClick !== undefined ? 'cursor-pointer hover:border-[var(--border-emphasis)]' : ''}
      `}
      onClick={onClick}
      onKeyDown={onClick !== undefined ? handleKeyDown : undefined}
      tabIndex={onClick !== undefined ? 0 : undefined}
      role={onClick !== undefined ? 'button' : undefined}
    >
      {/* Author row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* Author avatar/initial */}
          <div
            className={`
              w-8 h-8 rounded-full bg-[var(--bg-surface-container)]
              border border-[var(--border-default)]
              flex items-center justify-center text-sm font-medium
              text-[var(--fg-primary)]
              ${onAuthorClick !== undefined ? 'cursor-pointer hover:border-[var(--border-emphasis)]' : ''}
            `}
            onClick={onAuthorClick !== undefined ? handleAuthorClick : undefined}
            role={onAuthorClick !== undefined ? 'button' : undefined}
            tabIndex={onAuthorClick !== undefined ? 0 : undefined}
            aria-label={`View ${author.pseudonym}'s profile`}
          >
            {author.pseudonym.charAt(0).toUpperCase()}
          </div>
          {/* Author name */}
          <div className="flex flex-col">
            <button
              type="button"
              className={`
                text-sm font-medium text-[var(--fg-primary)] text-left
                ${onAuthorClick !== undefined ? 'hover:text-[var(--color-firefly-gold)] transition-colors' : ''}
              `}
              onClick={onAuthorClick !== undefined ? handleAuthorClick : undefined}
              disabled={onAuthorClick === undefined}
            >
              {author.pseudonym}
            </button>
            {/* Show location if partial/public disclosure */}
            {author.location !== undefined && (
              <span className="text-xs text-[var(--fg-tertiary)]">
                {author.location}
              </span>
            )}
          </div>
        </div>
        {/* Verification badge */}
        <VerificationBadge
          status={verification.status}
          showLabel={verification.status !== 'unverified'}
        />
      </div>

      {/* Context tags */}
      <div className="flex items-center gap-2 text-xs text-[var(--fg-tertiary)] mb-3">
        {context.topics.length > 0 && (
          <span className="capitalize">{context.topics[0]}</span>
        )}
        {context.locationName !== undefined && (
          <>
            <span aria-hidden="true">&middot;</span>
            <span>{context.locationName}</span>
          </>
        )}
        <span aria-hidden="true">&middot;</span>
        <time dateTime={new Date(createdAt > 1e12 ? createdAt : createdAt * 1000).toISOString()}>
          {formatRelativeTime(createdAt)}
        </time>
      </div>

      {/* Content */}
      <p className="text-base text-[var(--fg-primary)] leading-relaxed mb-4">
        {content.text}
      </p>

      {/* Corroboration summary */}
      <div className="flex items-center gap-4 text-sm text-[var(--fg-secondary)] mb-4">
        <span className="flex items-center gap-1">
          <span className="text-[var(--fg-success)]" aria-hidden="true">
            &#9673;
          </span>
          <span>
            <span className="text-[var(--fg-success)]">
              {corroborations.witnessCount + corroborations.expertiseCount}
            </span>
            {' '}corroborations
          </span>
        </span>
        {corroborations.evidenceCount > 0 && (
          <span className="flex items-center gap-1">
            <span aria-hidden="true">&#9889;</span>
            <span>{corroborations.evidenceCount} evidence</span>
          </span>
        )}
        {corroborations.challengeCount > 0 && (
          <span className="flex items-center gap-1">
            <span className="text-[var(--fg-error)]" aria-hidden="true">
              &#9651;
            </span>
            <span>
              <span className="text-[var(--fg-error)]">
                {corroborations.challengeCount}
              </span>
              {' '}challenge{corroborations.challengeCount !== 1 ? 's' : ''}
            </span>
          </span>
        )}
      </div>

      {/* Chain link */}
      {chainLinks.length > 0 && chainTitle !== undefined && (
        <div className="border-t border-[var(--border-subtle)] pt-4">
          <button
            type="button"
            className="text-sm text-[var(--fg-secondary)] hover:text-[var(--fg-accent)] transition-colors flex items-center gap-2"
            onClick={handleChainClick}
          >
            <span>Part of:</span>
            <span className="text-[var(--fg-primary)]">{chainTitle}</span>
            <span aria-hidden="true">&rarr;</span>
          </button>
        </div>
      )}
    </article>
  );
}
