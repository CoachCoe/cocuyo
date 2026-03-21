/**
 * Settings Page — User preferences and identity controls.
 */

'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { useIdentity } from '@/hooks/useIdentity';
import type { DisclosureLevel } from '@cocuyo/types';

const DISCLOSURE_LEVELS: Array<{ value: DisclosureLevel; label: string; description: string }> = [
  { value: 'anonymous', label: 'Anonymous', description: 'Only your pseudonym is visible. Maximum privacy.' },
  { value: 'partial', label: 'Partial', description: 'Show location and profession.' },
  { value: 'public', label: 'Public', description: 'Full identity visible to other verified users.' },
];

export default function SettingsPage(): ReactNode {
  const { status, profile, updateProfile, clearProfile, credential } = useIdentity();
  const [activeSection, setActiveSection] = useState<'identity' | 'preferences' | 'data'>('identity');
  const [isSaving, setIsSaving] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-[var(--bg-default)]">
        <div className="container max-w-2xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-[var(--bg-surface-nested)] rounded w-1/4" />
            <div className="h-64 bg-[var(--bg-surface-nested)] rounded" />
          </div>
        </div>
      </main>
    );
  }

  if (status !== 'ready' || profile === null) {
    return (
      <main className="min-h-screen bg-[var(--bg-default)]">
        <div className="container max-w-2xl mx-auto px-4 py-8">
          <div className="p-8 bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-container text-center">
            <h1 className="text-xl font-bold text-[var(--fg-primary)] mb-2">No Profile</h1>
            <p className="text-[var(--fg-secondary)] mb-4">Complete onboarding to access settings.</p>
            <Link href="/onboarding"
              className="inline-block px-4 py-2 bg-[var(--color-firefly-gold)] text-[var(--bg-surface-main)] font-semibold rounded-nested hover:brightness-110">
              Start Onboarding
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const handleDisclosureChange = (level: DisclosureLevel): void => {
    setIsSaving(true);
    updateProfile({ disclosureLevel: level }).then(() => {
      setIsSaving(false);
    }).catch(() => {
      setIsSaving(false);
    });
  };

  const handleClearData = (): void => {
    setIsSaving(true);
    clearProfile().then(() => {
      setIsSaving(false);
      setShowClearConfirm(false);
    }).catch(() => {
      setIsSaving(false);
    });
  };

  return (
    <main className="min-h-screen bg-[var(--bg-default)]">
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-[var(--fg-primary)]">Settings</h1>
          <Link href="/profile" className="text-sm text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]">
            Back to Profile
          </Link>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-1 mb-6 p-1 bg-[var(--bg-surface-nested)] rounded-container">
          {(['identity', 'preferences', 'data'] as const).map((section) => (
            <button key={section} type="button" onClick={() => setActiveSection(section)}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-nested capitalize transition-colors ${
                activeSection === section
                  ? 'bg-[var(--bg-surface-container)] text-[var(--fg-primary)]'
                  : 'text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]'
              }`}>
              {section}
            </button>
          ))}
        </div>

        {/* Identity Section */}
        {activeSection === 'identity' && (
          <div className="space-y-6">
            {/* Credential Info */}
            <div className="p-6 bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-container">
              <h2 className="font-semibold text-[var(--fg-primary)] mb-4">DIM Credential</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[var(--fg-secondary)]">Status</span>
                  <span className="text-sm text-[var(--fg-success)] font-medium">Verified</span>
                </div>
                {credential !== null && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[var(--fg-secondary)]">Credential Hash</span>
                    <span className="text-sm text-[var(--fg-tertiary)] font-mono">{credential.hash.slice(0, 16)}...</span>
                  </div>
                )}
                <p className="text-xs text-[var(--fg-tertiary)] pt-2 border-t border-[var(--border-default)]">
                  Your DIM credential proves you're a unique human without revealing your identity.
                </p>
              </div>
            </div>

            {/* Disclosure Level */}
            <div className="p-6 bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-container">
              <h2 className="font-semibold text-[var(--fg-primary)] mb-4">Disclosure Level</h2>
              <p className="text-sm text-[var(--fg-secondary)] mb-4">
                Control how much identity information is visible to others.
              </p>
              <div className="space-y-3">
                {DISCLOSURE_LEVELS.map((level) => (
                  <button key={level.value} type="button"
                    onClick={() => handleDisclosureChange(level.value)}
                    disabled={isSaving}
                    className={`w-full p-4 border rounded-nested text-left transition-colors ${
                      profile.disclosureLevel === level.value
                        ? 'border-[var(--color-firefly-gold)] bg-[var(--color-firefly-gold)]/10'
                        : 'border-[var(--border-default)] hover:border-[var(--border-emphasis)]'
                    }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-[var(--fg-primary)]">{level.label}</span>
                      {profile.disclosureLevel === level.value && (
                        <span className="text-xs text-[var(--color-firefly-gold)]">Current</span>
                      )}
                    </div>
                    <p className="text-sm text-[var(--fg-tertiary)]">{level.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Preferences Section */}
        {activeSection === 'preferences' && (
          <div className="space-y-6">
            <div className="p-6 bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-container">
              <h2 className="font-semibold text-[var(--fg-primary)] mb-4">Appearance</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[var(--fg-primary)]">Theme</p>
                  <p className="text-sm text-[var(--fg-tertiary)]">Dark mode is optimized for the network</p>
                </div>
                <span className="text-sm text-[var(--fg-secondary)]">Dark</span>
              </div>
            </div>

            <div className="p-6 bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-container">
              <h2 className="font-semibold text-[var(--fg-primary)] mb-4">Notifications</h2>
              <p className="text-sm text-[var(--fg-tertiary)]">
                Notification preferences will be available when the network goes live.
              </p>
            </div>

            <div className="p-6 bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-container">
              <h2 className="font-semibold text-[var(--fg-primary)] mb-4">Feed Preferences</h2>
              <Link href="/profile" className="text-sm text-[var(--color-firefly-gold)] hover:underline">
                Edit followed topics in your profile
              </Link>
            </div>
          </div>
        )}

        {/* Data Section */}
        {activeSection === 'data' && (
          <div className="space-y-6">
            <div className="p-6 bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-container">
              <h2 className="font-semibold text-[var(--fg-primary)] mb-4">Your Data</h2>
              <div className="space-y-4 text-sm text-[var(--fg-secondary)]">
                <p>
                  Your signals and corroborations are stored on the Bulletin Chain — a decentralized,
                  censorship-resistant storage layer. You own your data.
                </p>
                <p>
                  Your profile is stored locally and can be cleared at any time. This will not
                  affect your on-chain contributions.
                </p>
              </div>
            </div>

            <div className="p-6 bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-container">
              <h2 className="font-semibold text-[var(--fg-primary)] mb-4">Export Data</h2>
              <p className="text-sm text-[var(--fg-tertiary)] mb-4">
                Export your profile and contributions as JSON.
              </p>
              <button type="button" disabled
                className="px-4 py-2 border border-[var(--border-default)] text-[var(--fg-secondary)] rounded-nested opacity-50 cursor-not-allowed">
                Coming Soon
              </button>
            </div>

            <div className="p-6 bg-[var(--bg-surface-nested)] border border-[var(--fg-error)]/30 rounded-container">
              <h2 className="font-semibold text-[var(--fg-error)] mb-4">Clear Local Profile</h2>
              <p className="text-sm text-[var(--fg-secondary)] mb-4">
                This will clear your local profile data. You can recreate it using your DIM credential.
                Your on-chain signals and reputation are not affected.
              </p>
              {showClearConfirm ? (
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowClearConfirm(false)}
                    className="flex-1 px-4 py-2 border border-[var(--border-default)] text-[var(--fg-primary)] rounded-nested hover:bg-[var(--bg-surface-container)]">
                    Cancel
                  </button>
                  <button type="button" onClick={handleClearData} disabled={isSaving}
                    className="flex-1 px-4 py-2 bg-[var(--fg-error)] text-white font-semibold rounded-nested hover:brightness-110 disabled:opacity-50">
                    {isSaving ? 'Clearing...' : 'Confirm Clear'}
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => setShowClearConfirm(true)}
                  className="px-4 py-2 border border-[var(--fg-error)]/50 text-[var(--fg-error)] rounded-nested hover:bg-[var(--fg-error)]/10">
                  Clear Profile Data
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
