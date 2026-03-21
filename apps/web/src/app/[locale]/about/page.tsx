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
import { setRequestLocale } from 'next-intl/server';

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AboutPage({ params }: AboutPageProps): Promise<ReactElement> {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <main>
        {/* Hero */}
        <section className="py-24 border-b border-[var(--color-border-default)]">
          <div className="container-narrow text-center">
            <FireflySymbol size={40} color="gold" aria-hidden="true" />
            <h1 className="text-4xl md:text-5xl font-bold mt-6 mb-6">
              About the Network
            </h1>
            <p className="text-xl text-[var(--color-text-secondary)]">
              Millions of tiny sparks can illuminate an entire nation.
            </p>
          </div>
        </section>

        {/* The Firefly Principle */}
        <section className="py-20">
          <div className="container-narrow">
            <h2 className="text-2xl font-semibold mb-6">The Firefly Principle</h2>

            <div className="space-y-6 text-[var(--color-text-secondary)] leading-relaxed">
              <p>
                In the Caribbean, indigenous peoples used <em className="text-[var(--color-text-primary)]">cocuyos</em> —
                bioluminescent beetles — as natural lamps to guide them through the dark.
                A single cocuyo casts barely enough light to see your own hand.
                But gather them together, and they become something more.
              </p>

              <p>
                This is the principle behind the Firefly Network: no single observer
                sees the whole picture. But when verified humans share what they observe,
                corroborate what others see, and connect their signals into chains of
                evidence — the darkness begins to lift.
              </p>

              <p>
                We are inspired by <strong className="text-[var(--color-text-primary)]">Efecto Cocuyo</strong>,
                a Venezuelan independent media platform founded in 2015 by journalists
                who refused to let government censorship silence the truth. They proved
                that community-driven journalism could survive and thrive even under
                authoritarian conditions. The firefly image resonated because it speaks
                to something universal: small lights that together illuminate the darkness.
              </p>
            </div>
          </div>
        </section>

        {/* The Three Pillars */}
        <section className="py-20 bg-[var(--color-bg-secondary)] border-y border-[var(--color-border-default)]">
          <div className="container-wide">
            <h2 className="text-2xl font-semibold mb-12 text-center">
              The Three Pillars
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-8 bg-[var(--color-bg-tertiary)] rounded-lg border border-[var(--color-border-default)]">
                <h3 className="text-xl font-semibold mb-4 text-[var(--color-text-primary)]">
                  Anonymous but Human
                </h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  Every firefly is a verified human being — proved through DIM
                  (Decentralized Identity Mechanism), a proof-of-personhood system
                  that confirms you&apos;re human without revealing who you are.
                  No usernames, no profiles, no personal data. Just a cryptographic
                  credential that says: &quot;A real human made this.&quot;
                </p>
              </div>

              <div className="p-8 bg-[var(--color-bg-tertiary)] rounded-lg border border-[var(--color-border-default)]">
                <h3 className="text-xl font-semibold mb-4 text-[var(--color-text-primary)]">
                  Verified but Private
                </h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  Every signal and corroboration carries cryptographic proof.
                  Every chain has a transparent verification trail. But none of
                  this requires exposing anyone&apos;s identity. The verification
                  is public; the verifier is private. This is fact-checking
                  without surveillance.
                </p>
              </div>

              <div className="p-8 bg-[var(--color-bg-tertiary)] rounded-lg border border-[var(--color-border-default)]">
                <h3 className="text-xl font-semibold mb-4 text-[var(--color-text-primary)]">
                  Distributed but Connected
                </h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  Signals and chains are stored on decentralized infrastructure.
                  No central server to seize, no company to subpoena, no single
                  point of failure. If the founding team disappeared tomorrow,
                  the network would continue. That&apos;s the point.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="container-narrow">
            <h2 className="text-2xl font-semibold mb-8">How It Works</h2>

            <div className="space-y-12">
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
                  <span style={{ color: 'var(--color-accent)' }}>✦</span>
                  Signals
                </h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  A signal is not a post. It&apos;s an observation, a piece of evidence,
                  a witness account, a data point. When you illuminate a signal, you&apos;re
                  contributing a discrete piece of information — signed by your anonymous
                  credential, tagged with optional context (topic, location, timeframe),
                  and ready to connect with other signals.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
                  <span style={{ color: 'var(--color-corroborated)' }}>◉</span>
                  Corroboration
                </h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  Corroboration is not a like. It&apos;s a reputation-staked act of verification.
                  When you corroborate a signal, you&apos;re making a specific claim: &quot;I can
                  independently confirm this,&quot; or &quot;I have additional evidence,&quot; or
                  &quot;This is consistent with my expertise.&quot; Your corroboration is recorded
                  permanently, weighted by your reputation in the relevant domain.
                  If the signal is later debunked, your reputation diminishes.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
                  <span className="text-[var(--color-text-primary)]">⟁</span>
                  Story Chains
                </h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  Story chains are emergent structures. No one &quot;creates&quot; a chain — chains
                  crystallize as fireflies link their signals to related observations.
                  A chain about water quality might start with one person noticing a smell,
                  grow as others corroborate and add photos, and strengthen as someone
                  contributes public records about permits. The chain becomes more than
                  the sum of its signals.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
                  <span className="text-[var(--color-text-primary)]">◈</span>
                  Verification Trails
                </h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  Every chain carries a transparent verification trail — the complete
                  history of signals, corroborations, challenges, and evidence. You don&apos;t
                  need to trust us to tell you something is verified. You can trace the
                  trail yourself and see exactly how many independent humans, with what
                  reputation, made what claims.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Surveillance Resistance */}
        <section className="py-20 bg-[var(--color-bg-secondary)] border-y border-[var(--color-border-default)]">
          <div className="container-narrow">
            <h2 className="text-2xl font-semibold mb-8">Surveillance Resistance</h2>

            <div className="space-y-6 text-[var(--color-text-secondary)] leading-relaxed">
              <p>
                The network is designed so that no single point of compromise — no server
                seizure, no subpoena, no insider threat — can expose the identity of any
                firefly or remove any signal from the network.
              </p>

              <ul className="space-y-4 pl-6">
                <li className="flex items-start gap-3">
                  <span className="text-[var(--color-accent)] mt-1">•</span>
                  <span><strong className="text-[var(--color-text-primary)]">No user database.</strong> DIM credentials are generated through proof-of-personhood and held by you. There is no central registry of participants.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[var(--color-accent)] mt-1">•</span>
                  <span><strong className="text-[var(--color-text-primary)]">No content server.</strong> Signals are stored on decentralized infrastructure. There is no single server to seize.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[var(--color-accent)] mt-1">•</span>
                  <span><strong className="text-[var(--color-text-primary)]">No metadata collection.</strong> We don&apos;t log IP addresses, device fingerprints, or access patterns.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[var(--color-accent)] mt-1">•</span>
                  <span><strong className="text-[var(--color-text-primary)]">No cookies.</strong> None. Zero. We don&apos;t collect what we can&apos;t be forced to reveal.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Built on Polkadot */}
        <section className="py-20">
          <div className="container-narrow">
            <h2 className="text-2xl font-semibold mb-8">Built on Polkadot</h2>

            <div className="space-y-6 text-[var(--color-text-secondary)] leading-relaxed">
              <p>
                The Firefly Network is built on and for the Polkadot ecosystem.
                We chose Polkadot because its values align with ours: decentralization,
                interoperability, and user sovereignty.
              </p>

              <p>
                Our infrastructure leverages:
              </p>

              <ul className="space-y-2 pl-6">
                <li className="flex items-start gap-3">
                  <span style={{ color: 'var(--color-polkadot-pink)' }}>•</span>
                  <span><strong className="text-[var(--color-text-primary)]">DIM</strong> — Decentralized identity for proof-of-personhood</span>
                </li>
                <li className="flex items-start gap-3">
                  <span style={{ color: 'var(--color-polkadot-pink)' }}>•</span>
                  <span><strong className="text-[var(--color-text-primary)]">Bulletin Chain</strong> — Censorship-resistant storage</span>
                </li>
                <li className="flex items-start gap-3">
                  <span style={{ color: 'var(--color-polkadot-pink)' }}>•</span>
                  <span><strong className="text-[var(--color-text-primary)]">Polkadot parachains</strong> — Verification and reputation logic</span>
                </li>
              </ul>

              <div className="pt-6 flex flex-wrap gap-4">
                <a
                  href="https://polkadot.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-[var(--color-border-default)] rounded hover:border-[var(--color-border-emphasis)] transition-colors"
                >
                  <span>Polkadot</span>
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: 'var(--color-polkadot-pink)' }}
                    aria-hidden="true"
                  />
                </a>
                <a
                  href="https://web3.foundation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-[var(--color-border-default)] rounded hover:border-[var(--color-border-emphasis)] transition-colors"
                >
                  Web3 Foundation
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Open Source */}
        <section className="py-20 bg-[var(--color-bg-secondary)] border-t border-[var(--color-border-default)]">
          <div className="container-narrow text-center">
            <h2 className="text-2xl font-semibold mb-6">Open Source</h2>

            <p className="text-[var(--color-text-secondary)] leading-relaxed mb-8">
              All code is open source. All governance is public.
              All verification trails are auditable. Transparency is not
              optional — it&apos;s foundational.
            </p>

            <a
              href="https://github.com/fireflynetwork"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors"
            >
              <span>View on GitHub</span>
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
