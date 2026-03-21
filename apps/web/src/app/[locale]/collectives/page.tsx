/**
 * Collectives Page — Browse fact-checking collectives.
 */

import type { ReactNode } from 'react';
import Link from 'next/link';
import { getCollectivePreviews } from '@/lib/services/mock-data';
import { setRequestLocale } from 'next-intl/server';

interface CollectivesPageProps {
  params: Promise<{ locale: string }>;
}

export default async function CollectivesPage({ params }: CollectivesPageProps): Promise<ReactNode> {
  const { locale } = await params;
  setRequestLocale(locale);

  const collectives = getCollectivePreviews();

  return (
    <main className="min-h-screen bg-[var(--bg-default)]">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[var(--fg-primary)]">Collectives</h1>
            <p className="text-[var(--fg-secondary)] mt-1">
              Fact-checking groups that verify signals collaboratively
            </p>
          </div>
          <Link href="/collectives/create"
            className="px-4 py-2 bg-[var(--color-firefly-gold)] text-[var(--bg-surface-main)] font-semibold rounded-nested hover:brightness-110 transition-all">
            Create Collective
          </Link>
        </div>

        <div className="grid gap-4">
          {collectives.map((collective) => (
            <Link key={collective.id} href={`/collectives/${collective.id}`}
              className="block p-6 bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-container hover:border-[var(--border-emphasis)] transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--fg-primary)]">{collective.name}</h2>
                  <p className="text-sm text-[var(--fg-secondary)] mt-1">{collective.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[var(--color-firefly-gold)]">{collective.reputation}</div>
                  <div className="text-xs text-[var(--fg-tertiary)]">reputation</div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-[var(--fg-tertiary)]">
                <span>{collective.memberCount} members</span>
                <span>&middot;</span>
                <span>{collective.verificationsCompleted} verifications</span>
                <span>&middot;</span>
                <div className="flex gap-1">
                  {collective.topics.slice(0, 3).map((topic) => (
                    <span key={topic} className="px-2 py-0.5 bg-[var(--bg-surface-container)] rounded-full text-xs capitalize">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
