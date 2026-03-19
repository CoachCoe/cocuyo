/**
 * Public Profile Page — View another firefly's profile.
 */

import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { VerificationBadge } from '@cocuyo/ui';
import { getAuthorById, getSignalsByAuthor, mockSignals } from '@/lib/services/mock-data';

interface Props {
  params: Promise<{ id: string }>;
}

export function generateStaticParams(): Array<{ id: string }> {
  const authorIds = [...new Set(mockSignals.map((s) => s.author.id))];
  return authorIds.map((id) => ({ id }));
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const ts = timestamp > 1e12 ? timestamp : timestamp * 1000;
  const diff = now - ts;
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default async function PublicProfilePage({ params }: Props): Promise<ReactNode> {
  const { id } = await params;
  const author = getAuthorById(id);

  if (author === undefined) {
    notFound();
  }

  const signals = getSignalsByAuthor(id);

  return (
    <main className="min-h-screen bg-[var(--bg-default)]">
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <Link href="/feed" className="inline-flex items-center gap-2 text-sm text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] transition-colors mb-6">
          <span>&larr;</span> Back
        </Link>

        {/* Profile Card */}
        <div className="p-6 bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-container mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-[var(--bg-surface-container)] border border-[var(--border-default)] flex items-center justify-center text-2xl font-bold text-[var(--fg-primary)]">
              {author.pseudonym.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-semibold text-[var(--fg-primary)]">{author.pseudonym}</h1>
              {author.location !== undefined && (
                <p className="text-sm text-[var(--fg-tertiary)]">{author.location}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <VerificationBadge status="verified" showLabel size="sm" />
            {author.reputation !== undefined && (
              <>
                <span className="text-[var(--fg-tertiary)]">&middot;</span>
                <span className="text-sm text-[var(--fg-secondary)]">
                  <span className="text-[var(--color-firefly-gold)] font-medium">{author.reputation}</span> reputation
                </span>
              </>
            )}
          </div>
        </div>

        {/* Signals by this author */}
        <div>
          <h2 className="text-lg font-semibold text-[var(--fg-primary)] mb-4">
            Signals ({signals.length})
          </h2>

          {signals.length === 0 ? (
            <p className="text-[var(--fg-tertiary)]">No signals yet.</p>
          ) : (
            <div className="space-y-4">
              {signals.map((signal) => (
                <Link key={signal.id} href={`/signal/${signal.id}`}
                  className="block p-4 bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-container hover:border-[var(--border-emphasis)] transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <VerificationBadge status={signal.verification.status} size="sm" />
                    <span className="text-xs text-[var(--fg-tertiary)]">{formatRelativeTime(signal.createdAt)}</span>
                  </div>
                  <p className="text-[var(--fg-primary)] line-clamp-2">{signal.content.text}</p>
                  <div className="flex gap-2 mt-2">
                    {signal.context.topics.map((topic) => (
                      <span key={topic} className="px-2 py-0.5 bg-[var(--bg-surface-container)] rounded-full text-xs text-[var(--fg-tertiary)] capitalize">
                        {topic}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
