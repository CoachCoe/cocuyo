/**
 * Bounties page — Community-funded requests for information.
 *
 * Bounties create a functioning market for investigative information,
 * funded by the people who need it. No intermediary takes a cut,
 * no payment processor can block the transaction.
 */

import type { ReactElement } from 'react';
import Link from 'next/link';
import { getOpenBounties, getBountyPreviews } from '@/lib/services/mock-data-bounties';
import { setRequestLocale } from 'next-intl/server';

interface BountiesPageProps {
  params: Promise<{ locale: string }>;
}

/**
 * Format funding amount from smallest unit to display.
 */
function formatFunding(amount: bigint): string {
  const usdc = Number(amount) / 1_000_000;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(usdc);
}

/**
 * Format expiration as days remaining.
 */
function formatExpiration(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = timestamp - now;

  if (diff < 0) return 'Expired';

  const days = Math.floor(diff / 86400);
  if (days === 0) return 'Expires today';
  if (days === 1) return '1 day left';
  return `${days} days left`;
}

/**
 * Get status badge styling.
 */
function getStatusStyle(status: string): { color: string; bg: string } {
  switch (status) {
    case 'open':
      return { color: 'var(--fg-success)', bg: 'rgba(74, 222, 128, 0.1)' };
    case 'fulfilled':
      return { color: 'var(--fg-accent)', bg: 'var(--color-firefly-gold-glow)' };
    case 'expired':
      return { color: 'var(--fg-tertiary)', bg: 'var(--bg-surface-muted)' };
    default:
      return { color: 'var(--fg-secondary)', bg: 'var(--bg-surface-muted)' };
  }
}

export default async function BountiesPage({ params }: BountiesPageProps): Promise<ReactElement> {
  const { locale } = await params;
  setRequestLocale(locale);

  const openBounties = getOpenBounties();
  const allBounties = getBountyPreviews();
  const fulfilledBounties = allBounties.filter((b) => b.status === 'fulfilled');

  // Calculate total funding available
  const totalFunding = openBounties.reduce(
    (sum, b) => sum + b.fundingAmount,
    BigInt(0)
  );

  return (
    <>
      <main>
        {/* Header */}
        <section className="py-12 border-b border-DEFAULT">
          <div className="container-wide">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold mb-4">Information Bounties</h1>
                <p className="text-secondary max-w-2xl">
                  Community-funded requests for specific information. Contribute
                  verified signals to earn compensation directly — no intermediaries,
                  no payment processors.
                </p>
              </div>
              <div className="flex flex-col items-start md:items-end gap-2">
                <span className="text-sm text-secondary">
                  Total funding available
                </span>
                <span className="text-2xl font-bold text-firefly-gold">
                  {formatFunding(totalFunding)}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <section className="py-6 border-b border-DEFAULT bg-surface-container">
          <div className="container-wide">
            <div className="flex flex-wrap gap-8 text-sm">
              <div>
                <span className="text-secondary">Open bounties: </span>
                <span className="text-primary font-medium">{openBounties.length}</span>
              </div>
              <div>
                <span className="text-secondary">Fulfilled: </span>
                <span className="text-firefly-gold font-medium">
                  {fulfilledBounties.length}
                </span>
              </div>
              <div>
                <span className="text-secondary">
                  Total distributed:{' '}
                </span>
                <span className="text-primary font-medium">
                  {formatFunding(
                    fulfilledBounties.reduce((sum, b) => sum + b.fundingAmount, BigInt(0))
                  )}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Open Bounties */}
        <section className="py-12">
          <div className="container-wide">
            <h2 className="text-xl font-semibold mb-6">Open Bounties</h2>

            <div className="grid gap-4">
              {openBounties.map((bounty, index) => {
                const statusStyle = getStatusStyle(bounty.status);
                return (
                  <article
                    key={bounty.id}
                    className={`p-6 bg-surface-nested border border-DEFAULT rounded-container hover:border-emphasis transition-colors ${index < 10 ? 'animate-stagger-item' : ''}`}
                    style={{ '--stagger-index': index } as React.CSSProperties}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className="px-2 py-0.5 text-xs rounded-small capitalize"
                            style={{
                              color: statusStyle.color,
                              backgroundColor: statusStyle.bg,
                            }}
                          >
                            {bounty.status}
                          </span>
                          <span className="text-xs text-tertiary">
                            {formatExpiration(bounty.expiresAt)}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-primary mb-2">
                          {bounty.title}
                        </h3>
                        {bounty.location != null && (
                          <p className="text-sm text-tertiary mb-3">
                            {bounty.location}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-start lg:items-end gap-2">
                        <span className="text-2xl font-bold text-firefly-gold">
                          {formatFunding(bounty.fundingAmount)}
                        </span>
                        <span className="text-xs text-tertiary">
                          bounty reward
                        </span>
                      </div>
                    </div>

                    {/* Topics */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {bounty.topics.map((topic) => (
                        <span
                          key={topic}
                          className="px-2 py-0.5 text-xs bg-surface-muted text-secondary rounded-small"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-subtle">
                      <span className="text-sm text-secondary">
                        {bounty.contributionCount > 0 ? (
                          <>
                            <span className="text-primary">{bounty.contributionCount}</span>
                            {' '}contribution{bounty.contributionCount !== 1 ? 's' : ''} so far
                          </>
                        ) : (
                          'No contributions yet'
                        )}
                      </span>
                      <Link
                        href={`/bounties/${bounty.id}`}
                        className="px-3 py-1.5 text-sm font-medium border border-[var(--fg-primary)] rounded-small text-primary hover:bg-action-primary hover:text-[var(--fg-inverse)] transition-colors"
                      >
                        Contribute
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>

            {openBounties.length === 0 && (
              <p className="text-secondary text-center py-12">
                No open bounties at the moment. Check back soon.
              </p>
            )}
          </div>
        </section>

        {/* Recently Fulfilled */}
        {fulfilledBounties.length > 0 && (
          <section className="py-12 bg-surface-container border-t border-DEFAULT">
            <div className="container-wide">
              <h2 className="text-xl font-semibold mb-6">Recently Fulfilled</h2>

              <div className="grid gap-4">
                {fulfilledBounties.map((bounty, index) => {
                  const statusStyle = getStatusStyle(bounty.status);
                  return (
                    <article
                      key={bounty.id}
                      className={`p-6 bg-surface-nested border border-DEFAULT rounded-container opacity-80 ${index < 10 ? 'animate-stagger-item-fast' : ''}`}
                      style={{ '--stagger-index': index } as React.CSSProperties}
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span
                              className="px-2 py-0.5 text-xs rounded-small capitalize"
                              style={{
                                color: statusStyle.color,
                                backgroundColor: statusStyle.bg,
                              }}
                            >
                              {bounty.status}
                            </span>
                          </div>
                          <h3 className="text-base font-medium text-primary">
                            {bounty.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-6">
                          <span className="text-sm text-secondary">
                            <span className="text-primary">{bounty.contributionCount}</span>
                            {' '}contributions
                          </span>
                          <span className="text-lg font-semibold text-firefly-gold">
                            {formatFunding(bounty.fundingAmount)}
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* How Bounties Work */}
        <section className="py-16 border-t border-DEFAULT">
          <div className="container-narrow">
            <h2 className="text-2xl font-semibold mb-8 text-center">
              How Bounties Work
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-surface-nested border border-DEFAULT flex items-center justify-center text-firefly-gold font-bold">
                  1
                </div>
                <h3 className="font-semibold mb-2">Fund a Request</h3>
                <p className="text-sm text-secondary">
                  Anyone can post a bounty requesting specific information.
                  Fund it with stablecoin — no payment processor can block it.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-surface-nested border border-DEFAULT flex items-center justify-center text-firefly-gold font-bold">
                  2
                </div>
                <h3 className="font-semibold mb-2">Contribute Signals</h3>
                <p className="text-sm text-secondary">
                  Fireflies contribute verified signals that address the bounty.
                  Each contribution is weighted by corroboration and reputation.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-surface-nested border border-DEFAULT flex items-center justify-center text-firefly-gold font-bold">
                  3
                </div>
                <h3 className="font-semibold mb-2">Earn Directly</h3>
                <p className="text-sm text-secondary">
                  When the bounty is fulfilled, contributors receive compensation
                  proportional to their contribution — directly to their wallet.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
