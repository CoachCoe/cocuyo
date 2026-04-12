'use client';

/**
 * FeedPostCard — Full display component for a post in feeds.
 *
 * The card is the primary content element. It must feel substantial
 * without being heavy. Key features:
 * - Author with pseudonym (privacy-controlled)
 * - Verification badge (if verified)
 * - Context tags (topic, location, time)
 * - Post content
 * - Corroboration summary
 * - Chain link (if part of a story chain)
 */

import type { ReactElement } from 'react';
import type { Post, ChainId, CampaignId, PUSDAmount } from '@cocuyo/types';
import { formatPUSDCompact } from '@cocuyo/types';
import { VerificationBadge } from '../VerificationBadge';

/** Campaign info for display on cards */
export interface PostCampaignInfo {
  readonly id: CampaignId;
  readonly title: string;
  readonly fundingAmount: PUSDAmount;
}

export interface FeedPostCardProps {
  /** The post to display */
  post: Post;
  /** Optional: Title of the linked chain for display */
  chainTitle?: string;
  /** Optional: Campaign this post contributes to */
  campaign?: PostCampaignInfo | undefined;
  /** Callback when the chain link is clicked */
  onChainClick?: (chainId: ChainId) => void;
  /** Callback when the campaign badge is clicked */
  onCampaignClick?: (campaignId: CampaignId) => void;
  /** Callback when the card itself is clicked */
  onClick?: () => void;
  /** Callback when the author is clicked */
  onAuthorClick?: (credentialHash: string) => void;
  /** Callback when corroborate button is clicked */
  onCorroborate?: () => void;
  /** Callback when dispute button is clicked */
  onDispute?: () => void;
  /** Callback when trust details link is clicked */
  onViewTrust?: () => void;
  /** Whether to show action buttons (corroborate/dispute) */
  showActions?: boolean;
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

export function FeedPostCard({
  post,
  chainTitle,
  campaign,
  onChainClick,
  onCampaignClick,
  onClick,
  onAuthorClick,
  onCorroborate,
  onDispute,
  onViewTrust,
  showActions = false,
}: FeedPostCardProps): ReactElement {
  const { author, content, context, corroborations, verification, chainLinks, createdAt } = post;

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

  const handleCampaignClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    if (onCampaignClick !== undefined && campaign !== undefined) {
      onCampaignClick(campaign.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  const handleCorroborate = (e: React.MouseEvent): void => {
    e.stopPropagation();
    onCorroborate?.();
  };

  const handleDispute = (e: React.MouseEvent): void => {
    e.stopPropagation();
    onDispute?.();
  };

  const handleViewTrust = (e: React.MouseEvent): void => {
    e.stopPropagation();
    onViewTrust?.();
  };

  return (
    <article
      className={`rounded-container border border-[var(--border-default)] bg-[var(--bg-surface-nested)] p-6 transition-all duration-200 ease-out ${onClick !== undefined ? 'cursor-pointer hover:-translate-y-0.5 hover:border-[var(--color-firefly-gold)]/40 hover:shadow-[0_4px_20px_rgba(232,185,49,0.08)] active:translate-y-0 active:shadow-none' : ''} `}
      onClick={onClick}
      onKeyDown={onClick !== undefined ? handleKeyDown : undefined}
      tabIndex={onClick !== undefined ? 0 : undefined}
      role={onClick !== undefined ? 'button' : undefined}
    >
      {/* Author row */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Author avatar/initial */}
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--bg-surface-container)] text-sm font-medium text-[var(--fg-primary)] transition-all duration-150 ${onAuthorClick !== undefined ? 'cursor-pointer hover:scale-105 hover:border-[var(--color-firefly-gold)]' : ''} `}
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
              className={`text-left text-sm font-medium text-[var(--fg-primary)] ${onAuthorClick !== undefined ? 'transition-colors hover:text-[var(--color-firefly-gold)]' : ''} `}
              onClick={onAuthorClick !== undefined ? handleAuthorClick : undefined}
              disabled={onAuthorClick === undefined}
            >
              {author.pseudonym}
            </button>
            {/* Show location if partial/public disclosure */}
            {author.location !== undefined && (
              <span className="text-xs text-[var(--fg-tertiary)]">{author.location}</span>
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
      <div className="mb-3 flex items-center gap-2 text-xs text-[var(--fg-tertiary)]">
        {context.topics.length > 0 && <span className="capitalize">{context.topics[0]}</span>}
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
      <p className="mb-4 text-base leading-relaxed text-[var(--fg-primary)]">{content.text}</p>

      {/* Media preview */}
      {content.media !== undefined && content.media.length > 0 && (
        <div className="mb-4">
          {content.media.length === 1 && content.media[0] !== undefined && (
            <div className="rounded-nested overflow-hidden">
              <div
                className="flex h-48 w-full items-center justify-center bg-[var(--bg-surface-container)] text-[var(--fg-tertiary)]"
                aria-label={content.media[0].altText ?? 'Attached image'}
              >
                <svg
                  className="h-12 w-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          )}
          {content.media.length > 1 && (
            <div className="flex items-center gap-2">
              <div className="rounded-nested flex h-24 w-24 items-center justify-center bg-[var(--bg-surface-container)] text-[var(--fg-tertiary)]">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              {content.media.length > 1 && (
                <span className="text-sm text-[var(--fg-tertiary)]">
                  +{content.media.length - 1} more
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Corroboration summary */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-[var(--fg-secondary)]">
          <span className="flex items-center gap-1">
            <span className="text-[var(--fg-success)]" aria-hidden="true">
              &#9673;
            </span>
            <span>
              <span className="text-[var(--fg-success)]">
                {corroborations.witnessCount + corroborations.expertiseCount}
              </span>{' '}
              corroborations
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
                <span className="text-[var(--fg-error)]">{corroborations.challengeCount}</span>{' '}
                challenge{corroborations.challengeCount !== 1 ? 's' : ''}
              </span>
            </span>
          )}
        </div>
        {/* View trust details link */}
        {onViewTrust !== undefined && (
          <button
            type="button"
            onClick={handleViewTrust}
            className="text-xs text-[var(--fg-tertiary)] transition-colors hover:text-[var(--fg-accent)]"
          >
            View details
          </button>
        )}
      </div>

      {/* Action buttons */}
      {showActions && (
        <div className="mb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={handleCorroborate}
            className="rounded-nested flex items-center gap-1.5 border border-[var(--fg-success)]/30 px-3 py-1.5 text-sm font-medium text-[var(--fg-success)] transition-colors hover:bg-[var(--fg-success)]/10"
          >
            <span aria-hidden="true">&#9673;</span>
            Corroborate
          </button>
          <button
            type="button"
            onClick={handleDispute}
            className="rounded-nested flex items-center gap-1.5 border border-[var(--fg-error)]/30 px-3 py-1.5 text-sm font-medium text-[var(--fg-error)] transition-colors hover:bg-[var(--fg-error)]/10"
          >
            <span aria-hidden="true">&#9651;</span>
            Dispute
          </button>
        </div>
      )}

      {/* Chain link */}
      {chainLinks.length > 0 && chainTitle !== undefined && (
        <div className="border-t border-[var(--border-subtle)] pt-4">
          <button
            type="button"
            className="flex items-center gap-2 text-sm text-[var(--fg-secondary)] transition-colors hover:text-[var(--fg-accent)]"
            onClick={handleChainClick}
          >
            <span>Part of:</span>
            <span className="text-[var(--fg-primary)]">{chainTitle}</span>
            <span aria-hidden="true">&rarr;</span>
          </button>
        </div>
      )}

      {/* Campaign badge */}
      {campaign !== undefined && (
        <div
          className={`mt-3 pt-3 ${chainLinks.length > 0 && chainTitle !== undefined ? '' : 'border-t border-[var(--border-subtle)]'}`}
        >
          <button
            type="button"
            onClick={handleCampaignClick}
            className="inline-flex items-center gap-2 text-sm text-[var(--fg-secondary)] transition-colors hover:text-[var(--color-firefly-gold)]"
          >
            <span className="rounded border border-[var(--color-firefly-gold)]/30 bg-[var(--color-firefly-gold)]/15 px-1.5 py-0.5 text-xs font-medium text-[var(--color-firefly-gold)]">
              Earn {formatPUSDCompact(campaign.fundingAmount)}
            </span>
            <span className="max-w-[200px] truncate">{campaign.title}</span>
            <span aria-hidden="true">&rarr;</span>
          </button>
        </div>
      )}
    </article>
  );
}
