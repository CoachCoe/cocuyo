'use client';

/**
 * SignalDetailView — Client component for signal details.
 *
 * Shows full signal content, verification status, author info,
 * corroboration breakdown, and inline corroboration form.
 */

import type { ReactNode } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import type { Signal, ChainId, CorroborationType } from '@cocuyo/types';
import { VerificationBadge } from '@cocuyo/ui';
import { useIdentity } from '@/hooks/useIdentity';

interface SignalDetailViewProps {
  signal: Signal;
  chainTitles: Record<string, string>;
}

function formatDateTime(timestamp: number): string {
  const ts = timestamp > 1e12 ? timestamp : timestamp * 1000;
  return new Date(ts).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const ts = timestamp > 1e12 ? timestamp : timestamp * 1000;
  const diff = now - ts;

  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${String(minutes)}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${String(hours)}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${String(days)}d ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${String(weeks)}w ago`;

  const months = Math.floor(days / 30);
  return `${String(months)}mo ago`;
}

const CORROBORATION_TYPES: Array<{ value: CorroborationType; label: string; description: string }> = [
  { value: 'witness', label: 'Witness', description: 'I can independently confirm this' },
  { value: 'evidence', label: 'Evidence', description: 'I have documentation that supports this' },
  { value: 'expertise', label: 'Expertise', description: 'This is consistent with my domain knowledge' },
];

export function SignalDetailView({
  signal,
  chainTitles,
}: SignalDetailViewProps): ReactNode {
  const { author, content, context, corroborations, verification, chainLinks, createdAt } = signal;
  const { status } = useIdentity();

  const [showForm, setShowForm] = useState<'corroborate' | 'challenge' | null>(null);
  const [corroborationType, setCorroborationType] = useState<CorroborationType>('witness');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isReady = status === 'ready';

  const handleSubmit = (): void => {
    if (!isReady) return;
    setIsSubmitting(true);
    // TODO: Submit to service
    setTimeout(() => {
      setIsSubmitting(false);
      setShowForm(null);
      setNote('');
    }, 1000);
  };

  return (
    <article className="space-y-8">
      {/* Header with author and verification */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[var(--bg-surface-container)] border border-[var(--border-default)] flex items-center justify-center text-lg font-medium text-[var(--fg-primary)]">
            {author.pseudonym.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-[var(--fg-primary)]">
                {author.pseudonym}
              </span>
              {author.disclosureLevel !== 'anonymous' && author.displayName !== undefined && (
                <span className="text-sm text-[var(--fg-secondary)]">
                  ({author.displayName})
                </span>
              )}
            </div>
            {author.location !== undefined && (
              <span className="text-sm text-[var(--fg-tertiary)]">
                {author.location}
              </span>
            )}
          </div>
        </div>
        <VerificationBadge status={verification.status} showLabel={true} size="md" />
      </div>

      {/* Content */}
      <div className="space-y-4">
        <p className="text-lg text-[var(--fg-primary)] leading-relaxed">
          {content.text}
        </p>
        {content.links !== undefined && content.links.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-[var(--fg-secondary)]">Referenced Links</h3>
            <div className="space-y-1">
              {content.links.map((link, i) => (
                <a key={i} href={link} target="_blank" rel="noopener noreferrer"
                  className="block text-sm text-[var(--color-firefly-gold)] hover:underline truncate">
                  {link}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Context metadata */}
      <div className="p-4 bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-container">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-[var(--fg-tertiary)]">Topics:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {context.topics.map((topic) => (
                <span key={topic} className="px-2 py-0.5 bg-[var(--bg-surface-container)] rounded-full text-xs text-[var(--fg-secondary)] capitalize">
                  {topic}
                </span>
              ))}
            </div>
          </div>
          {context.locationName !== undefined && (
            <div>
              <span className="text-[var(--fg-tertiary)]">Location:</span>
              <div className="mt-1 text-[var(--fg-primary)]">{context.locationName}</div>
            </div>
          )}
          <div>
            <span className="text-[var(--fg-tertiary)]">Illuminated:</span>
            <div className="mt-1 text-[var(--fg-primary)]">{formatRelativeTime(createdAt)}</div>
            <div className="text-xs text-[var(--fg-tertiary)]">{formatDateTime(createdAt)}</div>
          </div>
        </div>
      </div>

      {/* Corroboration breakdown */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--fg-primary)]">Corroborations</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { count: corroborations.witnessCount, label: 'Witnesses', color: 'var(--fg-success)' },
            { count: corroborations.evidenceCount, label: 'Evidence', color: 'var(--fg-primary)' },
            { count: corroborations.expertiseCount, label: 'Expert', color: 'var(--color-firefly-gold)' },
            { count: corroborations.challengeCount, label: 'Challenges', color: 'var(--fg-error)' },
          ].map(({ count, label, color }) => (
            <div key={label} className="p-4 bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-nested text-center">
              <div className="text-2xl font-bold" style={{ color }}>{count}</div>
              <div className="text-sm text-[var(--fg-secondary)]">{label}</div>
            </div>
          ))}
        </div>
        <div className="text-sm text-[var(--fg-tertiary)]">
          Total weight: {corroborations.totalWeight.toFixed(1)}
        </div>
      </div>

      {/* Story chains */}
      {chainLinks.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[var(--fg-primary)]">Part of Story Chains</h2>
          <div className="space-y-2">
            {chainLinks.map((chainId: ChainId) => (
              <Link key={chainId} href={`/chain/${chainId}`}
                className="block p-4 bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-nested hover:border-[var(--border-emphasis)] transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[var(--fg-primary)]">{chainTitles[chainId] ?? chainId}</span>
                  <span className="text-[var(--fg-tertiary)]" aria-hidden="true">&rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="pt-4 border-t border-[var(--border-default)] space-y-4">
        {showForm === null ? (
          <div className="flex gap-4">
            <button type="button" onClick={() => setShowForm('corroborate')}
              className="flex-1 px-4 py-3 bg-[var(--color-firefly-gold)] text-[var(--bg-surface-main)] font-semibold rounded-nested hover:brightness-110 transition-all">
              Corroborate
            </button>
            <button type="button" onClick={() => setShowForm('challenge')}
              className="px-4 py-3 border border-[var(--border-default)] text-[var(--fg-secondary)] rounded-nested hover:border-[var(--border-emphasis)] hover:text-[var(--fg-primary)] transition-colors">
              Challenge
            </button>
          </div>
        ) : (
          <div className="p-4 bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-container space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[var(--fg-primary)]">
                {showForm === 'corroborate' ? 'Add Corroboration' : 'Submit Challenge'}
              </h3>
              <button type="button" onClick={() => setShowForm(null)}
                className="text-sm text-[var(--fg-tertiary)] hover:text-[var(--fg-primary)]">
                Cancel
              </button>
            </div>

            {!isReady && (
              <div className="p-3 bg-[var(--fg-warning)]/10 border border-[var(--fg-warning)]/30 rounded-nested text-sm text-[var(--fg-warning)]">
                Complete your profile setup to {showForm === 'corroborate' ? 'corroborate' : 'challenge'} signals.
              </div>
            )}

            {showForm === 'corroborate' && (
              <div className="space-y-2">
                <label className="text-sm text-[var(--fg-secondary)]">Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {CORROBORATION_TYPES.map((type) => (
                    <button key={type.value} type="button"
                      onClick={() => setCorroborationType(type.value)}
                      className={`p-3 text-left border rounded-nested transition-colors ${
                        corroborationType === type.value
                          ? 'border-[var(--color-firefly-gold)] bg-[var(--color-firefly-gold)]/10'
                          : 'border-[var(--border-default)] hover:border-[var(--border-emphasis)]'
                      }`}>
                      <div className="font-medium text-sm text-[var(--fg-primary)]">{type.label}</div>
                      <div className="text-xs text-[var(--fg-tertiary)]">{type.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm text-[var(--fg-secondary)]">
                {showForm === 'corroborate' ? 'Note (optional)' : 'Reason for challenge'}
              </label>
              <textarea value={note} onChange={(e) => setNote(e.target.value)}
                placeholder={showForm === 'corroborate' ? 'Add context or details...' : 'Explain why this is inaccurate...'}
                rows={3}
                className="w-full px-4 py-3 bg-[var(--bg-surface-container)] border border-[var(--border-default)] rounded-nested text-[var(--fg-primary)] placeholder:text-[var(--fg-tertiary)] focus:outline-none focus:border-[var(--color-firefly-gold)]"
              />
            </div>

            <button type="button" onClick={handleSubmit}
              disabled={!isReady || isSubmitting || (showForm === 'challenge' && note.trim() === '')}
              className="w-full px-4 py-3 bg-[var(--color-firefly-gold)] text-[var(--bg-surface-main)] font-semibold rounded-nested hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? 'Submitting...' : showForm === 'corroborate' ? 'Submit Corroboration' : 'Submit Challenge'}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
