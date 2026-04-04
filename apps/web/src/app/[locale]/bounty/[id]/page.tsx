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

import type { ReactElement } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { bountyService, signalService } from '@/lib/services';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { BountyDetailView } from './BountyDetailView';
import type { BountyId } from '@cocuyo/types';
import { getBounties } from '@/lib/services/mock-data-bounties';
import { routing } from '../../../../../i18n/routing';

/**
 * Generate static params for all known bounties across all locales.
 */
export function generateStaticParams(): Array<{ locale: string; id: string }> {
  const bountyIds = getBounties().map((b) => b.id);
  return routing.locales.flatMap((locale) =>
    bountyIds.map((id) => ({
      locale,
      id,
    }))
  );
}

interface BountyPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function BountyPage({ params }: BountyPageProps): Promise<ReactElement> {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('bounty');

  const bounty = await bountyService.getBounty(id as BountyId, locale);

  if (bounty == null) {
    notFound();
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
        }}
      />
    </main>
  );
}
