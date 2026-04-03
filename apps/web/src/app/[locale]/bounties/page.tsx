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
  const t = await getTranslations('bounties');

  // Get all bounties (use extended service method for all statuses)
  const mockService = bountyService as MockBountyService;
  const bountiesResult = await mockService.getAllBounties({
    pagination: { limit: 50, offset: 0 },
  });

  // Extract unique topics from bounties
  const allTopics = Array.from(
    new Set(bountiesResult.items.flatMap((b) => [...b.topics]))
  ).sort();

  // Parse info popover content
  const infoBody = t('info.body')
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
        title={t('title')}
        description={t('description')}
      />

      {/* Main content */}
      <section className="py-6">
        <div className="container-wide">
          <BountiesView
            bounties={[...bountiesResult.items]}
            topics={allTopics}
            hasMore={bountiesResult.hasMore}
            translations={{
              allLabel: t('allBounties'),
              statusLabel: t('status'),
              topicsLabel: t('topics'),
              infoTitle: t('info.title'),
            }}
            infoBody={infoBody}
          />
        </div>
      </section>
    </main>
  );
}
