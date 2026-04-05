/**
 * About page — The story of the Firefly Network.
 *
 * This page covers:
 * - The firefly metaphor and its origin (Efecto Cocuyo / Caribbean cocuyos)
 * - What the network is (and what it is NOT)
 * - The three pillars
 * - How story chains and corroboration work
 * - The surveillance resistance architecture
 * - Built on Polkadot
 * - Open source commitment
 */

import type { ReactElement } from 'react';
import { FireflySymbol } from '@cocuyo/ui';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ExternalLink, ExternalLinkSection } from '@/components/ExternalLink';

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AboutPage({ params }: AboutPageProps): Promise<ReactElement> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('about');
  return (
    <>
      <main>
        {/* Hero */}
        <section className="py-24 border-b border-[var(--color-border-default)]">
          <div className="container-narrow text-center">
            <FireflySymbol size={40} color="gold" aria-hidden="true" />
            <h1 className="text-4xl md:text-5xl font-bold mt-6 mb-6">
              {t('hero.title')}
            </h1>
            <p className="text-xl text-[var(--color-text-secondary)]">
              {t('hero.subtitle')}
            </p>
          </div>
        </section>

        {/* The Firefly Principle */}
        <section className="py-20">
          <div className="container-narrow">
            <h2 className="text-2xl font-semibold mb-6">{t('fireflyPrinciple.title')}</h2>

            <div className="space-y-6 text-[var(--color-text-secondary)] leading-relaxed">
              <p>{t('fireflyPrinciple.p1')}</p>
              <p>{t('fireflyPrinciple.p2')}</p>
              <p>
                {t('fireflyPrinciple.p3')}{' '}
                <ExternalLink
                  href="https://rebbit.notion.site/The-Efecto-Cocuyo-Experience-Independent-Media-Alliance-2fdee372c52c80c29adad1bcaa70da99"
                  className="text-[var(--color-text-primary)] underline hover:text-[var(--color-accent)] transition-colors"
                >
                  →
                </ExternalLink>
              </p>
            </div>
          </div>
        </section>

        {/* The Three Pillars */}
        <section className="py-20 bg-[var(--color-bg-secondary)] border-y border-[var(--color-border-default)]">
          <div className="container-wide">
            <h2 className="text-2xl font-semibold mb-12 text-center">
              {t('threePillars.title')}
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-8 bg-[var(--color-bg-tertiary)] rounded-lg border border-[var(--color-border-default)]">
                <h3 className="text-xl font-semibold mb-4 text-[var(--color-text-primary)]">
                  {t('threePillars.anonymousButHuman.title')}
                </h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  {t('threePillars.anonymousButHuman.description')}
                </p>
              </div>

              <div className="p-8 bg-[var(--color-bg-tertiary)] rounded-lg border border-[var(--color-border-default)]">
                <h3 className="text-xl font-semibold mb-4 text-[var(--color-text-primary)]">
                  {t('threePillars.verifiedButPrivate.title')}
                </h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  {t('threePillars.verifiedButPrivate.description')}
                </p>
              </div>

              <div className="p-8 bg-[var(--color-bg-tertiary)] rounded-lg border border-[var(--color-border-default)]">
                <h3 className="text-xl font-semibold mb-4 text-[var(--color-text-primary)]">
                  {t('threePillars.distributedButConnected.title')}
                </h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  {t('threePillars.distributedButConnected.description')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="container-narrow">
            <h2 className="text-2xl font-semibold mb-8">{t('howItWorks.title')}</h2>

            <div className="space-y-12">
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
                  <span style={{ color: 'var(--color-accent)' }}>✦</span>
                  {t('howItWorks.signals.title')}
                </h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  {t('howItWorks.signals.description')}
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
                  <span style={{ color: 'var(--color-corroborated)' }}>◉</span>
                  {t('howItWorks.corroboration.title')}
                </h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  {t('howItWorks.corroboration.description')}
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
                  <span className="text-[var(--color-text-primary)]">⟁</span>
                  {t('howItWorks.storyChains.title')}
                </h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  {t('howItWorks.storyChains.description')}
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
                  <span className="text-[var(--color-text-primary)]">◈</span>
                  {t('howItWorks.verificationTrails.title')}
                </h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  {t('howItWorks.verificationTrails.description')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Surveillance Resistance */}
        <section className="py-20 bg-[var(--color-bg-secondary)] border-y border-[var(--color-border-default)]">
          <div className="container-narrow">
            <h2 className="text-2xl font-semibold mb-8">{t('surveillanceResistance.title')}</h2>

            <div className="space-y-6 text-[var(--color-text-secondary)] leading-relaxed">
              <p>{t('surveillanceResistance.intro')}</p>

              <ul className="space-y-4 pl-6">
                <li className="flex items-start gap-3">
                  <span className="text-[var(--color-accent)] mt-1">•</span>
                  <span>{t('surveillanceResistance.noUserDatabase')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[var(--color-accent)] mt-1">•</span>
                  <span>{t('surveillanceResistance.noContentServer')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[var(--color-accent)] mt-1">•</span>
                  <span>{t('surveillanceResistance.noMetadata')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[var(--color-accent)] mt-1">•</span>
                  <span>{t('surveillanceResistance.noCookies')}</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Built on Polkadot */}
        <section className="py-20">
          <div className="container-narrow">
            <h2 className="text-2xl font-semibold mb-8">{t('builtOnPolkadot.title')}</h2>

            <div className="space-y-6 text-[var(--color-text-secondary)] leading-relaxed">
              <p>{t('builtOnPolkadot.intro')}</p>

              <p>{t('builtOnPolkadot.infrastructure')}</p>

              <ul className="space-y-2 pl-6">
                <li className="flex items-start gap-3">
                  <span style={{ color: 'var(--color-polkadot-pink)' }}>•</span>
                  <span>{t('builtOnPolkadot.dim')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span style={{ color: 'var(--color-polkadot-pink)' }}>•</span>
                  <span>{t('builtOnPolkadot.bulletinChain')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span style={{ color: 'var(--color-polkadot-pink)' }}>•</span>
                  <span>{t('builtOnPolkadot.parachains')}</span>
                </li>
              </ul>

              <ExternalLinkSection>
                <div className="pt-6 flex flex-wrap gap-4">
                  <ExternalLink
                    href="https://polkadot.com"
                    className="inline-flex items-center gap-2 px-4 py-2 border border-[var(--color-border-default)] rounded hover:border-[var(--color-border-emphasis)] transition-colors"
                  >
                    <span>Polkadot</span>
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: 'var(--color-polkadot-pink)' }}
                      aria-hidden="true"
                    />
                  </ExternalLink>
                  <ExternalLink
                    href="https://web3.foundation"
                    className="inline-flex items-center gap-2 px-4 py-2 border border-[var(--color-border-default)] rounded hover:border-[var(--color-border-emphasis)] transition-colors"
                  >
                    Web3 Foundation
                  </ExternalLink>
                </div>
              </ExternalLinkSection>
            </div>
          </div>
        </section>

        {/* Open Source - hidden in host mode */}
        <ExternalLinkSection>
          <section className="py-20 bg-[var(--color-bg-secondary)] border-t border-[var(--color-border-default)]">
            <div className="container-narrow text-center">
              <h2 className="text-2xl font-semibold mb-6">{t('openSource.title')}</h2>

              <p className="text-[var(--color-text-secondary)] leading-relaxed mb-8">
                {t('openSource.description')}
              </p>

              <ExternalLink
                href="https://github.com/paritytech/cocuyo"
                className="inline-flex items-center gap-2 text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors"
              >
                <span>{t('openSource.viewOnGitHub')}</span>
                <span aria-hidden="true">→</span>
              </ExternalLink>
            </div>
          </section>
        </ExternalLinkSection>
      </main>
    </>
  );
}
