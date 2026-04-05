/**
 * Explore page — Browse active story chains, bounties, and recent signals.
 *
 * Two-column layout:
 * - Left: Filters sidebar (story chains + bounties)
 * - Right: Signal feed (filterable by story or bounty)
 */

import type { ReactElement } from 'react';
import { chainService } from '@/lib/services';
import { signalService } from '@/lib/services';
import { getChainTitle, type Locale } from '@/lib/services/mock-data';
import {
  getBountySignalsMap,
  getChainBountyMap,
  getOrphanBounties,
} from '@/lib/services/mock-data-bounties';
import { ExploreView } from './ExploreView';
import { ExploreHeader } from './ExploreHeader';
import { IlluminateFAB } from './IlluminateFAB';
import { getTranslations, setRequestLocale } from 'next-intl/server';

interface ExplorePageProps {
  params: Promise<{ locale: string }>;
}

export default async function ExplorePage({ params }: ExplorePageProps): Promise<ReactElement> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('explore');

  // Fetch featured chains (with locale for translated content)
  const featuredChains = await chainService.getFeaturedChains(locale as Locale);

  // Fetch recent signals (with locale for translated content)
  const recentSignals = await signalService.getRecentSignals({
    pagination: { limit: 20, offset: 0 },
    locale: locale as Locale,
  });

  // Fetch bounty data
  const bountySignalsMap = getBountySignalsMap();
  const chainBountyMap = getChainBountyMap();
  const orphanBounties = getOrphanBounties();

  // Build chain titles map
  const chainTitles = Object.fromEntries(
    recentSignals.items
      .flatMap((s) => s.chainLinks)
      .map((id) => [id, getChainTitle(id as string, locale as Locale) ?? ''])
  );

  // Parse info popover content - split by double newlines for paragraphs
  const storiesInfoBody = t('storiesInfo.body')
    .split('\n\n')
    .map((paragraph, index) => (
      <p key={index} className={index > 0 ? 'mt-3' : ''}>
        {paragraph}
      </p>
    ));

  const signalsInfoBody = t('signalsInfo.body')
    .split('\n\n')
    .map((paragraph, index) => (
      <p key={index} className={index > 0 ? 'mt-3' : ''}>
        {paragraph}
      </p>
    ));

  const openBountiesInfoBody = t('openBountiesInfo.body')
    .split('\n\n')
    .map((paragraph, index) => (
      <p key={index} className={index > 0 ? 'mt-3' : ''}>
        {paragraph}
      </p>
    ));

  return (
    <>
      <main className="min-h-screen">
        {/* Header with Illuminate button */}
        <ExploreHeader
          title={t('title')}
          description={t('description')}
          illuminateLabel={t('illuminateNew')}
        />

        {/* Two-column layout */}
        <section className="py-6">
          <div className="container-wide">
            <ExploreView
              chains={featuredChains}
              chainBountyMap={chainBountyMap}
              orphanBounties={orphanBounties}
              bountySignalsMap={bountySignalsMap}
              signals={[...recentSignals.items]}
              chainTitles={chainTitles}
              hasMore={recentSignals.hasMore}
              translations={{
                allSignals: t('allSignals'),
                storiesLabel: t('storiesLabel'),
                openBountiesLabel: t('openBountiesLabel'),
                recentSignalsLabel: t('recentSignals'),
                storiesInfoTitle: t('storiesInfo.title'),
                signalsInfoTitle: t('signalsInfo.title'),
                openBountiesInfoTitle: t('openBountiesInfo.title'),
                noMatchingBountySignals: t('noMatchingBountySignals'),
              }}
              storiesInfoBody={storiesInfoBody}
              signalsInfoBody={signalsInfoBody}
              openBountiesInfoBody={openBountiesInfoBody}
            />
          </div>
        </section>

        {/* Mobile floating action button */}
        <IlluminateFAB />
      </main>
    </>
  );
}
