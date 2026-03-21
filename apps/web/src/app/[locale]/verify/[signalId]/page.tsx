/**
 * Verification Detail Page
 */

import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { getVerificationBySignalId, getSignalById, getCollectiveById, mockVerificationRequests } from '@/lib/services/mock-data';
import { VerifyDetailView } from './VerifyDetailView';
import { routing } from '../../../../../i18n/routing';
import { setRequestLocale } from 'next-intl/server';

interface Props {
  params: Promise<{ locale: string; signalId: string }>;
}

export function generateStaticParams(): Array<{ locale: string; signalId: string }> {
  return routing.locales.flatMap((locale) =>
    mockVerificationRequests.map((v) => ({ locale, signalId: v.signalId }))
  );
}

export default async function VerifySignalPage({ params }: Props): Promise<ReactNode> {
  const { locale, signalId } = await params;
  setRequestLocale(locale);
  const request = getVerificationBySignalId(signalId);
  const signal = getSignalById(signalId);

  if (request === undefined || signal === undefined) {
    notFound();
  }

  const collective = getCollectiveById(request.collectiveId);

  return (
    <main className="min-h-screen bg-[var(--bg-default)]">
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <VerifyDetailView request={request} signal={signal} {...(collective !== undefined && { collectiveName: collective.name })} />
      </div>
    </main>
  );
}
