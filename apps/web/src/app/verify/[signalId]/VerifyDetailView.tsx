'use client';

/**
 * VerifyDetailView — Verification workflow with evidence and voting.
 */

import type { ReactNode } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import type { VerificationRequest, Signal, VerificationStatus } from '@cocuyo/types';
import { VerificationBadge } from '@cocuyo/ui';
import { useIdentity } from '@/hooks/useIdentity';

interface Props {
  request: VerificationRequest;
  signal: Signal;
  collectiveName?: string;
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const ts = timestamp > 1e12 ? timestamp : timestamp * 1000;
  const diff = now - ts;
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const VERDICT_OPTIONS: Array<{ value: VerificationStatus; label: string; color: string }> = [
  { value: 'verified', label: 'Verified', color: 'var(--fg-success)' },
  { value: 'disputed', label: 'Disputed', color: 'var(--fg-warning)' },
  { value: 'false', label: 'False', color: 'var(--fg-error)' },
  { value: 'synthetic', label: 'AI Generated', color: 'var(--fg-info)' },
];

export function VerifyDetailView({ request, signal, collectiveName }: Props): ReactNode {
  const { status: identityStatus } = useIdentity();
  const isReady = identityStatus === 'ready';

  const [showEvidenceForm, setShowEvidenceForm] = useState(false);
  const [evidenceContent, setEvidenceContent] = useState('');
  const [evidenceSources, setEvidenceSources] = useState('');
  const [evidenceSupports, setEvidenceSupports] = useState(true);

  const [showVoteForm, setShowVoteForm] = useState(false);
  const [selectedVerdict, setSelectedVerdict] = useState<VerificationStatus>('verified');
  const [voteReasoning, setVoteReasoning] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitEvidence = (): void => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowEvidenceForm(false);
      setEvidenceContent('');
      setEvidenceSources('');
    }, 1000);
  };

  const handleSubmitVote = (): void => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowVoteForm(false);
      setVoteReasoning('');
    }, 1000);
  };

  return (
    <article className="space-y-8">
      {/* Header */}
      <div>
        <Link href="/verify" className="inline-flex items-center gap-2 text-sm text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] transition-colors mb-4">
          <span>&larr;</span> Back to Workbench
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full capitalize mb-2 ${
              request.status === 'pending' ? 'bg-[var(--fg-tertiary)]/20 text-[var(--fg-tertiary)]' :
              request.status === 'in_review' ? 'bg-[var(--fg-warning)]/20 text-[var(--fg-warning)]' :
              'bg-[var(--color-firefly-gold)]/20 text-[var(--color-firefly-gold)]'
            }`}>
              {request.status.replace('_', ' ')}
            </span>
            {collectiveName !== undefined && (
              <p className="text-sm text-[var(--fg-tertiary)]">Assigned to {collectiveName}</p>
            )}
          </div>
          <VerificationBadge status={signal.verification.status} showLabel size="md" />
        </div>
      </div>

      {/* Signal being verified */}
      <div className="p-4 bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-container">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-[var(--bg-surface-container)] border border-[var(--border-default)] flex items-center justify-center text-sm font-medium text-[var(--fg-primary)]">
            {signal.author.pseudonym.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium text-[var(--fg-primary)]">{signal.author.pseudonym}</span>
          <span className="text-sm text-[var(--fg-tertiary)]">&middot; {formatRelativeTime(signal.createdAt)}</span>
        </div>
        <p className="text-[var(--fg-primary)]">{signal.content.text}</p>
        <div className="flex gap-2 mt-3">
          {signal.context.topics.map((topic) => (
            <span key={topic} className="px-2 py-0.5 bg-[var(--bg-surface-container)] rounded-full text-xs text-[var(--fg-tertiary)] capitalize">
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* Evidence section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--fg-primary)]">Evidence ({request.evidence.length})</h2>
          {!showEvidenceForm && (
            <button type="button" onClick={() => setShowEvidenceForm(true)}
              className="text-sm text-[var(--color-firefly-gold)] hover:underline">
              + Add Evidence
            </button>
          )}
        </div>

        {showEvidenceForm && (
          <div className="p-4 bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-container space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-[var(--fg-primary)]">Submit Evidence</h3>
              <button type="button" onClick={() => setShowEvidenceForm(false)} className="text-sm text-[var(--fg-tertiary)]">Cancel</button>
            </div>
            {!isReady && (
              <div className="p-3 bg-[var(--fg-warning)]/10 border border-[var(--fg-warning)]/30 rounded-nested text-sm text-[var(--fg-warning)]">
                Complete your profile to submit evidence.
              </div>
            )}
            <div className="flex gap-4">
              {[true, false].map((supports) => (
                <button key={String(supports)} type="button" onClick={() => setEvidenceSupports(supports)}
                  className={`flex-1 p-3 border rounded-nested transition-colors ${
                    evidenceSupports === supports ? 'border-[var(--color-firefly-gold)] bg-[var(--color-firefly-gold)]/10' : 'border-[var(--border-default)]'
                  }`}>
                  <span className={supports ? 'text-[var(--fg-success)]' : 'text-[var(--fg-error)]'}>
                    {supports ? 'Supports' : 'Contradicts'}
                  </span>
                </button>
              ))}
            </div>
            <textarea value={evidenceContent} onChange={(e) => setEvidenceContent(e.target.value)}
              placeholder="Describe the evidence..." rows={3}
              className="w-full px-4 py-3 bg-[var(--bg-surface-container)] border border-[var(--border-default)] rounded-nested text-[var(--fg-primary)] placeholder:text-[var(--fg-tertiary)] focus:outline-none focus:border-[var(--color-firefly-gold)]"
            />
            <input type="text" value={evidenceSources} onChange={(e) => setEvidenceSources(e.target.value)}
              placeholder="Source URL"
              className="w-full px-4 py-3 bg-[var(--bg-surface-container)] border border-[var(--border-default)] rounded-nested text-[var(--fg-primary)] placeholder:text-[var(--fg-tertiary)] focus:outline-none focus:border-[var(--color-firefly-gold)]"
            />
            <button type="button" onClick={handleSubmitEvidence}
              disabled={!isReady || isSubmitting || evidenceContent.trim() === ''}
              className="w-full px-4 py-3 bg-[var(--color-firefly-gold)] text-[var(--bg-surface-main)] font-semibold rounded-nested hover:brightness-110 disabled:opacity-50">
              {isSubmitting ? 'Submitting...' : 'Submit Evidence'}
            </button>
          </div>
        )}

        {request.evidence.length > 0 ? (
          <div className="space-y-3">
            {request.evidence.map((ev, i) => (
              <div key={i} className="p-4 bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-nested">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[var(--fg-primary)]">{ev.submitterPseudonym}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${ev.supports ? 'bg-[var(--fg-success)]/20 text-[var(--fg-success)]' : 'bg-[var(--fg-error)]/20 text-[var(--fg-error)]'}`}>
                      {ev.supports ? 'Supports' : 'Contradicts'}
                    </span>
                  </div>
                  <span className="text-xs text-[var(--fg-tertiary)]">{formatRelativeTime(ev.submittedAt)}</span>
                </div>
                <p className="text-sm text-[var(--fg-primary)]">{ev.content}</p>
                {ev.sources.length > 0 && (
                  <a href={ev.sources[0]} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-[var(--color-firefly-gold)] hover:underline mt-2 block truncate">
                    {ev.sources[0]}
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--fg-tertiary)]">No evidence submitted yet.</p>
        )}
      </div>

      {/* Voting section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--fg-primary)]">Votes ({request.votes.length})</h2>
          {!showVoteForm && request.status !== 'pending' && (
            <button type="button" onClick={() => setShowVoteForm(true)}
              className="text-sm text-[var(--color-firefly-gold)] hover:underline">
              Cast Vote
            </button>
          )}
        </div>

        {showVoteForm && (
          <div className="p-4 bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-container space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-[var(--fg-primary)]">Cast Your Vote</h3>
              <button type="button" onClick={() => setShowVoteForm(false)} className="text-sm text-[var(--fg-tertiary)]">Cancel</button>
            </div>
            {!isReady && (
              <div className="p-3 bg-[var(--fg-warning)]/10 border border-[var(--fg-warning)]/30 rounded-nested text-sm text-[var(--fg-warning)]">
                Complete your profile to vote.
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              {VERDICT_OPTIONS.map((opt) => (
                <button key={opt.value} type="button" onClick={() => setSelectedVerdict(opt.value)}
                  className={`p-3 border rounded-nested transition-colors ${
                    selectedVerdict === opt.value ? 'border-[var(--color-firefly-gold)] bg-[var(--color-firefly-gold)]/10' : 'border-[var(--border-default)]'
                  }`}>
                  <span style={{ color: opt.color }}>{opt.label}</span>
                </button>
              ))}
            </div>
            <textarea value={voteReasoning} onChange={(e) => setVoteReasoning(e.target.value)}
              placeholder="Reasoning (optional)..." rows={2}
              className="w-full px-4 py-3 bg-[var(--bg-surface-container)] border border-[var(--border-default)] rounded-nested text-[var(--fg-primary)] placeholder:text-[var(--fg-tertiary)] focus:outline-none focus:border-[var(--color-firefly-gold)]"
            />
            <button type="button" onClick={handleSubmitVote}
              disabled={!isReady || isSubmitting}
              className="w-full px-4 py-3 bg-[var(--color-firefly-gold)] text-[var(--bg-surface-main)] font-semibold rounded-nested hover:brightness-110 disabled:opacity-50">
              {isSubmitting ? 'Submitting...' : 'Submit Vote'}
            </button>
          </div>
        )}

        {request.votes.length > 0 ? (
          <div className="space-y-2">
            {request.votes.map((vote, i) => (
              <div key={i} className="p-3 bg-[var(--bg-surface-nested)] border border-[var(--border-default)] rounded-nested flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[var(--fg-primary)]">{vote.voterPseudonym}</span>
                  <VerificationBadge status={vote.verdict} showLabel size="sm" />
                </div>
                <span className="text-xs text-[var(--fg-tertiary)]">{formatRelativeTime(vote.votedAt)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--fg-tertiary)]">No votes cast yet.</p>
        )}
      </div>
    </article>
  );
}
