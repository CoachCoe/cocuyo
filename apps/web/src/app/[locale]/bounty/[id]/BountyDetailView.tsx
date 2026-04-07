'use client';

/**
 * BountyDetailView — Client component for bounty detail display.
 *
 * Shows full bounty information with illuminate action.
 */

import type { ReactElement } from 'react';
import type { Bounty, Post } from '@cocuyo/types';
import { formatPUSD } from '@cocuyo/types';
import { BountyStatusBadge, PaymentModeBadge, FeedPostCard } from '@cocuyo/ui';
import { useIlluminate } from '@/hooks/useIlluminate';
import { useFormatters } from '@/lib/hooks/useFormatters';

export interface BountyDetailViewProps {
  /** The bounty to display */
  bounty: Bounty;
  /** Posts contributing to this bounty */
  posts: Post[];
  /** Translation strings */
  translations: {
    fundingLabel: string;
    payoutModeLabel: string;
    expiresLabel: string;
    expiredLabel: string;
    contributingPostsLabel: string;
    noPostsYet: string;
    illuminateLabel: string;
    fulfilledLabel: string;
    cancelledLabel: string;
    topicsLabel: string;
    locationLabel: string;
    descriptionLabel: string;
    postedLabel: string;
  };
}

export function BountyDetailView({
  bounty,
  posts,
  translations: t,
}: BountyDetailViewProps): ReactElement {
  const { openModal } = useIlluminate();
  const { formatDate, formatExpiry } = useFormatters();

  const isOpen = bounty.status === 'open';
  const isFulfilled = bounty.status === 'fulfilled';
  const isExpired = bounty.status === 'expired';
  const isCancelled = bounty.status === 'cancelled';

  const handleIlluminate = (): void => {
    openModal({ bountyId: bounty.id });
  };

  return (
    <>
      {/* Header */}
      <section className="py-8 border-b border-[var(--border-default)]">
        <div className="container-wide">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            {/* Main content */}
            <div className="flex-1 max-w-2xl">
              {/* Status badges */}
              <div className="flex items-center gap-3 mb-4">
                <BountyStatusBadge status={bounty.status} size="md" />
                <PaymentModeBadge mode={bounty.payoutMode} size="md" />
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-display font-bold text-primary mb-4">
                {bounty.title}
              </h1>

              {/* Topics and location */}
              <div className="flex flex-wrap gap-2 mb-6">
                {bounty.topics.map((topic) => (
                  <span
                    key={topic}
                    className="px-3 py-1 text-sm bg-[var(--bg-surface-nested)] text-[var(--fg-secondary)] rounded-full capitalize"
                  >
                    {topic.replace(/-/g, ' ')}
                  </span>
                ))}
                {bounty.location !== undefined && (
                  <span className="px-3 py-1 text-sm bg-[var(--bg-surface-nested)] text-[var(--fg-tertiary)] rounded-full">
                    {bounty.location}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-secondary uppercase tracking-wide mb-2">
                  {t.descriptionLabel}
                </h2>
                <p className="text-[var(--fg-secondary)] leading-relaxed whitespace-pre-wrap">
                  {bounty.description}
                </p>
              </div>
            </div>

            {/* Stats card */}
            <div className="lg:w-80 p-6 bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-container">
              <h3 className="font-semibold text-primary mb-4">Bounty Details</h3>
              <dl className="space-y-4 text-sm">
                {/* Funding */}
                <div>
                  <dt className="text-[var(--fg-tertiary)] mb-1">{t.fundingLabel}</dt>
                  <dd className="text-xl font-bold text-[var(--color-firefly-gold)]">
                    {formatPUSD(bounty.fundingAmount)}
                  </dd>
                </div>

                {/* Payout mode */}
                <div className="flex justify-between items-center">
                  <dt className="text-[var(--fg-tertiary)]">{t.payoutModeLabel}</dt>
                  <dd>
                    <PaymentModeBadge mode={bounty.payoutMode} />
                  </dd>
                </div>

                {/* Expiry */}
                {!isFulfilled && !isCancelled && (
                  <div className="flex justify-between items-center pt-3 border-t border-[var(--border-subtle)]">
                    <dt className="text-[var(--fg-tertiary)]">
                      {isExpired ? t.expiredLabel : t.expiresLabel}
                    </dt>
                    <dd className={isExpired ? 'text-[var(--fg-error)]' : 'text-[var(--fg-secondary)]'}>
                      {isExpired ? formatDate(bounty.expiresAt) : formatExpiry(bounty.expiresAt)}
                    </dd>
                  </div>
                )}

                {/* Contributing posts count */}
                <div className="flex justify-between items-center pt-3 border-t border-[var(--border-subtle)]">
                  <dt className="text-[var(--fg-tertiary)]">{t.contributingPostsLabel}</dt>
                  <dd className="text-[var(--fg-success)] font-medium">
                    {bounty.contributingPostIds.length}
                  </dd>
                </div>

                {/* Posted date */}
                <div className="pt-3 border-t border-[var(--border-subtle)]">
                  <dt className="text-[var(--fg-tertiary)] mb-1">{t.postedLabel}</dt>
                  <dd className="text-[var(--fg-secondary)]">{formatDate(bounty.createdAt)}</dd>
                </div>
              </dl>

              {/* Illuminate CTA - only for open bounties */}
              {isOpen && (
                <button
                  type="button"
                  onClick={handleIlluminate}
                  className="w-full mt-6 py-3 px-6 rounded-full bg-[var(--color-firefly-gold)] text-[var(--bg-primary)] font-medium text-base hover:opacity-90 transition-opacity"
                >
                  {t.illuminateLabel}
                </button>
              )}

              {/* Status messages for non-open bounties */}
              {isFulfilled && (
                <div className="mt-6 py-3 px-4 rounded-nested bg-[var(--color-firefly-gold)]/10 text-center">
                  <span className="text-[var(--color-firefly-gold)] font-medium">
                    {t.fulfilledLabel}
                  </span>
                </div>
              )}
              {isCancelled && (
                <div className="mt-6 py-3 px-4 rounded-nested bg-[var(--fg-error)]/10 text-center">
                  <span className="text-[var(--fg-error)] font-medium">
                    {t.cancelledLabel}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Contributing Posts */}
      <section className="py-8">
        <div className="container-wide">
          <h2 className="text-xl font-semibold text-primary mb-6">
            {t.contributingPostsLabel} ({posts.length})
          </h2>

          {posts.length > 0 ? (
            <div className="space-y-4 max-w-2xl">
              {posts.map((post) => (
                <FeedPostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="py-12 bg-[var(--bg-surface-nested)] rounded-container border border-[var(--border-default)] text-center max-w-2xl">
              <p className="text-[var(--fg-secondary)] mb-4">
                {t.noPostsYet}
              </p>
              {isOpen && (
                <button
                  type="button"
                  onClick={handleIlluminate}
                  className="py-2 px-6 rounded-full bg-[var(--color-firefly-gold)] text-[var(--bg-primary)] font-medium hover:opacity-90 transition-opacity"
                >
                  Be the First to {t.illuminateLabel}
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
