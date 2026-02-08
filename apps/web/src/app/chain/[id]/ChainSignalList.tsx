'use client';

/**
 * Signal list component for chain detail page.
 * Shows signals as a timeline with corroboration actions.
 */

import type { ReactElement } from 'react';
import { useState } from 'react';
import type { Signal, CorroborationType } from '@cocuyo/types';

interface ChainSignalListProps {
  signals: Signal[];
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp * 1000;

  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

interface CorroborationModalProps {
  signal: Signal;
  onClose: () => void;
  onSubmit: (type: CorroborationType, note: string) => void;
}

function CorroborationModal({ signal: _signal, onClose, onSubmit }: CorroborationModalProps): ReactElement {
  const [selectedType, setSelectedType] = useState<CorroborationType | null>(null);
  const [note, setNote] = useState('');

  const corroborationTypes: { type: CorroborationType; label: string; description: string }[] = [
    {
      type: 'witness',
      label: 'Witness',
      description: 'I can independently confirm this observation.',
    },
    {
      type: 'evidence',
      label: 'Evidence',
      description: 'I have additional documentation that supports this.',
    },
    {
      type: 'expertise',
      label: 'Expertise',
      description: 'This is consistent with my knowledge in this domain.',
    },
    {
      type: 'challenge',
      label: 'Challenge',
      description: 'I have reason to believe this is inaccurate.',
    },
  ];

  const handleSubmit = (): void => {
    if (selectedType != null) {
      onSubmit(selectedType, note);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="w-full max-w-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border-default)] rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-2">Corroborate Signal</h3>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">
          You are staking your reputation on this corroboration.
        </p>

        <div className="space-y-3 mb-6">
          {corroborationTypes.map((ct) => (
            <button
              key={ct.type}
              type="button"
              onClick={() => setSelectedType(ct.type)}
              className={`w-full text-left p-4 rounded-lg border transition-colors ${
                selectedType === ct.type
                  ? ct.type === 'challenge'
                    ? 'border-[var(--color-challenged)] bg-[rgba(248,113,113,0.1)]'
                    : 'border-[var(--color-accent)] bg-[var(--color-accent-glow)]'
                  : 'border-[var(--color-border-default)] hover:border-[var(--color-border-emphasis)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`text-lg ${
                    ct.type === 'challenge'
                      ? 'text-[var(--color-challenged)]'
                      : selectedType === ct.type
                      ? 'text-[var(--color-accent)]'
                      : 'text-[var(--color-text-secondary)]'
                  }`}
                >
                  {ct.type === 'witness' && '◉'}
                  {ct.type === 'evidence' && '⚡'}
                  {ct.type === 'expertise' && '◈'}
                  {ct.type === 'challenge' && '△'}
                </span>
                <div>
                  <p className="font-medium text-[var(--color-text-primary)]">{ct.label}</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {ct.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mb-6">
          <label
            htmlFor="corroboration-note"
            className="block text-sm text-[var(--color-text-secondary)] mb-2"
          >
            Add a note (optional)
          </label>
          <textarea
            id="corroboration-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Explain your corroboration..."
            className="w-full p-3 bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] rounded-lg text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-accent)]"
            rows={3}
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm border border-[var(--color-border-default)] rounded-md text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-emphasis)] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={selectedType == null}
            className={`flex-1 px-4 py-2 text-sm rounded-md transition-colors ${
              selectedType == null
                ? 'bg-[var(--color-bg-elevated)] text-[var(--color-text-tertiary)] cursor-not-allowed'
                : selectedType === 'challenge'
                ? 'bg-[var(--color-challenged)] text-[var(--color-text-primary)] hover:opacity-90'
                : 'bg-[var(--color-accent)] text-black hover:opacity-90'
            }`}
          >
            {selectedType === 'challenge' ? 'Submit Challenge' : 'Corroborate'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ChainSignalList({ signals }: ChainSignalListProps): ReactElement {
  const [corroboratingSignal, setCorroboratingSignal] = useState<Signal | null>(null);

  const handleCorroborate = (type: CorroborationType, note: string): void => {
    // In real implementation, this would submit to the chain
    alert(`Corroboration submitted: ${type}${note ? ` - "${note}"` : ''}`);
    setCorroboratingSignal(null);
  };

  return (
    <>
      <div className="relative">
        {/* Timeline line */}
        <div
          className="absolute left-4 top-0 bottom-0 w-px bg-[var(--color-border-default)]"
          aria-hidden="true"
        />

        {/* Signals */}
        <div className="space-y-6">
          {signals.map((signal, index) => (
            <article
              key={signal.id}
              className="relative pl-12"
            >
              {/* Timeline dot */}
              <div
                className="absolute left-2 top-6 w-5 h-5 rounded-full bg-[var(--color-bg-primary)] border-2 border-[var(--color-border-emphasis)] flex items-center justify-center"
                aria-hidden="true"
              >
                <span
                  className="text-xs"
                  style={{ color: 'var(--color-accent)' }}
                >
                  {index + 1}
                </span>
              </div>

              <div className="bg-[var(--color-bg-tertiary)] border border-[var(--color-border-default)] rounded-lg p-6">
                {/* Context */}
                <div className="flex items-center gap-2 text-xs text-[var(--color-text-tertiary)] mb-3">
                  {signal.context.topics.length > 0 && (
                    <span className="capitalize">{signal.context.topics[0]}</span>
                  )}
                  {signal.context.locationName != null && (
                    <>
                      <span aria-hidden="true">&middot;</span>
                      <span>{signal.context.locationName}</span>
                    </>
                  )}
                  <span aria-hidden="true">&middot;</span>
                  <time dateTime={new Date(signal.createdAt * 1000).toISOString()}>
                    {formatRelativeTime(signal.createdAt)}
                  </time>
                </div>

                {/* Content */}
                <p className="text-base text-[var(--color-text-primary)] leading-relaxed mb-4">
                  {signal.content.text}
                </p>

                {/* Links if any */}
                {signal.content.links != null && signal.content.links.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-[var(--color-text-tertiary)] mb-1">
                      Referenced links:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {signal.content.links.map((link, i) => (
                        <a
                          key={i}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[var(--color-accent)] hover:underline"
                        >
                          Source {i + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Corroboration stats */}
                <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border-subtle)]">
                  <div className="flex items-center gap-4 text-sm text-[var(--color-text-secondary)]">
                    <span className="flex items-center gap-1">
                      <span className="text-[var(--color-corroborated)]">◉</span>
                      <span>
                        <span className="text-[var(--color-corroborated)]">
                          {signal.corroborations.witnessCount + signal.corroborations.expertiseCount}
                        </span>
                      </span>
                    </span>
                    {signal.corroborations.evidenceCount > 0 && (
                      <span className="flex items-center gap-1">
                        <span>⚡</span>
                        <span>{signal.corroborations.evidenceCount}</span>
                      </span>
                    )}
                    {signal.corroborations.challengeCount > 0 && (
                      <span className="flex items-center gap-1">
                        <span className="text-[var(--color-challenged)]">△</span>
                        <span className="text-[var(--color-challenged)]">
                          {signal.corroborations.challengeCount}
                        </span>
                      </span>
                    )}
                    <span className="text-[var(--color-text-tertiary)]">
                      Weight: {signal.corroborations.totalWeight.toFixed(1)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCorroboratingSignal(signal)}
                    className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
                  >
                    Corroborate
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Corroboration Modal */}
      {corroboratingSignal != null && (
        <CorroborationModal
          signal={corroboratingSignal}
          onClose={() => setCorroboratingSignal(null)}
          onSubmit={handleCorroborate}
        />
      )}
    </>
  );
}
