/**
 * Bounty detail page — View a specific information bounty.
 *
 * Shows:
 * - Bounty title, description, and requirements
 * - Funding amount and expiration
 * - Contributing signals so far
 * - Call to action to contribute
 */

import type { ReactElement } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getBountyById, mockBounties } from '@/lib/services/mock-data-bounties';
import { mockSignals } from '@/lib/services/mock-data';
import { ContributeButton } from './ContributeButton';
import { createBountyId } from '@cocuyo/types';

/**
 * Generate static params for all known bounties.
 */
export function generateStaticParams(): Array<{ id: string }> {
  return mockBounties.map((bounty) => ({
    id: String(bounty.id),
  }));
}

interface BountyPageProps {
  params: Promise<{ id: string }>;
}

function formatFunding(amount: bigint): string {
  const usdc = Number(amount) / 1_000_000;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(usdc);
}

function formatExpiration(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = timestamp - now;

  if (diff < 0) return 'Expired';

  const days = Math.floor(diff / 86400);
  if (days === 0) return 'Expires today';
  if (days === 1) return '1 day remaining';
  return `${days} days remaining`;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp * 1000;

  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function getStatusStyle(status: string): { color: string; bg: string } {
  switch (status) {
    case 'open':
      return { color: 'var(--color-corroborated)', bg: 'rgba(74, 222, 128, 0.1)' };
    case 'fulfilled':
      return { color: 'var(--color-accent)', bg: 'var(--color-accent-glow)' };
    case 'expired':
      return { color: 'var(--color-text-tertiary)', bg: 'var(--color-bg-elevated)' };
    default:
      return { color: 'var(--color-text-secondary)', bg: 'var(--color-bg-elevated)' };
  }
}

export default async function BountyPage({ params }: BountyPageProps): Promise<ReactElement> {
  const { id } = await params;
  const bounty = getBountyById(id);

  if (bounty == null) {
    notFound();
  }

  const statusStyle = getStatusStyle(bounty.status);

  // Get contributing signals
  const contributingSignals = mockSignals.filter((s) =>
    bounty.contributingSignals.includes(s.id)
  );

  return (
    <>
      <main>
        {/* Header */}
        <section className="py-12 border-b border-[var(--color-border-default)]">
          <div className="container-wide">
            {/* Breadcrumb */}
            <nav className="mb-6 text-sm">
              <Link
                href="/bounties"
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                Bounties
              </Link>
              <span className="mx-2 text-[var(--color-text-tertiary)]">/</span>
              <span className="text-[var(--color-text-primary)]">Details</span>
            </nav>

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
              <div className="flex-1">
                {/* Status and expiration */}
                <div className="flex items-center gap-4 mb-4">
                  <span
                    className="px-3 py-1 text-sm rounded-full capitalize"
                    style={{
                      color: statusStyle.color,
                      backgroundColor: statusStyle.bg,
                    }}
                  >
                    {bounty.status}
                  </span>
                  <span className="text-sm text-[var(--color-text-tertiary)]">
                    {formatExpiration(bounty.expiresAt)}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold mb-4">{bounty.title}</h1>

                {/* Location */}
                {bounty.location != null && (
                  <p className="text-[var(--color-text-tertiary)] mb-4">
                    {bounty.location}
                  </p>
                )}

                {/* Description */}
                <p className="text-[var(--color-text-secondary)] leading-relaxed max-w-2xl">
                  {bounty.description}
                </p>

                {/* Topics */}
                <div className="flex flex-wrap gap-2 mt-6">
                  {bounty.topics.map((topic) => (
                    <span
                      key={topic}
                      className="px-3 py-1 text-sm bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] rounded-full"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {/* Funding card */}
              <div className="lg:w-80 p-6 bg-[var(--color-bg-tertiary)] border border-[var(--color-border-default)] rounded-lg">
                <div className="text-center mb-6">
                  <p className="text-sm text-[var(--color-text-secondary)] mb-2">
                    Bounty Reward
                  </p>
                  <p className="text-4xl font-bold text-[var(--color-accent)]">
                    {formatFunding(bounty.fundingAmount)}
                  </p>
                  <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                    USDC (Polkadot)
                  </p>
                </div>

                <dl className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between">
                    <dt className="text-[var(--color-text-secondary)]">Contributions</dt>
                    <dd className="text-[var(--color-text-primary)] font-medium">
                      {bounty.contributingSignals.length}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--color-text-secondary)]">Posted</dt>
                    <dd className="text-[var(--color-text-primary)]">{formatDate(bounty.createdAt)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--color-text-secondary)]">Expires</dt>
                    <dd className="text-[var(--color-text-primary)]">{formatDate(bounty.expiresAt)}</dd>
                  </div>
                </dl>

                {bounty.status === 'open' && (
                  <ContributeButton
                    bountyId={createBountyId(id)}
                    className="w-full"
                  />
                )}

                {bounty.status === 'fulfilled' && (
                  <div className="text-center text-sm text-[var(--color-text-secondary)]">
                    This bounty has been fulfilled
                  </div>
                )}

                {bounty.status === 'expired' && (
                  <div className="text-center text-sm text-[var(--color-text-secondary)]">
                    This bounty has expired
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-8 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border-default)]">
          <div className="container-wide">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="font-semibold mb-1">How Bounty Rewards Work</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  When you contribute a verified signal, you become eligible for a share
                  of the bounty reward. Rewards are distributed proportionally based on
                  corroboration weight.
                </p>
              </div>
              {bounty.status === 'open' && (
                <ContributeButton
                  bountyId={createBountyId(id)}
                  variant="primary"
                  size="sm"
                >
                  Contribute Now
                </ContributeButton>
              )}
            </div>
          </div>
        </section>

        {/* Contributing signals */}
        <section className="py-12">
          <div className="container-wide">
            <h2 className="text-xl font-semibold mb-6">
              Contributions ({contributingSignals.length})
            </h2>

            {contributingSignals.length > 0 ? (
              <div className="space-y-4">
                {contributingSignals.map((signal) => (
                  <article
                    key={signal.id}
                    className="p-6 bg-[var(--color-bg-tertiary)] border border-[var(--color-border-default)] rounded-lg"
                  >
                    <div className="flex items-center gap-2 text-xs text-[var(--color-text-tertiary)] mb-3">
                      {signal.context.topics.length > 0 && (
                        <span className="capitalize">{signal.context.topics[0]}</span>
                      )}
                      {signal.context.locationName != null && (
                        <>
                          <span aria-hidden="true">&middot;</span>
                          <span>{signal.context.locationName}</span>
                        </>
                      )}
                      <span aria-hidden="true">&middot;</span>
                      <time dateTime={new Date(signal.createdAt * 1000).toISOString()}>
                        {formatRelativeTime(signal.createdAt)}
                      </time>
                    </div>

                    <p className="text-base text-[var(--color-text-primary)] leading-relaxed mb-4">
                      {signal.content.text}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-[var(--color-text-secondary)]">
                      <span className="flex items-center gap-1">
                        <span className="text-[var(--color-corroborated)]">&#9673;</span>
                        <span className="text-[var(--color-corroborated)]">
                          {signal.corroborations.witnessCount +
                            signal.corroborations.expertiseCount}
                        </span>
                      </span>
                      {signal.corroborations.evidenceCount > 0 && (
                        <span className="flex items-center gap-1">
                          <span>&#9889;</span>
                          <span>{signal.corroborations.evidenceCount}</span>
                        </span>
                      )}
                      <span className="text-[var(--color-text-tertiary)]">
                        Weight: {signal.corroborations.totalWeight.toFixed(1)}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-[var(--color-bg-tertiary)] rounded-lg border border-[var(--color-border-default)]">
                <p className="text-[var(--color-text-secondary)] mb-4">
                  No contributions yet. Be the first to illuminate this bounty.
                </p>
                {bounty.status === 'open' && (
                  <ContributeButton bountyId={createBountyId(id)} />
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
