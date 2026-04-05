/**
 * Post detail page — View a single post with its claims.
 */

import type { ReactElement } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { postService, claimService, signalService } from '@/lib/services';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ClaimCard } from '@cocuyo/ui';
import { routing } from '../../../../../i18n/routing';
import { type Locale, getAllPostIds } from '@/lib/services/mock-data-posts';
import { PostActions } from './PostActions';
import { ExternalLink } from '@/components/ExternalLink';

export function generateStaticParams(): Array<{ locale: string; id: string }> {
  const postIds = getAllPostIds();
  return routing.locales.flatMap((locale) =>
    postIds.map((id) => ({ locale, id }))
  );
}

interface PostDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function PostDetailPage({ params }: PostDetailPageProps): Promise<ReactElement> {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const tPosts = await getTranslations('posts');
  const tClaims = await getTranslations('claims');

  // Fetch the post
  const post = await postService.getPost(id as never, locale as Locale);

  if (post === null) {
    notFound();
  }

  // Fetch claims for this post
  const claims = await claimService.getClaimsByPost(post.id, locale as Locale);

  // Fetch related signals
  const signals = await Promise.all(
    post.relatedSignalIds.map((signalId) => signalService.getSignal(signalId, locale))
  );
  const relatedSignals = signals.filter((s) => s !== null);

  // Build topic translation map
  const topicTranslations: Record<string, string> = {};
  for (const topic of post.context.topics) {
    try {
      topicTranslations[topic] = tPosts(`topics.${topic}`);
    } catch {
      topicTranslations[topic] = topic.replace(/-/g, ' ');
    }
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]">
        <div className="container-wide py-6">
          <Link
            href={`/${locale}/posts`}
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>{tPosts('backToPosts')}</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <article className="py-8">
        <div className="container-wide max-w-3xl">
          {/* Title */}
          <h1 className="text-2xl font-display font-medium text-[var(--fg-primary)] mb-4">
            {post.content.title}
          </h1>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-3 mb-6 text-sm text-[var(--fg-secondary)]">
            <span>By {post.author.pseudonym}</span>
            {post.context.locationName !== undefined && (
              <>
                <span className="text-[var(--fg-tertiary)]">•</span>
                <span>{post.context.locationName}</span>
              </>
            )}
            <span className="text-[var(--fg-tertiary)]">•</span>
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>

          {/* Topics */}
          <div className="flex flex-wrap gap-2 mb-6">
            {post.context.topics.map((topic) => (
              <span
                key={topic}
                className="text-xs px-2 py-1 rounded-full bg-[var(--bg-surface-nested)] text-[var(--fg-secondary)]"
              >
                {topicTranslations[topic] ?? topic.replace(/-/g, ' ')}
              </span>
            ))}
          </div>

          {/* Post content */}
          <div className="prose prose-invert max-w-none mb-8">
            {post.content.text.split('\n\n').map((paragraph, index) => (
              <p key={index} className="text-[var(--fg-primary)] leading-relaxed mb-4">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Links */}
          {post.content.links !== undefined && post.content.links.length > 0 && (
            <div className="mb-8 p-4 bg-[var(--bg-surface-nested)] rounded-container">
              <h3 className="text-sm font-medium text-[var(--fg-primary)] mb-2">
                {tPosts('sources')}
              </h3>
              <ul className="space-y-1">
                {post.content.links.map((link, index) => (
                  <li key={index}>
                    <ExternalLink
                      href={link}
                      className="text-sm text-[var(--color-firefly-gold)] hover:underline break-all"
                    >
                      {link}
                    </ExternalLink>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action buttons */}
          <PostActions
            postId={post.id}
            postTitle={post.content.title}
            translations={{
              extractClaim: tClaims('extractClaim'),
              signInToExtract: tClaims('signInToExtract'),
              claimExtracted: tClaims('claimExtracted'),
            }}
          />

          {/* Extracted Claims Section */}
          {claims.length > 0 && (
            <section className="mb-8">
              <h2 className="text-lg font-display font-medium text-[var(--fg-primary)] mb-4">
                {tClaims('extractedClaims')} ({claims.length})
              </h2>
              <div className="space-y-3">
                {claims.map((claim) => (
                  <Link key={claim.id} href={`/${locale}/claim/${claim.id}`}>
                    <ClaimCard
                      claim={{
                        id: claim.id,
                        statement: claim.statement,
                        sourcePostId: claim.sourcePostId,
                        status: claim.status,
                        topics: claim.topics,
                        evidenceCount: claim.evidence.length,
                        supportingCount: claim.evidence.filter((e) => e.supports).length,
                        contradictingCount: claim.evidence.filter((e) => !e.supports).length,
                        createdAt: claim.createdAt,
                      }}
                      topicTranslations={topicTranslations}
                      translations={{
                        supporting: tClaims('supporting'),
                        contradicting: tClaims('contradicting'),
                        evidence: tClaims('evidence'),
                        viewClaim: tClaims('viewClaim'),
                        statusPending: tClaims('statusPending'),
                        statusUnderReview: tClaims('statusUnderReview'),
                        statusVerified: tClaims('statusVerified'),
                        statusDisputed: tClaims('statusDisputed'),
                        statusFalse: tClaims('statusFalse'),
                        statusUnverifiable: tClaims('statusUnverifiable'),
                      }}
                    />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Related Signals Section */}
          {relatedSignals.length > 0 && (
            <section>
              <h2 className="text-lg font-display font-medium text-[var(--fg-primary)] mb-4">
                {tPosts('relatedSignals')} ({relatedSignals.length})
              </h2>
              <div className="space-y-3">
                {relatedSignals.map((signal) => (
                  <Link
                    key={signal.id}
                    href={`/${locale}/signal/${signal.id}`}
                    className="block p-4 bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-container hover:border-[var(--color-firefly-gold)]/40 transition-colors"
                  >
                    <p className="text-sm text-[var(--fg-primary)] line-clamp-2">
                      {signal.content.text}
                    </p>
                    <p className="text-xs text-[var(--fg-tertiary)] mt-2">
                      By {signal.author.pseudonym}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </article>
    </main>
  );
}
