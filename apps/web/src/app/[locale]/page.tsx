/**
 * Landing page — The first impression of the Firefly Network.
 *
 * Simple intro with one CTA to enter the app.
 */

import type { ReactElement } from 'react';
import { Link } from '../../../i18n/navigation';
import { Button, FireflySymbol } from '@cocuyo/ui';
import { getTranslations, setRequestLocale } from 'next-intl/server';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps): Promise<ReactElement> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home');
  const tActions = await getTranslations('actions');

  return (
    <>
      <main>
        {/* Hero Section */}
        <section className="min-h-[90vh] flex items-center justify-center relative overflow-hidden">
          {/* Background glow effect */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl pointer-events-none bg-firefly-gold"
            aria-hidden="true"
          />

          <div className="container-wide relative z-10 text-center py-20">
            {/* Firefly symbol */}
            <div className="mb-8">
              <FireflySymbol size={48} color="gold" animate aria-hidden="true" />
            </div>

            {/* Headline */}
            <h1 className="hero-heading text-4xl md:text-5xl lg:text-6xl mb-6 max-w-4xl mx-auto text-balance">
              {t('hero.title')}
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-secondary mb-8 max-w-2xl mx-auto leading-relaxed">
              {t('hero.subtitle')}
            </p>

            {/* Pillars */}
            <div className="flex flex-wrap justify-center gap-4 text-sm text-secondary mb-12">
              <span className="px-4 py-2 border border-DEFAULT rounded-full">
                {t('pillars.anonymousButHuman')}
              </span>
              <span className="px-4 py-2 border border-DEFAULT rounded-full">
                {t('pillars.verifiedButPrivate')}
              </span>
              <span className="px-4 py-2 border border-DEFAULT rounded-full">
                {t('pillars.distributedButConnected')}
              </span>
            </div>

            {/* Primary CTA - Enter the app */}
            <Link href="/explore">
              <Button variant="illuminate" size="lg">
                {tActions('illuminate')}
              </Button>
            </Link>

            {/* Secondary link to About */}
            <div className="mt-6">
              <Link
                href="/about"
                className="text-sm text-secondary hover:text-primary transition-colors"
              >
                {t('cta.howItWorks')}
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
