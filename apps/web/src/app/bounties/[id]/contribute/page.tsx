/**
 * Bounty contribute page — Submit a signal to earn bounty rewards.
 *
 * This page allows verified fireflies to contribute signals toward
 * fulfilling an information bounty.
 */

import type { ReactElement } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Footer } from '@cocuyo/ui';
import { AppNavbar } from '@/components/AppNavbar';
import { getBountyById } from '@/lib/services/mock-data-bounties';
import { ContributeForm } from './ContributeForm';

interface ContributePageProps {
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

export default async function ContributePage({
  params,
}: ContributePageProps): Promise<ReactElement> {
  const { id } = await params;
  const bounty = getBountyById(id);

  if (bounty == null) {
    notFound();
  }

  if (bounty.status !== 'open') {
    return (
      <>
        <AppNavbar currentPath="/bounties" />
        <main className="pt-16">
          <section className="py-24">
            <div className="container-narrow text-center">
              <h1 className="text-2xl font-bold mb-4">Bounty Not Available</h1>
              <p className="text-[var(--color-text-secondary)] mb-8">
                This bounty is no longer accepting contributions.
              </p>
              <Link
                href="/bounties"
                className="text-[var(--color-accent)] hover:underline"
              >
                View open bounties
              </Link>
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <AppNavbar currentPath="/bounties" />

      <main className="pt-16">
        {/* Header */}
        <section className="py-8 border-b border-[var(--color-border-default)]">
          <div className="container-wide">
            {/* Breadcrumb */}
            <nav className="mb-4 text-sm">
              <Link
                href="/bounties"
                className="text-[var(--color-text-secondary)] hover:text-white transition-colors"
              >
                Bounties
              </Link>
              <span className="mx-2 text-[var(--color-text-tertiary)]">/</span>
              <Link
                href={`/bounties/${id}`}
                className="text-[var(--color-text-secondary)] hover:text-white transition-colors"
              >
                Details
              </Link>
              <span className="mx-2 text-[var(--color-text-tertiary)]">/</span>
              <span className="text-white">Contribute</span>
            </nav>

            {/* Bounty summary */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold mb-1">{bounty.title}</h1>
                <p className="text-sm text-[var(--color-text-tertiary)]">
                  {bounty.location} &middot; {formatExpiration(bounty.expiresAt)}
                </p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-2xl font-bold text-[var(--color-accent)]">
                  {formatFunding(bounty.fundingAmount)}
                </p>
                <p className="text-xs text-[var(--color-text-tertiary)]">
                  bounty reward
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contribute form */}
        <section className="py-12">
          <div className="container-narrow">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Form */}
              <div className="lg:col-span-2">
                <ContributeForm bountyId={id} bountyTitle={bounty.title} />
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* What we're looking for */}
                <div className="p-6 bg-[var(--color-bg-tertiary)] border border-[var(--color-border-default)] rounded-lg">
                  <h3 className="font-semibold mb-4">What We're Looking For</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                    {bounty.description}
                  </p>
                </div>

                {/* How rewards work */}
                <div className="p-6 bg-[var(--color-bg-tertiary)] border border-[var(--color-border-default)] rounded-lg">
                  <h3 className="font-semibold mb-4">How Rewards Work</h3>
                  <ul className="text-sm text-[var(--color-text-secondary)] space-y-3">
                    <li className="flex gap-3">
                      <span className="text-[var(--color-accent)]">1.</span>
                      <span>
                        Submit your signal with relevant information or evidence
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[var(--color-accent)]">2.</span>
                      <span>
                        Community members corroborate valuable contributions
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[var(--color-accent)]">3.</span>
                      <span>
                        Rewards distributed proportionally by corroboration weight
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[var(--color-accent)]">4.</span>
                      <span>
                        Payment sent directly to your connected wallet
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Reputation stake */}
                <div className="p-6 bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="text-[var(--color-accent)]">&#9670;</span>
                    Reputation Stake
                  </h3>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Your contribution is tied to your DIM credential. Quality
                    contributions build reputation; misleading information
                    damages it.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
