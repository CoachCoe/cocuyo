'use client';

/**
 * CollectiveDetailView — Collective details with inline join form.
 */

import type { ReactNode } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import type { Collective } from '@cocuyo/types';
import { useIdentity } from '@/hooks/useIdentity';

interface Props {
  collective: Collective;
}

export function CollectiveDetailView({ collective }: Props): ReactNode {
  const { status, profile } = useIdentity();
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isReady = status === 'ready';
  const isMember = isReady && profile !== null &&
    collective.members.some((m) => m.credentialHash === profile.credentialHash);

  const handleJoin = (): void => {
    if (!isReady) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowJoinForm(false);
      setMessage('');
    }, 1000);
  };

  return (
    <article className="space-y-8">
      {/* Header */}
      <div>
        <Link href="/collectives" className="inline-flex items-center gap-2 text-sm text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] transition-colors mb-4">
          <span>&larr;</span> Back to Collectives
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--fg-primary)]">{collective.name}</h1>
            <p className="text-[var(--fg-secondary)] mt-2">{collective.description}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-[var(--color-firefly-gold)]">{collective.reputation.score}</div>
            <div className="text-sm text-[var(--fg-tertiary)]">reputation</div>
          </div>
        </div>
      </div>

      {/* Mission */}
      <div className="p-4 bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-container">
        <h2 className="text-sm font-medium text-[var(--fg-tertiary)] mb-2">Mission</h2>
        <p className="text-[var(--fg-primary)]">{collective.mission}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { value: collective.members.length, label: 'Members' },
          { value: collective.reputation.verificationsCompleted, label: 'Verifications' },
          { value: `${(collective.reputation.accuracyRate * 100).toFixed(0)}%`, label: 'Accuracy' },
          { value: `${collective.reputation.avgResponseTime}h`, label: 'Avg Response' },
        ].map(({ value, label }) => (
          <div key={label} className="p-4 bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-nested text-center">
            <div className="text-2xl font-bold text-[var(--fg-primary)]">{value}</div>
            <div className="text-sm text-[var(--fg-secondary)]">{label}</div>
          </div>
        ))}
      </div>

      {/* Topics */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--fg-primary)] mb-3">Focus Areas</h2>
        <div className="flex flex-wrap gap-2">
          {collective.topics.map((topic) => (
            <span key={topic} className="px-3 py-1 bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-full text-sm text-[var(--fg-secondary)] capitalize">
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* Members */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--fg-primary)] mb-3">Members</h2>
        <div className="space-y-2">
          {collective.members.map((member) => (
            <div key={member.credentialHash} className="flex items-center justify-between p-3 bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-nested">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--bg-surface-container)] border border-[var(--border-default)] flex items-center justify-center text-sm font-medium text-[var(--fg-primary)]">
                  {member.pseudonym.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="font-medium text-[var(--fg-primary)]">{member.pseudonym}</span>
                  <span className="ml-2 text-xs text-[var(--fg-tertiary)] capitalize">{member.role}</span>
                </div>
              </div>
              <span className="text-sm text-[var(--fg-tertiary)]">{member.verificationsCompleted} verifications</span>
            </div>
          ))}
        </div>
      </div>

      {/* Governance */}
      <div>
        <h2 className="text-lg font-semibold text-[var(--fg-primary)] mb-3">Governance</h2>
        <div className="p-4 bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-container text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-[var(--fg-tertiary)]">Membership:</span>
            <span className="text-[var(--fg-primary)] capitalize">{collective.governance.membershipApproval}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--fg-tertiary)]">Verdict threshold:</span>
            <span className="text-[var(--fg-primary)]">{collective.governance.verdictThreshold}% agreement</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--fg-tertiary)]">Min votes:</span>
            <span className="text-[var(--fg-primary)]">{collective.governance.minVotesForVerdict} votes</span>
          </div>
        </div>
      </div>

      {/* Join section */}
      <div className="pt-4 border-t border-[var(--border-default)]">
        {isMember ? (
          <div className="p-4 bg-[var(--fg-success)]/10 border border-[var(--fg-success)]/30 rounded-container text-center">
            <span className="text-[var(--fg-success)] font-medium">You are a member of this collective</span>
          </div>
        ) : showJoinForm ? (
          <div className="p-4 bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-container space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[var(--fg-primary)]">Request to Join</h3>
              <button type="button" onClick={() => setShowJoinForm(false)} className="text-sm text-[var(--fg-tertiary)] hover:text-[var(--fg-primary)]">
                Cancel
              </button>
            </div>
            {!isReady && (
              <div className="p-3 bg-[var(--fg-warning)]/10 border border-[var(--fg-warning)]/30 rounded-nested text-sm text-[var(--fg-warning)]">
                Complete your profile setup to join collectives.
              </div>
            )}
            <div>
              <label className="text-sm text-[var(--fg-secondary)]">Why do you want to join?</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your interest and relevant experience..."
                rows={3}
                className="w-full mt-2 px-4 py-3 bg-[var(--bg-surface-container)] border border-[var(--border-default)] rounded-nested text-[var(--fg-primary)] placeholder:text-[var(--fg-tertiary)] focus:outline-none focus:border-[var(--color-firefly-gold)]"
              />
            </div>
            <button type="button" onClick={handleJoin}
              disabled={!isReady || isSubmitting || message.trim() === ''}
              className="w-full px-4 py-3 bg-[var(--color-firefly-gold)] text-[var(--bg-surface-main)] font-semibold rounded-nested hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => setShowJoinForm(true)}
            className="w-full px-4 py-3 bg-[var(--color-firefly-gold)] text-[var(--bg-surface-main)] font-semibold rounded-nested hover:brightness-110 transition-all">
            Join Collective
          </button>
        )}
      </div>
    </article>
  );
}
