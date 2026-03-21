/**
 * Landing page — The first impression of the Firefly Network.
 *
 * This page should communicate:
 * - The firefly metaphor and mission
 * - What makes this different from social media
 * - The three pillars: Anonymous but Human, Verified but Private, Distributed but Connected
 * - Clear call to action: Explore or Illuminate
 */

import type { ReactElement } from 'react';
import Link from 'next/link';
import { Button, FireflySymbol } from '@cocuyo/ui';
import { IlluminateButton } from '@/components/IlluminateButton';
import { getTranslations, setRequestLocale } from 'next-intl/server';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps): Promise<ReactElement> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home');
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
              <FireflySymbol size={48} color="gold" aria-hidden="true" />
            </div>

            {/* Headline - uses DM Serif Display */}
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

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/explore">
                <Button variant="primary" size="lg">
                  {t('cta.explore')}
                </Button>
              </Link>
              <IlluminateButton size="lg" />
            </div>
          </div>
        </section>

        {/* What is This Section */}
        <section className="py-24 border-t border-DEFAULT">
          <div className="container-narrow">
            <h2 className="text-3xl font-semibold mb-8 text-center">
              {t('whatIs.title')}
            </h2>

            <div className="space-y-6 text-secondary leading-relaxed">
              <p>{t('whatIs.p1')}</p>
              <p>{t('whatIs.p2')}</p>
              <p>{t('whatIs.p3')}</p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 border-t border-DEFAULT bg-surface-container">
          <div className="container-wide">
            <h2 className="text-3xl font-semibold mb-16 text-center">
              {t('howItWorks.title')}
            </h2>

            <div className="grid md:grid-cols-3 gap-12">
              {/* Signals */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-surface-nested border border-DEFAULT flex items-center justify-center">
                  <span className="text-2xl text-firefly-gold">
                    ✦
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-4">{t('howItWorks.illuminate.title')}</h3>
                <p className="text-secondary leading-relaxed">
                  {t('howItWorks.illuminate.description')}
                </p>
              </div>

              {/* Corroboration */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-surface-nested border border-DEFAULT flex items-center justify-center">
                  <span className="text-2xl text-corroborated">
                    ◉
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-4">{t('howItWorks.corroborate.title')}</h3>
                <p className="text-secondary leading-relaxed">
                  {t('howItWorks.corroborate.description')}
                </p>
              </div>

              {/* Story Chains */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-surface-nested border border-DEFAULT flex items-center justify-center">
                  <span className="text-2xl text-primary">⟁</span>
                </div>
                <h3 className="text-xl font-semibold mb-4">{t('howItWorks.connect.title')}</h3>
                <p className="text-secondary leading-relaxed">
                  {t('howItWorks.connect.description')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Not Social Media Section */}
        <section className="py-24 border-t border-DEFAULT">
          <div className="container-narrow">
            <h2 className="text-3xl font-semibold mb-8 text-center">
              {t('whatIsNot.title')}
            </h2>

            <ul className="space-y-4 text-secondary">
              <li className="flex items-start gap-3">
                <span className="text-challenged mt-1">✕</span>
                <span>{t('whatIsNot.noFollowers')}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-challenged mt-1">✕</span>
                <span>{t('whatIsNot.noScroll')}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-challenged mt-1">✕</span>
                <span>{t('whatIsNot.noLikes')}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-challenged mt-1">✕</span>
                <span>{t('whatIsNot.noTracking')}</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Built on Polkadot Section */}
        <section className="py-24 border-t border-DEFAULT bg-surface-container">
          <div className="container-narrow text-center">
            <h2 className="text-3xl font-semibold mb-8">
              {t('polkadot.title')}
            </h2>

            <p className="text-secondary leading-relaxed mb-8">
              {t('polkadot.description')}
            </p>

            <a
              href="https://polkadot.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-secondary hover:text-primary transition-colors"
            >
              <span>{t('polkadot.learnMore')}</span>
              <span
                className="inline-block w-3 h-3 rounded-full bg-polkadot-pink"
                aria-hidden="true"
              />
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
