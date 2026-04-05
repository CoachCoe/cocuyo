'use client';

/**
 * BountyCard — Display component for a bounty preview.
 *
 * The bounty card shows key information at a glance:
 * - Status and payment mode badges
 * - Title (2-line truncate)
 * - Topics and location tags
 * - Funding amount, contribution count, and expiry
 */

import type { ReactElement } from 'react';
import type { BountyPreview, BountyId } from '@cocuyo/types';
import { formatPUSDCompact } from '@cocuyo/types';
import { BountyStatusBadge } from '../BountyStatusBadge';
import { PaymentModeBadge } from '../PaymentModeBadge';
import { FireflySymbol } from '../FireflySymbol';

export interface BountyCardTranslations {
  expired: string;
  expiresSoon: string;
  hoursLeftSuffix: string;
  dayLeft: string;
  daysLeftSuffix: string;
  signalWord: string;
  signalsWord: string;
  illuminate: string;
  paymentPublic: string;
  paymentPrivate: string;
  statusOpen: string;
  statusFulfilled: string;
  statusExpired: string;
  statusCancelled: string;
}

export interface BountyCardProps {
  /** The bounty preview to display */
  bounty: BountyPreview;
  /** Callback when the card is clicked */
  onClick?: (bountyId: BountyId) => void;
  /** Callback when illuminate button is clicked */
  onIlluminate?: (bountyId: BountyId) => void;
  /** Translation strings */
  translations?: BountyCardTranslations;
  /** Topic slug to translated name map */
  topicTranslations?: Record<string, string>;
}

/**
 * Format expiry time as relative days.
 */
function formatExpiry(expiresAt: number, t?: BountyCardTranslations): string {
  const now = Date.now();
  // Handle both millisecond and second timestamps
  const ts = expiresAt > 1e12 ? expiresAt : expiresAt * 1000;
  const diff = ts - now;

  if (diff <= 0) {
    return t?.expired ?? 'Expired';
  }

  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  if (days === 0) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    if (hours === 0) {
      return t?.expiresSoon ?? 'Expires soon';
    }
    return `${hours}${t?.hoursLeftSuffix ?? 'h left'}`;
  }
  if (days === 1) {
    return t?.dayLeft ?? '1 day left';
  }
  return `${days} ${t?.daysLeftSuffix ?? 'days left'}`;
}

/**
 * Format signal count with proper pluralization.
 */
function formatSignalCount(count: number, t?: BountyCardTranslations): string {
  const word = count === 1
    ? (t?.signalWord ?? 'signal')
    : (t?.signalsWord ?? 'signals');
  return `${count} ${word}`;
}

export function BountyCard({
  bounty,
  onClick,
  onIlluminate,
  translations: t,
  topicTranslations,
}: BountyCardProps): ReactElement {
  const { id, title, topics, location, status, fundingAmount, contributionCount, payoutMode, expiresAt } = bounty;

  const handleClick = (): void => {
    onClick?.(id);
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(id);
    }
  };

  const handleIlluminateClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    onIlluminate?.(id);
  };

  const isExpired = status === 'expired';
  const isFulfilled = status === 'fulfilled';
  const isActive = status === 'open';

  const statusTranslations = t !== undefined ? {
    open: t.statusOpen,
    fulfilled: t.statusFulfilled,
    expired: t.statusExpired,
    cancelled: t.statusCancelled,
  } : undefined;

  const paymentTranslations = t !== undefined ? {
    public: t.paymentPublic,
    private: t.paymentPrivate,
  } : undefined;

  return (
    <article
      className={`
        bg-[var(--bg-surface-nested)] border border-[var(--border-default)]
        rounded-container p-6 transition-all duration-200 ease-out
        ${onClick !== undefined ? 'cursor-pointer hover:border-[var(--color-firefly-gold)]/40 hover:shadow-[0_4px_20px_rgba(232,185,49,0.08)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none' : ''}
        ${isExpired ? 'opacity-70' : ''}
      `}
      onClick={onClick !== undefined ? handleClick : undefined}
      onKeyDown={onClick !== undefined ? handleKeyDown : undefined}
      tabIndex={onClick !== undefined ? 0 : undefined}
      role={onClick !== undefined ? 'button' : undefined}
      aria-label={`Bounty: ${title}`}
    >
      {/* Status and payment mode badges row */}
      <div className="flex items-center justify-between mb-3">
        <BountyStatusBadge status={status} translations={statusTranslations} />
        <PaymentModeBadge mode={payoutMode} translations={paymentTranslations} />
      </div>

      {/* Title - 2 line truncate */}
      <h3 className="text-base font-medium text-[var(--fg-primary)] leading-snug mb-3 line-clamp-2">
        {title}
      </h3>

      {/* Topics and location tags */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {topics.slice(0, 2).map((topic) => (
          <span
            key={topic}
            className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-surface-container)] text-[var(--fg-secondary)]"
          >
            {topicTranslations?.[topic] ?? topic.replace(/-/g, ' ')}
          </span>
        ))}
        {location !== undefined && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-surface-container)] text-[var(--fg-tertiary)]">
            {location}
          </span>
        )}
      </div>

      {/* Funding amount, signals, and expiry */}
      <div className="flex items-center justify-between text-sm border-t border-[var(--border-subtle)] pt-4">
        <div className="flex items-center gap-4 text-[var(--fg-secondary)]">
          <span className="font-medium text-[var(--fg-primary)]">
            {formatPUSDCompact(fundingAmount)}
          </span>
          <span>
            {formatSignalCount(contributionCount, t)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {!isFulfilled && !isExpired && (
            <span className={`text-xs ${isActive ? 'text-[var(--fg-secondary)]' : 'text-[var(--fg-tertiary)]'}`}>
              {formatExpiry(expiresAt, t)}
            </span>
          )}
          {isActive && onIlluminate !== undefined && (
            <button
              type="button"
              onClick={handleIlluminateClick}
              className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-[var(--color-firefly-gold)] text-[var(--bg-primary)] font-medium animate-pulse-subtle hover:opacity-90 transition-opacity"
              aria-label={`Illuminate signal for: ${title}`}
            >
              <FireflySymbol size={10} color="inherit" aria-hidden="true" />
              {t?.illuminate ?? 'Illuminate'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
