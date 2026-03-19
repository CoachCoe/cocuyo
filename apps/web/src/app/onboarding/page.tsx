'use client';

/**
 * Onboarding Page
 *
 * Multi-step flow for new users:
 * 1. Connect wallet (handled by Triangle)
 * 2. Verify personhood (DIM)
 * 3. Create profile (pseudonym, disclosure level)
 * 4. Choose topics of interest
 */

import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useIdentity } from '@/hooks/useIdentity';
import { useTriangleAccount } from '@/hooks/useTriangleAccount';
import type { DisclosureLevel, NewFireflyProfile } from '@cocuyo/types';

type Step = 'connect' | 'verify' | 'profile' | 'topics' | 'complete';

const AVAILABLE_TOPICS = [
  'Politics',
  'Human Rights',
  'Economy',
  'Environment',
  'Health',
  'Education',
  'Migration',
  'Corruption',
  'Security',
  'Technology',
  'Culture',
  'Local Government',
];

export default function OnboardingPage(): ReactNode {
  const router = useRouter();
  const { isConnected, isInHost } = useTriangleAccount();
  const {
    status,
    suggestedPseudonym,
    verifyPersonhood,
    createProfile,
  } = useIdentity();

  // Form state
  const [pseudonym, setPseudonym] = useState('');
  const [disclosure, setDisclosure] = useState<DisclosureLevel>('anonymous');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  // UI state
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set suggested pseudonym when available
  useEffect(() => {
    if (suggestedPseudonym !== null && pseudonym === '') {
      setPseudonym(suggestedPseudonym);
    }
  }, [suggestedPseudonym, pseudonym]);

  // Redirect if already set up
  useEffect(() => {
    if (status === 'ready') {
      router.push('/explore');
    }
  }, [status, router]);

  // Determine current step based on status
  const getCurrentStep = (): Step => {
    if (!isInHost || !isConnected) return 'connect';
    if (status === 'no-credential') return 'verify';
    if (status === 'no-profile') return 'profile';
    if (status === 'ready') return 'complete';
    return 'connect';
  };

  const currentStep = getCurrentStep();

  const handleVerify = (): void => {
    setIsVerifying(true);
    setError(null);
    verifyPersonhood()
      .catch((err: unknown) => {
        setError('Verification failed. Please try again.');
        console.error('DIM verification error:', err);
      })
      .finally(() => {
        setIsVerifying(false);
      });
  };

  const handleCreateProfile = (): void => {
    if (pseudonym.trim() === '') {
      setError('Please enter a pseudonym');
      return;
    }

    setIsCreating(true);
    setError(null);
    const profileData: NewFireflyProfile = {
      pseudonym: pseudonym.trim(),
      disclosureLevel: disclosure,
      followedTopics: selectedTopics,
    };
    createProfile(profileData)
      .then(() => {
        router.push('/explore');
      })
      .catch((err: unknown) => {
        setError('Failed to create profile. Please try again.');
        console.error('Profile creation error:', err);
      })
      .finally(() => {
        setIsCreating(false);
      });
  };

  const toggleTopic = (topic: string): void => {
    setSelectedTopics((prev) =>
      prev.includes(topic)
        ? prev.filter((t) => t !== topic)
        : [...prev, topic]
    );
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-8 bg-[var(--bg-default)]">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-bold text-[var(--color-firefly-gold)]">
              F-Network
            </h1>
          </Link>
          <p className="text-sm text-[var(--fg-secondary)] mt-2">
            Verified voices. Collective truth.
          </p>
        </div>

        {/* Progress */}
        <div className="flex justify-center gap-2 mb-8">
          {(['connect', 'verify', 'profile'] as const).map((step, i) => {
            const steps = ['connect', 'verify', 'profile'];
            const currentIndex = steps.indexOf(currentStep);
            const isComplete = i < currentIndex;
            const isCurrent = step === currentStep;

            return (
              <div
                key={step}
                className={`w-3 h-3 rounded-full transition-colors ${
                  isComplete
                    ? 'bg-[var(--fg-success)]'
                    : isCurrent
                      ? 'bg-[var(--color-firefly-gold)]'
                      : 'bg-[var(--bg-surface-nested)]'
                }`}
              />
            );
          })}
        </div>

        {/* Error display */}
        {error !== null && (
          <div className="mb-6 p-4 bg-[var(--fg-error)]/10 border border-[var(--fg-error)]/30 rounded-[var(--radius-nested)] text-[var(--fg-error)] text-sm">
            {error}
          </div>
        )}

        {/* Step: Connect */}
        {currentStep === 'connect' && (
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4 text-[var(--fg-primary)]">
              Welcome to F-Network
            </h2>

            {!isInHost ? (
              <>
                <p className="text-[var(--fg-secondary)] mb-6">
                  F-Network runs inside Triangle for security and
                  decentralization. Open this app in Triangle to continue.
                </p>
                <a
                  href="https://novawallet.io/triangle"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-3 bg-[var(--color-firefly-gold)] text-[var(--bg-surface-main)] font-semibold rounded-[var(--radius-nested)] hover:brightness-110 transition-all"
                >
                  Get Triangle
                </a>
              </>
            ) : (
              <p className="text-[var(--fg-secondary)]">
                Sign in to Triangle to continue...
              </p>
            )}
          </div>
        )}

        {/* Step: Verify */}
        {currentStep === 'verify' && (
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4 text-[var(--fg-primary)]">
              Verify You're Human
            </h2>
            <p className="text-[var(--fg-secondary)] mb-6">
              F-Network requires proof-of-personhood. Your identity stays
              private — we only verify you're a unique human, not who you are.
            </p>

            <div className="p-4 bg-[var(--bg-surface-container)] border border-[var(--border-default)] rounded-[var(--radius-nested)] mb-6 text-left">
              <h3 className="font-medium text-[var(--fg-primary)] mb-2">
                What DIM verification provides:
              </h3>
              <ul className="text-sm text-[var(--fg-secondary)] space-y-2">
                <li className="flex gap-2">
                  <span className="text-[var(--fg-success)]">✓</span>
                  Proof you're a unique human
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--fg-success)]">✓</span>
                  Protection against bots and sybil attacks
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--fg-success)]">✓</span>
                  Full anonymity — no personal data collected
                </li>
              </ul>
            </div>

            <button
              onClick={handleVerify}
              disabled={isVerifying}
              className="w-full px-6 py-3 bg-[var(--color-firefly-gold)] text-[var(--bg-surface-main)] font-semibold rounded-[var(--radius-nested)] hover:brightness-110 transition-all disabled:opacity-50"
            >
              {isVerifying ? 'Verifying...' : 'Verify with DIM'}
            </button>
          </div>
        )}

        {/* Step: Profile */}
        {currentStep === 'profile' && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-[var(--fg-primary)] text-center">
              Create Your Identity
            </h2>

            {/* Pseudonym */}
            <div className="mb-6">
              <label className="block text-sm text-[var(--fg-secondary)] mb-2">
                Pseudonym
              </label>
              <input
                type="text"
                value={pseudonym}
                onChange={(e) => setPseudonym(e.target.value)}
                placeholder="Choose a name..."
                className="w-full px-4 py-3 bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-[var(--radius-nested)] text-[var(--fg-primary)] placeholder:text-[var(--fg-tertiary)] focus:outline-none focus:border-[var(--color-firefly-gold)]"
              />
              <p className="text-xs text-[var(--fg-tertiary)] mt-2">
                This is how others will see you. You can change it later.
              </p>
            </div>

            {/* Disclosure Level */}
            <div className="mb-6">
              <label className="block text-sm text-[var(--fg-secondary)] mb-2">
                Identity Disclosure
              </label>
              <div className="space-y-2">
                {(
                  [
                    {
                      value: 'anonymous',
                      label: 'Anonymous',
                      desc: 'Only your pseudonym is visible',
                    },
                    {
                      value: 'partial',
                      label: 'Partial',
                      desc: 'Show location and profession',
                    },
                    {
                      value: 'public',
                      label: 'Public',
                      desc: 'Full identity visible',
                    },
                  ] as const
                ).map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-start gap-3 p-3 border rounded-[var(--radius-nested)] cursor-pointer transition-colors ${
                      disclosure === option.value
                        ? 'border-[var(--color-firefly-gold)] bg-[var(--color-firefly-gold)]/10'
                        : 'border-[var(--border-default)] hover:border-[var(--border-emphasis)]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="disclosure"
                      value={option.value}
                      checked={disclosure === option.value}
                      onChange={(e) =>
                        setDisclosure(e.target.value as DisclosureLevel)
                      }
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium text-[var(--fg-primary)]">
                        {option.label}
                      </div>
                      <div className="text-sm text-[var(--fg-tertiary)]">
                        {option.desc}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Topics */}
            <div className="mb-8">
              <label className="block text-sm text-[var(--fg-secondary)] mb-2">
                Topics of Interest
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_TOPICS.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => toggleTopic(topic)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                      selectedTopics.includes(topic)
                        ? 'border-[var(--color-firefly-gold)] bg-[var(--color-firefly-gold)]/10 text-[var(--color-firefly-gold)]'
                        : 'border-[var(--border-default)] text-[var(--fg-secondary)] hover:border-[var(--border-emphasis)]'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleCreateProfile}
              disabled={isCreating || pseudonym.trim() === ''}
              className="w-full px-6 py-3 bg-[var(--color-firefly-gold)] text-[var(--bg-surface-main)] font-semibold rounded-[var(--radius-nested)] hover:brightness-110 transition-all disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : 'Enter F-Network'}
            </button>
          </div>
        )}

        {/* Loading state */}
        {status === 'loading' && (
          <div className="text-center text-[var(--fg-secondary)]">
            Loading...
          </div>
        )}
      </div>
    </main>
  );
}
