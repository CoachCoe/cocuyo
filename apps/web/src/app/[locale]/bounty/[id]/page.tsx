/**
 * Bounty detail page — View a bounty with full details.
 *
 * This page shows:
 * - Bounty title, description, and status
 * - Funding amount and payout mode
 * - Topics and location
 * - Expiry information
 * - Contributing signals
 * - Option to illuminate a signal for this bounty
 */

import type { ReactElement, ReactNode } from 'react';
import Link from 'next/link';
import { bountyService, signalService } from '@/lib/services';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { BountyDetailView } from './BountyDetailView';
import { validateBountyId } from '@/lib/utils/validators';

interface BountyPageProps {
  params: Promise<{ locale: string; id: string }>;
}

/**
 * Generate static params for build.
 * Returns a placeholder route since we don't have pre-seeded data.
 * Real content will be fetched at runtime from Bulletin Chain.
 */
export function generateStaticParams(): { id: string }[] {
  return [{ id: '_' }];
}

/**
 * Empty state component shown when bounty is not found.
 */
function BountyNotFound({ locale }: { locale: string }): ReactNode {
  return (
    <main className="min-h-screen bg-[var(--bg-default)]">
      <div className="border-b border-[var(--border-default)]">
        <div className="container max-w-3xl mx-auto px-4 py-4">
          <Link
            href={`/${locale}/bounties`}
            className="inline-flex items-center gap-2 text-sm text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] transition-colors"
          >
            <span aria-hidden="true">&larr;</span>
            <span>Back to Bounties</span>
          </Link>
        </div>
      </div>

      <div className="container max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-display text-[var(--fg-primary)] mb-4">
          Bounty Not Found
        </h1>
        <p className="text-[var(--fg-secondary)] mb-8">
          This bounty doesn&apos;t exist or hasn&apos;t been created yet.
        </p>
        <Link
          href={`/${locale}/bounties`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[var(--accent)] text-[var(--bg-default)] font-medium hover:opacity-90 transition-opacity"
        >
          Browse Bounties
        </Link>
      </div>
    </main>
  );
}

export default async function BountyPage({ params }: BountyPageProps): Promise<ReactElement> {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('bounty');

  const bountyId = validateBountyId(id);
  if (bountyId === null) {
    return <BountyNotFound locale={locale} />;
  }

  const bounty = await bountyService.getBounty(bountyId, locale);

  if (bounty == null) {
    return <BountyNotFound locale={locale} />;
  }

  // Fetch contributing signals
  const contributingSignals = await Promise.all(
    bounty.contributingSignals.map((signalId) =>
      signalService.getSignal(signalId, locale)
    )
  );
  const validSignals = contributingSignals.filter((s) => s !== null);

  return (
    <main>
      {/* Breadcrumb */}
      <section className="pt-8">
        <div className="container-wide">
          <nav className="text-sm">
            <Link
              href={`/${locale}/bounties`}
              className="text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] transition-colors"
            >
              {t('breadcrumb.bounties')}
            </Link>
            <span className="mx-2 text-[var(--fg-tertiary)]">/</span>
            <span className="text-[var(--fg-primary)]">{t('breadcrumb.detail')}</span>
          </nav>
        </div>
      </section>

      <BountyDetailView
        bounty={bounty}
        signals={validSignals}
        translations={{
          fundingLabel: t('funding'),
          payoutModeLabel: t('payoutMode'),
          expiresLabel: t('expires'),
          expiredLabel: t('expired'),
          contributingSignalsLabel: t('contributingSignals'),
          noSignalsYet: t('noSignalsYet'),
          illuminateLabel: t('illuminate'),
          fulfilledLabel: t('fulfilled'),
          cancelledLabel: t('cancelled'),
          topicsLabel: t('topics'),
          locationLabel: t('location'),
          descriptionLabel: t('description'),
          postedLabel: t('posted'),
        }}
      />
    </main>
  );
}
