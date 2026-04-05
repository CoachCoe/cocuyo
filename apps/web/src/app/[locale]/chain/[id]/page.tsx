/**
 * Story Chain detail page — View a complete story with signals, analysis, and bounties.
 *
 * This page shows:
 * - Chain title, description, and status
 * - Verification trail summary
 * - Tabbed content:
 *   - What's Happening: Signals in the chain
 *   - Deep Dives: Analysis posts related to this chain
 *   - Help Needed: Open bounties for this chain
 */

import type { ReactElement, ReactNode } from 'react';
import Link from 'next/link';
import { signalService, chainService, postService } from '@/lib/services';
import { ChainSignalList } from './ChainSignalList';
import { ChainTabs } from './ChainTabs';
import { AddSignalButton } from './AddSignalButton';
import { createChainId } from '@cocuyo/types';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { createServerFormatters } from '@/lib/hooks/serverFormatters';
import { validateChainId } from '@/lib/utils/validators';

interface ChainPageProps {
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

function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'var(--color-corroborated)';
    case 'established':
      return 'var(--color-accent)';
    case 'emerging':
      return 'var(--color-text-secondary)';
    case 'contested':
      return 'var(--color-challenged)';
    default:
      return 'var(--color-text-tertiary)';
  }
}

/**
 * Empty state component shown when chain is not found.
 */
function ChainNotFound({ locale }: { locale: string }): ReactNode {
  return (
    <main className="min-h-screen bg-[var(--bg-default)]">
      <div className="border-b border-[var(--border-default)]">
        <div className="container max-w-3xl mx-auto px-4 py-4">
          <Link
            href={`/${locale}/explore`}
            className="inline-flex items-center gap-2 text-sm text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] transition-colors"
          >
            <span aria-hidden="true">&larr;</span>
            <span>Back to Explore</span>
          </Link>
        </div>
      </div>

      <div className="container max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-display text-[var(--fg-primary)] mb-4">
          Story Chain Not Found
        </h1>
        <p className="text-[var(--fg-secondary)] mb-8">
          This story chain doesn&apos;t exist or hasn&apos;t been created yet.
        </p>
        <Link
          href={`/${locale}/explore`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[var(--accent)] text-[var(--bg-default)] font-medium hover:opacity-90 transition-opacity"
        >
          Explore Stories
        </Link>
      </div>
    </main>
  );
}


export default async function ChainPage({ params }: ChainPageProps): Promise<ReactElement> {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('chain');
  const { formatDate } = createServerFormatters(locale);

  const chainId = validateChainId(id);
  if (chainId === null) {
    return <ChainNotFound locale={locale} />;
  }

  const chain = await chainService.getChain(chainId, locale);

  if (chain == null) {
    return <ChainNotFound locale={locale} />;
  }

  // Get signals for this chain using service
  const signals = await signalService.getChainSignals(createChainId(id), locale);

  // Get posts related to this chain
  const allPosts = await postService.getPostsByChain(createChainId(id), locale);

  // Chain-linked bounties require indexing that doesn't exist yet.
  // Return empty array to avoid showing incorrect/unrelated bounties.
  const chainBounties: never[] = [];

  const statusColor = getStatusColor(chain.status);

  // Signals content
  const signalsContent = (
    <div>
      {signals.length > 0 ? (
        <>
          <div className="mb-4 text-sm text-[var(--fg-secondary)]">
            {t('whatsHappening.description')}
          </div>
          <ChainSignalList signals={[...signals]} />
        </>
      ) : (
        <div className="text-center py-12 bg-[var(--bg-surface-nested)] rounded-lg border border-[var(--border-default)]">
          <p className="text-[var(--fg-secondary)] mb-4">
            {t('whatsHappening.noSignals')}
          </p>
          <AddSignalButton chainId={createChainId(id)}>
            {t('beFirstToIlluminate')}
          </AddSignalButton>
        </div>
      )}
    </div>
  );

  // Posts content
  const postsContent = (
    <div>
      {allPosts.length > 0 ? (
        <>
          <div className="mb-4 text-sm text-[var(--fg-secondary)]">
            {t('deepDives.description')}
          </div>
          <div className="space-y-4">
            {allPosts.map((post) => (
              <Link
                key={post.id}
                href={`/${locale}/post/${post.id}`}
                className="block p-4 bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-lg hover:border-[var(--color-firefly-gold)]/40 transition-colors"
              >
                <h3 className="font-medium text-[var(--fg-primary)] mb-2">
                  {post.content.title}
                </h3>
                <p className="text-sm text-[var(--fg-secondary)] line-clamp-2">
                  {post.content.text.slice(0, 200)}...
                </p>
                <div className="mt-2 text-xs text-[var(--fg-tertiary)]">
                  By {post.author.pseudonym}
                </div>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12 bg-[var(--bg-surface-nested)] rounded-lg border border-[var(--border-default)]">
          <p className="text-[var(--fg-secondary)]">
            {t('deepDives.noPosts')}
          </p>
        </div>
      )}
    </div>
  );

  // Bounties content
  const bountiesContent = (
    <div>
      <div className="text-center py-12 bg-[var(--bg-surface-nested)] rounded-lg border border-[var(--border-default)]">
        <p className="text-[var(--fg-secondary)]">
          {t('helpNeeded.noBounties')}
        </p>
      </div>
    </div>
  );

  return (
    <>
      <main>
        {/* Header */}
        <section className="py-12 border-b border-[var(--border-default)]">
          <div className="container-wide">
            {/* Breadcrumb */}
            <nav className="mb-6 text-sm">
              <Link
                href={`/${locale}/explore`}
                className="text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] transition-colors"
              >
                {t('backToStories')}
              </Link>
              <span className="mx-2 text-[var(--fg-tertiary)]">/</span>
              <span className="text-[var(--fg-primary)]">{t('storyChain')}</span>
            </nav>

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                {/* Status badge */}
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="px-3 py-1 text-sm rounded-full capitalize"
                    style={{
                      color: statusColor,
                      border: `1px solid ${statusColor}`,
                    }}
                  >
                    {chain.status}
                  </span>
                  {chain.location != null && (
                    <span className="text-sm text-[var(--fg-tertiary)]">
                      {chain.location}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold mb-4">{chain.title}</h1>

                {/* Description */}
                <p className="text-[var(--fg-secondary)] max-w-2xl leading-relaxed">
                  {chain.description}
                </p>

                {/* Topics */}
                <div className="flex flex-wrap gap-2 mt-6">
                  {chain.topics.map((topic) => (
                    <span
                      key={topic}
                      className="px-3 py-1 text-sm bg-[var(--bg-surface-nested)] text-[var(--fg-secondary)] rounded-full"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats card */}
              <div className="lg:w-72 p-6 bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-lg">
                <h3 className="font-semibold mb-4">{t('verificationSummary')}</h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-[var(--fg-secondary)]">{t('signals')}</dt>
                    <dd className="text-[var(--fg-primary)] font-medium">{chain.stats.signalCount}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--fg-secondary)]">{t('corroborations')}</dt>
                    <dd className="text-[var(--fg-success)] font-medium">
                      {chain.stats.totalCorroborations}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--fg-secondary)]">{t('challenges')}</dt>
                    <dd
                      className="font-medium"
                      style={{
                        color:
                          chain.stats.totalChallenges > 0
                            ? 'var(--fg-error)'
                            : 'var(--fg-secondary)',
                      }}
                    >
                      {chain.stats.totalChallenges}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--fg-secondary)]">{t('contributors')}</dt>
                    <dd className="text-[var(--fg-primary)] font-medium">{chain.stats.contributorCount}</dd>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-[var(--border-subtle)]">
                    <dt className="text-[var(--fg-secondary)]">{t('weight')}</dt>
                    <dd className="text-[var(--color-firefly-gold)] font-medium">
                      {chain.stats.totalWeight.toFixed(1)}
                    </dd>
                  </div>
                </dl>

                <div className="mt-6 pt-4 border-t border-[var(--border-subtle)]">
                  <p className="text-xs text-[var(--fg-tertiary)] mb-1">
                    {t('chainStarted')}
                  </p>
                  <p className="text-sm text-[var(--fg-secondary)]">
                    {formatDate(chain.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Add to Chain CTA */}
        <section className="py-6 bg-[var(--bg-surface-raised)] border-b border-[var(--border-default)]">
          <div className="container-wide flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[var(--fg-secondary)]">
              {t('addSignalCta')}
            </p>
            <AddSignalButton chainId={createChainId(id)} />
          </div>
        </section>

        {/* Tabbed Content */}
        <section className="py-6">
          <div className="container-wide">
            <ChainTabs
              signalsContent={signalsContent}
              postsContent={postsContent}
              bountiesContent={bountiesContent}
              signalsCount={signals.length}
              postsCount={allPosts.length}
              bountiesCount={chainBounties.length}
              translations={{
                whatsHappening: t('tabs.whatsHappening'),
                deepDives: t('tabs.deepDives'),
                helpNeeded: t('tabs.helpNeeded'),
              }}
            />
          </div>
        </section>
      </main>
    </>
  );
}
