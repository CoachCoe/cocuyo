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
import { setRequestLocale } from 'next-intl/server';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps): Promise<ReactElement> {
  const { locale } = await params;
  setRequestLocale(locale);
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
              Lights in the Dark
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-secondary mb-8 max-w-2xl mx-auto leading-relaxed">
              A surveillance-resistant network for collective intelligence.
              Where verified humans share, corroborate, and build understanding —
              without exposing their identities.
            </p>

            {/* Pillars */}
            <div className="flex flex-wrap justify-center gap-4 text-sm text-secondary mb-12">
              <span className="px-4 py-2 border border-DEFAULT rounded-full">
                Anonymous but Human
              </span>
              <span className="px-4 py-2 border border-DEFAULT rounded-full">
                Verified but Private
              </span>
              <span className="px-4 py-2 border border-DEFAULT rounded-full">
                Distributed but Connected
              </span>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/explore">
                <Button variant="primary" size="lg">
                  Explore the Network
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
              What is the Firefly Network?
            </h2>

            <div className="space-y-6 text-secondary leading-relaxed">
              <p>
                In the Caribbean, indigenous peoples used <em>cocuyos</em> — bioluminescent
                beetles — as natural lamps to guide them through the dark. No single cocuyo
                illuminates a path. But millions of tiny sparks, together, can light an
                entire nation.
              </p>

              <p>
                The Firefly Network is <strong className="text-primary">not</strong> a social media
                platform. It is a collective intelligence network where every participant is both
                sensor and analyst, where information spreads through corroboration rather than
                amplification, and where the value of a signal is determined by the cryptographic
                weight of human verification — not algorithms or engagement metrics.
              </p>

              <p>
                Here, you are not a user. You are a <strong className="text-primary">firefly</strong> —
                a verified human being contributing light to the collective understanding.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 border-t border-DEFAULT bg-surface-container">
          <div className="container-wide">
            <h2 className="text-3xl font-semibold mb-16 text-center">
              How It Works
            </h2>

            <div className="grid md:grid-cols-3 gap-12">
              {/* Signals */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-surface-nested border border-DEFAULT flex items-center justify-center">
                  <span className="text-2xl text-firefly-gold">
                    ✦
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-4">Illuminate</h3>
                <p className="text-secondary leading-relaxed">
                  Share what you observe. A signal is not a post — it&apos;s an observation,
                  a piece of evidence, a data point. Each signal is signed by your anonymous
                  credential, proving a verified human created it.
                </p>
              </div>

              {/* Corroboration */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-surface-nested border border-DEFAULT flex items-center justify-center">
                  <span className="text-2xl text-corroborated">
                    ◉
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-4">Corroborate</h3>
                <p className="text-secondary leading-relaxed">
                  Verify what others share. Corroboration is not a like — it&apos;s a
                  reputation-staked act. When you corroborate, you&apos;re putting your
                  accumulated reputation behind your assessment.
                </p>
              </div>

              {/* Story Chains */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-surface-nested border border-DEFAULT flex items-center justify-center">
                  <span className="text-2xl text-primary">⟁</span>
                </div>
                <h3 className="text-xl font-semibold mb-4">Connect</h3>
                <p className="text-secondary leading-relaxed">
                  Signals link into story chains — emergent structures that form
                  as fireflies connect their observations. The chain becomes stronger
                  than any individual signal through distributed verification.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Not Social Media Section */}
        <section className="py-24 border-t border-DEFAULT">
          <div className="container-narrow">
            <h2 className="text-3xl font-semibold mb-8 text-center">
              What This Is Not
            </h2>

            <ul className="space-y-4 text-secondary">
              <li className="flex items-start gap-3">
                <span className="text-challenged mt-1">✕</span>
                <span>No follower counts. No profiles. No celebrities. Fireflies are anonymous.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-challenged mt-1">✕</span>
                <span>No infinite scroll. No algorithmic feed. No engagement optimization.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-challenged mt-1">✕</span>
                <span>No likes, reactions, or shares. Information spreads through corroboration, not amplification.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-challenged mt-1">✕</span>
                <span>No data collection. No tracking. No surveillance. We don&apos;t collect what we can&apos;t be forced to reveal.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Built on Polkadot Section */}
        <section className="py-24 border-t border-DEFAULT bg-surface-container">
          <div className="container-narrow text-center">
            <h2 className="text-3xl font-semibold mb-8">
              Built on Polkadot
            </h2>

            <p className="text-secondary leading-relaxed mb-8">
              The Firefly Network is built on and for the Polkadot ecosystem —
              leveraging decentralized identity, censorship-resistant storage,
              and cross-chain interoperability. No single point of failure.
              No single point of control.
            </p>

            <a
              href="https://polkadot.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-secondary hover:text-primary transition-colors"
            >
              <span>Learn more about Polkadot</span>
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
