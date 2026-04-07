/**
 * Claim detail page — View a single claim with its evidence.
 */

import type { ReactElement, ReactNode } from 'react';
import Link from 'next/link';
import { claimService, signalService, postService } from '@/lib/services';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ClaimStatusBadge } from '@cocuyo/ui';
import { validateClaimId } from '@/lib/utils/validators';
import { ClaimActions } from './ClaimActions';

interface ClaimDetailPageProps {
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
 * Empty state component shown when claim is not found.
 */
function ClaimNotFound({ locale }: { locale: string }): ReactNode {
  return (
    <main className="min-h-screen bg-[var(--bg-default)]">
      <div className="border-b border-[var(--border-default)]">
        <div className="container max-w-3xl mx-auto px-4 py-4">
          <Link
            href={`/${locale}/posts`}
            className="inline-flex items-center gap-2 text-sm text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] transition-colors"
          >
            <span aria-hidden="true">&larr;</span>
            <span>Back to Posts</span>
          </Link>
        </div>
      </div>

      <div className="container max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-display text-[var(--fg-primary)] mb-4">
          Claim Not Found
        </h1>
        <p className="text-[var(--fg-secondary)] mb-8">
          This claim doesn&apos;t exist or hasn&apos;t been extracted yet.
        </p>
        <Link
          href={`/${locale}/posts`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[var(--accent)] text-[var(--bg-default)] font-medium hover:opacity-90 transition-opacity"
        >
          Browse Posts
        </Link>
      </div>
    </main>
  );
}

export default async function ClaimDetailPage({ params }: ClaimDetailPageProps): Promise<ReactElement> {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const tClaims = await getTranslations('claims');
  const tPosts = await getTranslations('posts');

  const claimId = validateClaimId(id);
  if (claimId === null) {
    return <ClaimNotFound locale={locale} />;
  }

  // Fetch the claim
  const claim = await claimService.getClaim(claimId, locale);

  if (claim === null) {
    return <ClaimNotFound locale={locale} />;
  }

  // Fetch the source post
  const sourcePost = await postService.getPost(claim.sourcePostId, locale);

  // Fetch evidence posts
  const evidencePosts = await Promise.all(
    claim.evidence.map(async (e) => {
      const post = await signalService.getPost(e.postId, locale);
      return { ...e, post };
    })
  );

  const supportingEvidence = evidencePosts.filter((e) => e.supports);
  const contradictingEvidence = evidencePosts.filter((e) => !e.supports);

  // Build topic translation map
  const topicTranslations: Record<string, string> = {};
  for (const topic of claim.topics) {
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
            href={sourcePost !== null ? `/${locale}/post/${sourcePost.id}` : `/${locale}/posts`}
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>{tClaims('backToPost')}</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <article className="py-8">
        <div className="container-wide max-w-3xl">
          {/* Status badge and meta */}
          <div className="flex items-center gap-3 mb-4">
            <ClaimStatusBadge
              status={claim.status}
              size="md"
              translations={{
                pending: tClaims('statusPending'),
                under_review: tClaims('statusUnderReview'),
                verified: tClaims('statusVerified'),
                disputed: tClaims('statusDisputed'),
                false: tClaims('statusFalse'),
                unverifiable: tClaims('statusUnverifiable'),
              }}
            />
            <span className="text-sm text-[var(--fg-tertiary)]">
              {new Date(claim.createdAt).toLocaleDateString()}
            </span>
          </div>

          {/* Claim statement */}
          <blockquote className="text-xl font-medium text-[var(--fg-primary)] mb-6 pl-4 border-l-2 border-[var(--color-firefly-gold)]">
            &ldquo;{claim.statement}&rdquo;
          </blockquote>

          {/* Source post link */}
          {sourcePost !== null && (
            <div className="mb-6 p-4 bg-[var(--bg-surface-nested)] rounded-container">
              <p className="text-xs text-[var(--fg-tertiary)] mb-1">{tClaims('extractedFrom')}</p>
              <Link
                href={`/${locale}/post/${sourcePost.id}`}
                className="text-sm text-[var(--fg-primary)] hover:text-[var(--color-firefly-gold)] transition-colors"
              >
                {sourcePost.content.title}
              </Link>
            </div>
          )}

          {/* Topics */}
          <div className="flex flex-wrap gap-2 mb-8">
            {claim.topics.map((topic) => (
              <span
                key={topic}
                className="text-xs px-2 py-1 rounded-full bg-[var(--bg-surface-nested)] text-[var(--fg-secondary)]"
              >
                {topicTranslations[topic] ?? topic.replace(/-/g, ' ')}
              </span>
            ))}
          </div>

          {/* Action buttons */}
          <ClaimActions
            claimId={claim.id}
            claimStatement={claim.statement}
            translations={{
              submitEvidence: tClaims('submitEvidence'),
              signInToSubmit: tClaims('signInToSubmit'),
              evidenceSubmitted: tClaims('evidenceSubmitted'),
              supportThisClaim: tClaims('supportThisClaim'),
              contradictThisClaim: tClaims('contradictThisClaim'),
            }}
          />

          {/* Verdict section (if exists) */}
          {claim.verdict !== undefined && (
            <section className="mb-8 p-4 bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-container">
              <h2 className="text-sm font-medium text-[var(--fg-primary)] mb-2">
                {tClaims('verdict')}
              </h2>
              <p className="text-sm text-[var(--fg-secondary)] mb-2">
                {claim.verdict.reasoning}
              </p>
              <p className="text-xs text-[var(--fg-tertiary)]">
                {tClaims('issuedOn')} {new Date(claim.verdict.issuedAt).toLocaleDateString()}
              </p>
            </section>
          )}

          {/* Evidence sections */}
          <div className="space-y-8">
            {/* Supporting evidence */}
            <section>
              <h2 className="text-lg font-display font-medium text-[var(--fg-primary)] mb-4 flex items-center gap-2">
                <span className="text-[var(--fg-success)]">+</span>
                {tClaims('supportingEvidence')} ({supportingEvidence.length})
              </h2>
              {supportingEvidence.length === 0 ? (
                <p className="text-sm text-[var(--fg-tertiary)] italic">
                  {tClaims('noSupportingEvidence')}
                </p>
              ) : (
                <div className="space-y-3">
                  {supportingEvidence.map((e) => (
                    <div
                      key={e.postId}
                      className="p-4 bg-[var(--bg-surface-nested)] border border-[var(--fg-success)]/20 rounded-container"
                    >
                      {e.post !== null && (
                        <Link
                          href={`/${locale}/post/${e.post.id}`}
                          className="block hover:opacity-80 transition-opacity"
                        >
                          <p className="text-sm text-[var(--fg-primary)] line-clamp-2 mb-2">
                            {e.post.content.text}
                          </p>
                          <p className="text-xs text-[var(--fg-tertiary)]">
                            By {e.post.author.pseudonym}
                          </p>
                        </Link>
                      )}
                      {e.note !== undefined && (
                        <p className="text-xs text-[var(--fg-secondary)] mt-2 italic">
                          Note: {e.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Contradicting evidence */}
            <section>
              <h2 className="text-lg font-display font-medium text-[var(--fg-primary)] mb-4 flex items-center gap-2">
                <span className="text-[var(--fg-error)]">-</span>
                {tClaims('contradictingEvidence')} ({contradictingEvidence.length})
              </h2>
              {contradictingEvidence.length === 0 ? (
                <p className="text-sm text-[var(--fg-tertiary)] italic">
                  {tClaims('noContradictingEvidence')}
                </p>
              ) : (
                <div className="space-y-3">
                  {contradictingEvidence.map((e) => (
                    <div
                      key={e.postId}
                      className="p-4 bg-[var(--bg-surface-nested)] border border-[var(--fg-error)]/20 rounded-container"
                    >
                      {e.post !== null && (
                        <Link
                          href={`/${locale}/post/${e.post.id}`}
                          className="block hover:opacity-80 transition-opacity"
                        >
                          <p className="text-sm text-[var(--fg-primary)] line-clamp-2 mb-2">
                            {e.post.content.text}
                          </p>
                          <p className="text-xs text-[var(--fg-tertiary)]">
                            By {e.post.author.pseudonym}
                          </p>
                        </Link>
                      )}
                      {e.note !== undefined && (
                        <p className="text-xs text-[var(--fg-secondary)] mt-2 italic">
                          Note: {e.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </article>
    </main>
  );
}
