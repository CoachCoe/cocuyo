/**
 * Verification Workbench — Queue of signals awaiting verification.
 */

import type { ReactNode } from 'react';
import Link from 'next/link';
import { getPendingVerifications, getSignalById, getCollectiveById } from '@/lib/services/mock-data';
import { getTranslations, setRequestLocale } from 'next-intl/server';

interface VerifyPageProps {
  params: Promise<{ locale: string }>;
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const ts = timestamp > 1e12 ? timestamp : timestamp * 1000;
  const diff = now - ts;
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default async function VerifyPage({ params }: VerifyPageProps): Promise<ReactNode> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('verify');

  const requests = getPendingVerifications();

  return (
    <main className="min-h-screen bg-[var(--bg-default)]">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--fg-primary)]">{t('title')}</h1>
          <p className="text-[var(--fg-secondary)] mt-1">{t('description')}</p>
        </div>

        {requests.length === 0 ? (
          <div className="p-8 bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-container text-center">
            <p className="text-[var(--fg-secondary)]">{t('noPending')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => {
              const signal = getSignalById(request.signalId);
              const collective = getCollectiveById(request.collectiveId);
              if (signal === undefined) return null;

              return (
                <Link key={request.id} href={`/verify/${request.signalId}`}
                  className="block p-6 bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-container hover:border-[var(--border-emphasis)] transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                        request.status === 'pending' ? 'bg-[var(--fg-tertiary)]/20 text-[var(--fg-tertiary)]' :
                        request.status === 'in_review' ? 'bg-[var(--fg-warning)]/20 text-[var(--fg-warning)]' :
                        'bg-[var(--color-firefly-gold)]/20 text-[var(--color-firefly-gold)]'
                      }`}>
                        {request.status.replace('_', ' ')}
                      </span>
                      {collective !== undefined && (
                        <span className="text-sm text-[var(--fg-tertiary)]">{collective.name}</span>
                      )}
                    </div>
                    <span className="text-sm text-[var(--fg-tertiary)]">{formatRelativeTime(request.createdAt)}</span>
                  </div>

                  <p className="text-[var(--fg-primary)] mb-3 line-clamp-2">{signal.content.text}</p>

                  <div className="flex items-center gap-4 text-sm text-[var(--fg-tertiary)]">
                    <span>{request.evidence.length} {t('evidence')}</span>
                    <span>&middot;</span>
                    <span>{request.votes.length} {t('votes')}</span>
                    <span>&middot;</span>
                    <span className="capitalize">{signal.context.topics[0]}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
