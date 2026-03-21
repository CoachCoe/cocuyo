/**
 * Collective Detail Page
 */

import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { getCollectiveById, getAllCollectiveIds } from '@/lib/services/mock-data';
import { CollectiveDetailView } from './CollectiveDetailView';
import { routing } from '../../../../../i18n/routing';
import { setRequestLocale } from 'next-intl/server';

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export function generateStaticParams(): Array<{ locale: string; id: string }> {
  return routing.locales.flatMap((locale) =>
    getAllCollectiveIds().map((id) => ({ locale, id }))
  );
}

export default async function CollectivePage({ params }: Props): Promise<ReactNode> {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const collective = getCollectiveById(id);

  if (collective === undefined) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[var(--bg-default)]">
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <CollectiveDetailView collective={collective} />
      </div>
    </main>
  );
}
