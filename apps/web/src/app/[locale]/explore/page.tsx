/**
 * Explore page — Browse active story chains, bounties, and recent signals.
 *
 * Two-column layout:
 * - Left: Filters sidebar (story chains + bounties)
 * - Right: Signal feed (filterable by story or bounty)
 */

import type { ReactElement } from 'react';
import { chainService, signalService, bountyService } from '@/lib/services';
import type { ChainId, BountyId, BountyPreview } from '@cocuyo/types';
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
  const featuredChains = await chainService.getFeaturedChains(locale);

  // Fetch recent signals (with locale for translated content)
  const recentSignals = await signalService.getRecentSignals({
    pagination: { limit: 20, offset: 0 },
    locale,
  });

  // Fetch open bounties
  const openBountiesResult = await bountyService.getOpenBounties({
    locale,
    pagination: { limit: 50, offset: 0 },
  });

  // Build bounty-to-signals map (empty for now - would need indexing)
  const bountySignalsMap: Record<BountyId, string[]> = {};

  // Build chain-to-bounties map (empty for now - would need indexing)
  const chainBountyMap: Record<ChainId, BountyPreview[]> = {};

  // All bounties are "orphan" (not linked to chains) without proper indexing
  const orphanBounties: BountyPreview[] = [...openBountiesResult.items];

  // Build chain titles map from fetched data
  const chainTitles: Record<string, string> = {};
  for (const signal of recentSignals.items) {
    for (const chainId of signal.chainLinks) {
      if (chainTitles[chainId] === undefined) {
        const chain = await chainService.getChain(chainId, locale);
        chainTitles[chainId] = chain?.title ?? '';
      }
    }
  }

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
