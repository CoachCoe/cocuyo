/**
 * Profile Page — View own firefly profile.
 */

'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { useIdentity } from '@/hooks/useIdentity';
import { VerificationBadge } from '@cocuyo/ui';
import type { DisclosureLevel } from '@cocuyo/types';

const DISCLOSURE_LABELS: Record<DisclosureLevel, { label: string; description: string }> = {
  anonymous: { label: 'Anonymous', description: 'Only pseudonym visible' },
  partial: { label: 'Partial', description: 'Show location and profession' },
  public: { label: 'Public', description: 'Full identity visible' },
};

const ALL_TOPICS: readonly string[] = [
  'politics',
  'health',
  'science',
  'technology',
  'environment',
  'economy',
  'local',
  'international',
  'culture',
  'security',
] as const;

export default function ProfilePage(): ReactNode {
  const { status, profile, updateProfile, credential } = useIdentity();
  const [isEditing, setIsEditing] = useState(false);
  const [editPseudonym, setEditPseudonym] = useState('');
  const [editDisclosure, setEditDisclosure] = useState<DisclosureLevel>('anonymous');
  const [editTopics, setEditTopics] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-[var(--bg-default)]">
        <div className="container max-w-2xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-[var(--bg-surface-nested)] rounded w-1/3" />
            <div className="h-32 bg-[var(--bg-surface-nested)] rounded" />
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
            <p className="text-[var(--fg-secondary)] mb-4">Complete onboarding to create your profile.</p>
            <Link href="/onboarding"
              className="inline-block px-4 py-2 bg-[var(--color-firefly-gold)] text-[var(--bg-surface-main)] font-semibold rounded-nested hover:brightness-110">
              Start Onboarding
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const startEditing = (): void => {
    setEditPseudonym(profile.pseudonym);
    setEditDisclosure(profile.disclosureLevel);
    setEditTopics([...profile.followedTopics]);
    setIsEditing(true);
  };

  const handleSave = (): void => {
    setIsSaving(true);
    updateProfile({
      pseudonym: editPseudonym,
      disclosureLevel: editDisclosure,
      followedTopics: editTopics,
    }).then(() => {
      setIsSaving(false);
      setIsEditing(false);
    }).catch(() => {
      setIsSaving(false);
    });
  };

  const toggleTopic = (topic: string): void => {
    setEditTopics((prev: string[]): string[] => {
      if (prev.includes(topic)) {
        return prev.filter((t: string): boolean => t !== topic);
      }
      return [...prev, topic];
    });
  };

  return (
    <main className="min-h-screen bg-[var(--bg-default)]">
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-[var(--fg-primary)]">Your Profile</h1>
          {!isEditing && (
            <button type="button" onClick={startEditing}
              className="text-sm text-[var(--color-firefly-gold)] hover:underline">
              Edit Profile
            </button>
          )}
        </div>

        {/* Identity Card */}
        <div className="p-6 bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-container mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-[var(--bg-surface-container)] border border-[var(--border-default)] flex items-center justify-center text-2xl font-bold text-[var(--fg-primary)]">
              {profile.pseudonym.charAt(0).toUpperCase()}
            </div>
            <div>
              {isEditing ? (
                <input type="text" value={editPseudonym}
                  onChange={(e) => setEditPseudonym(e.target.value)}
                  className="px-3 py-2 bg-[var(--bg-surface-container)] border border-[var(--border-default)] rounded-nested text-[var(--fg-primary)] font-semibold text-xl focus:outline-none focus:border-[var(--color-firefly-gold)]"
                />
              ) : (
                <h2 className="text-xl font-semibold text-[var(--fg-primary)]">{profile.pseudonym}</h2>
              )}
              <p className="text-sm text-[var(--fg-tertiary)]">
                {DISCLOSURE_LABELS[profile.disclosureLevel].label} firefly
              </p>
            </div>
          </div>

          {credential !== null && (
            <div className="flex items-center gap-2 text-sm text-[var(--fg-tertiary)]">
              <VerificationBadge status="verified" showLabel size="sm" />
              <span>&middot;</span>
              <span className="font-mono text-xs">{credential.hash.slice(0, 12)}...</span>
            </div>
          )}
        </div>

        {/* Disclosure Level */}
        {isEditing && (
          <div className="p-6 bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-container mb-6">
            <h3 className="font-semibold text-[var(--fg-primary)] mb-4">Disclosure Level</h3>
            <div className="grid grid-cols-2 gap-3">
              {(Object.entries(DISCLOSURE_LABELS) as Array<[DisclosureLevel, typeof DISCLOSURE_LABELS['anonymous']]>).map(([level, info]) => (
                <button key={level} type="button" onClick={() => setEditDisclosure(level)}
                  className={`p-3 border rounded-nested text-left transition-colors ${
                    editDisclosure === level
                      ? 'border-[var(--color-firefly-gold)] bg-[var(--color-firefly-gold)]/10'
                      : 'border-[var(--border-default)] hover:border-[var(--border-emphasis)]'
                  }`}>
                  <p className="font-medium text-[var(--fg-primary)]">{info.label}</p>
                  <p className="text-xs text-[var(--fg-tertiary)]">{info.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="p-6 bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-container mb-6">
          <h3 className="font-semibold text-[var(--fg-primary)] mb-4">Stats</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-[var(--fg-primary)]">{profile.stats.signalsPosted}</p>
              <p className="text-xs text-[var(--fg-tertiary)]">Signals</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--fg-primary)]">{profile.stats.corroborationsGiven}</p>
              <p className="text-xs text-[var(--fg-tertiary)]">Corroborations</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--fg-primary)]">{profile.stats.collectivesJoined}</p>
              <p className="text-xs text-[var(--fg-tertiary)]">Collectives</p>
            </div>
          </div>
        </div>

        {/* Reputation */}
        <div className="p-6 bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-container mb-6">
          <h3 className="font-semibold text-[var(--fg-primary)] mb-4">Reputation</h3>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-[var(--color-firefly-gold)]">{profile.reputation.overall}</p>
              <p className="text-xs text-[var(--fg-tertiary)]">Overall</p>
            </div>
            <div className="flex-1 border-l border-[var(--border-default)] pl-4">
              <p className="text-sm text-[var(--fg-secondary)]">
                {(profile.reputation.accuracyRate * 100).toFixed(0)}% accuracy rate
              </p>
            </div>
          </div>
        </div>

        {/* Followed Topics */}
        <div className="p-6 bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-container mb-6">
          <h3 className="font-semibold text-[var(--fg-primary)] mb-4">Followed Topics</h3>
          {isEditing ? (
            <div className="flex flex-wrap gap-2">
              {ALL_TOPICS.map((topic) => (
                <button key={topic} type="button" onClick={() => toggleTopic(topic)}
                  className={`px-3 py-1.5 rounded-full text-sm capitalize transition-colors ${
                    editTopics.includes(topic)
                      ? 'bg-[var(--color-firefly-gold)] text-[var(--bg-surface-main)]'
                      : 'bg-[var(--bg-surface-container)] text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]'
                  }`}>
                  {topic}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.followedTopics.length > 0 ? (
                profile.followedTopics.map((topic) => (
                  <span key={topic}
                    className="px-3 py-1 bg-[var(--bg-surface-container)] rounded-full text-sm text-[var(--fg-secondary)] capitalize">
                    {topic}
                  </span>
                ))
              ) : (
                <p className="text-sm text-[var(--fg-tertiary)]">No topics followed</p>
              )}
            </div>
          )}
        </div>

        {/* Edit Actions */}
        {isEditing && (
          <div className="flex gap-3">
            <button type="button" onClick={() => setIsEditing(false)}
              className="flex-1 px-4 py-3 border border-[var(--border-default)] text-[var(--fg-primary)] font-semibold rounded-nested hover:bg-[var(--bg-surface-nested)]">
              Cancel
            </button>
            <button type="button" onClick={handleSave} disabled={isSaving || editPseudonym.trim() === ''}
              className="flex-1 px-4 py-3 bg-[var(--color-firefly-gold)] text-[var(--bg-surface-main)] font-semibold rounded-nested hover:brightness-110 disabled:opacity-50">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}

        {/* Links */}
        {!isEditing && (
          <div className="mt-6 flex gap-4 text-sm">
            <Link href="/settings" className="text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]">
              Settings
            </Link>
            <Link href="/collectives" className="text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]">
              Browse Collectives
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
