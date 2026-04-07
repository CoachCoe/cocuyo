'use client';

/**
 * Post list component for chain detail page.
 * Shows posts as a timeline with corroboration actions.
 */

import type { ReactElement } from 'react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Post, CorroborationType } from '@cocuyo/types';
import { useFormatters } from '@/lib/hooks/useFormatters';
import { ExternalLink } from '@/components/ExternalLink';

interface ChainPostListProps {
  posts: Post[];
}

interface CorroborationModalProps {
  post: Post;
  onClose: () => void;
  onSubmit: (type: CorroborationType, note: string) => void;
  translations: {
    title: string;
    stakingWarning: string;
    witness: string;
    witnessDesc: string;
    evidence: string;
    evidenceDesc: string;
    expertise: string;
    expertiseDesc: string;
    challenge: string;
    challengeDesc: string;
    noteLabel: string;
    notePlaceholder: string;
    cancel: string;
    submitChallenge: string;
    corroborate: string;
  };
}

function CorroborationModal({ post: _post, onClose, onSubmit, translations: t }: CorroborationModalProps): ReactElement {
  const [selectedType, setSelectedType] = useState<CorroborationType | null>(null);
  const [note, setNote] = useState('');

  const corroborationTypes: { type: CorroborationType; label: string; description: string }[] = [
    {
      type: 'witness',
      label: t.witness,
      description: t.witnessDesc,
    },
    {
      type: 'evidence',
      label: t.evidence,
      description: t.evidenceDesc,
    },
    {
      type: 'expertise',
      label: t.expertise,
      description: t.expertiseDesc,
    },
    {
      type: 'challenge',
      label: t.challenge,
      description: t.challengeDesc,
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
        <h3 className="text-xl font-semibold mb-2">{t.title}</h3>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">
          {t.stakingWarning}
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
            {t.noteLabel}
          </label>
          <textarea
            id="corroboration-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t.notePlaceholder}
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
            {t.cancel}
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
            {selectedType === 'challenge' ? t.submitChallenge : t.corroborate}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ChainPostList({ posts }: ChainPostListProps): ReactElement {
  const [corroboratingPost, setCorroboratingPost] = useState<Post | null>(null);
  const { formatRelativeTime } = useFormatters();
  const t = useTranslations('corroboration');

  const handleCorroborate = (type: CorroborationType, note: string): void => {
    // In real implementation, this would submit to the chain
    alert(`Corroboration submitted: ${type}${note ? ` - "${note}"` : ''}`);
    setCorroboratingPost(null);
  };

  const modalTranslations = {
    title: t('modal.title'),
    stakingWarning: t('modal.stakingWarning'),
    witness: t('types.witness'),
    witnessDesc: t('types.witnessDesc'),
    evidence: t('types.evidence'),
    evidenceDesc: t('types.evidenceDesc'),
    expertise: t('types.expertise'),
    expertiseDesc: t('types.expertiseDesc'),
    challenge: t('types.challenge'),
    challengeDesc: t('types.challengeDesc'),
    noteLabel: t('modal.noteLabel'),
    notePlaceholder: t('modal.notePlaceholder'),
    cancel: t('modal.cancel'),
    submitChallenge: t('modal.submitChallenge'),
    corroborate: t('modal.corroborate'),
  };

  return (
    <>
      <div className="relative">
        {/* Timeline line */}
        <div
          className="absolute left-4 top-0 bottom-0 w-px bg-[var(--color-border-default)]"
          aria-hidden="true"
        />

        {/* Posts */}
        <div className="space-y-6">
          {posts.map((post, index) => (
            <article
              key={post.id}
              className={`relative pl-12 ${index < 10 ? 'animate-stagger-item' : ''}`}
              style={{ '--stagger-index': index } as React.CSSProperties}
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
                  {post.context.topics.length > 0 && (
                    <span className="capitalize">{post.context.topics[0]}</span>
                  )}
                  {post.context.locationName != null && (
                    <>
                      <span aria-hidden="true">&middot;</span>
                      <span>{post.context.locationName}</span>
                    </>
                  )}
                  <span aria-hidden="true">&middot;</span>
                  <time dateTime={new Date(post.createdAt * 1000).toISOString()}>
                    {formatRelativeTime(post.createdAt * 1000)}
                  </time>
                </div>

                {/* Content */}
                <p className="text-base text-[var(--color-text-primary)] leading-relaxed mb-4">
                  {post.content.text}
                </p>

                {/* Links if any */}
                {post.content.links != null && post.content.links.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-[var(--color-text-tertiary)] mb-1">
                      {t('referencedLinks')}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {post.content.links.map((link, i) => (
                        <ExternalLink
                          key={i}
                          href={link}
                          className="text-sm text-[var(--color-accent)] hover:underline"
                        >
                          {t('source')} {i + 1}
                        </ExternalLink>
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
                          {post.corroborations.witnessCount + post.corroborations.expertiseCount}
                        </span>
                      </span>
                    </span>
                    {post.corroborations.evidenceCount > 0 && (
                      <span className="flex items-center gap-1">
                        <span>⚡</span>
                        <span>{post.corroborations.evidenceCount}</span>
                      </span>
                    )}
                    {post.corroborations.challengeCount > 0 && (
                      <span className="flex items-center gap-1">
                        <span className="text-[var(--color-challenged)]">△</span>
                        <span className="text-[var(--color-challenged)]">
                          {post.corroborations.challengeCount}
                        </span>
                      </span>
                    )}
                    <span className="text-[var(--color-text-tertiary)]">
                      {t('weight')}: {post.corroborations.totalWeight.toFixed(1)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCorroboratingPost(post)}
                    className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
                  >
                    {t('modal.corroborate')}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Corroboration Modal */}
      {corroboratingPost != null && (
        <CorroborationModal
          post={corroboratingPost}
          onClose={() => setCorroboratingPost(null)}
          onSubmit={handleCorroborate}
          translations={modalTranslations}
        />
      )}
    </>
  );
}
