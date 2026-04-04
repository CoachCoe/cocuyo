/**
 * Bounties page — Browse community-funded information requests.
 *
 * Clean layout with horizontal filter bar above bounty card grid.
 */

import type { ReactElement } from 'react';
import { bountyService } from '@/lib/services';
import { MockBountyService } from '@/lib/services/mock-bounty-service';
import { BountiesView } from './BountiesView';
import { BountiesHeader } from './BountiesHeader';
import { getTranslations, setRequestLocale } from 'next-intl/server';

interface BountiesPageProps {
  params: Promise<{ locale: string }>;
}

export default async function BountiesPage({ params }: BountiesPageProps): Promise<ReactElement> {
  const { locale } = await params;
  setRequestLocale(locale);
  const tBounties = await getTranslations('bounties');
  const tBounty = await getTranslations('bounty');

  // Get all bounties (use extended service method for all statuses)
  const mockService = bountyService as MockBountyService;
  const bountiesResult = await mockService.getAllBounties({
    pagination: { limit: 50, offset: 0 },
  });

  // Extract unique topics from bounties
  const allTopics = Array.from(
    new Set(bountiesResult.items.flatMap((b) => [...b.topics]))
  ).sort();

  // Build topic translation map
  const topicTranslations: Record<string, string> = {};
  for (const topic of allTopics) {
    try {
      topicTranslations[topic] = tBounties(`topics.${topic}`);
    } catch {
      // Fallback to formatted slug if translation missing
      topicTranslations[topic] = topic.replace(/-/g, ' ');
    }
  }

  // Parse info popover content
  const infoBody = tBounties('info.body')
    .split('\n\n')
    .map((paragraph, index) => (
      <p key={index} className={index > 0 ? 'mt-3' : ''}>
        {paragraph}
      </p>
    ));

  return (
    <main className="min-h-screen">
      {/* Header */}
      <BountiesHeader
        title={tBounties('title')}
        description={tBounties('description')}
        infoTitle={tBounties('info.title')}
        infoBody={infoBody}
        infoTriggerLabel={tBounty('whatsThis')}
        createButtonLabel={tBounties('createButton')}
      />

      {/* Main content */}
      <section className="py-6">
        <div className="container-wide">
          <BountiesView
            bounties={[...bountiesResult.items]}
            topics={allTopics}
            topicTranslations={topicTranslations}
            hasMore={bountiesResult.hasMore}
            translations={{
              all: tBounties('allBounties'),
              statusLabel: tBounties('statusLabel'),
              statusOpen: tBounties('statusOpen'),
              statusFulfilled: tBounties('statusFulfilled'),
              statusExpired: tBounties('statusExpired'),
              statusCancelled: tBounties('statusCancelled'),
              bountyWord: tBounties('bountyWord'),
              bountiesWord: tBounties('bountiesWord'),
              ofWord: tBounties('ofWord'),
              clearFilters: tBounties('clearFilters'),
              filterByTopic: tBounties('filterByTopic'),
              searchPlaceholder: tBounties('searchPlaceholder'),
              topicSelected: tBounties('topicSelected'),
              topicsSelected: tBounties('topicsSelected'),
              // BountyCard translations
              expired: tBounty('expired'),
              expiresSoon: tBounty('expiresSoon'),
              hoursLeftSuffix: tBounty('hoursLeftSuffix'),
              dayLeft: tBounty('dayLeft'),
              daysLeftSuffix: tBounty('daysLeftSuffix'),
              signalWord: tBounty('signalWord'),
              signalsWord: tBounty('signalsWord'),
              illuminate: tBounty('illuminate'),
              paymentPublic: tBounty('paymentPublic'),
              paymentPrivate: tBounty('paymentPrivate'),
            }}
          />
        </div>
      </section>
    </main>
  );
}
