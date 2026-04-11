'use client';

/**
 * CorroborateDisputeSheet — Bottom sheet for evidence submission.
 *
 * Opens when user taps Corroborate or Dispute on a post.
 * Collects evidence type and content to submit.
 */

import { useEffect, useRef, useCallback, useState, type ReactElement } from 'react';
import type { EvidenceType } from '@cocuyo/types';
import { formatPUSDCompact } from '@cocuyo/types';
import { useCorroborateDispute } from './CorroborateDisputeProvider';
import { useAppState, type EvidenceInput } from '@/components/AppStateProvider';

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface EvidenceTypeOption {
  type: EvidenceType;
  label: string;
  description: string;
  icon: string;
}

const EVIDENCE_TYPES: EvidenceTypeOption[] = [
  {
    type: 'observation',
    label: 'Firsthand account',
    description: 'I witnessed this myself',
    icon: '👁',
  },
  {
    type: 'source_link',
    label: 'Source link',
    description: 'Link to supporting evidence',
    icon: '🔗',
  },
  {
    type: 'photo',
    label: 'Photo evidence',
    description: 'Upload an image',
    icon: '📷',
  },
  {
    type: 'document',
    label: 'Document',
    description: 'Upload a document',
    icon: '📄',
  },
];

export function CorroborateDisputeSheet(): ReactElement | null {
  const { isOpen, post, mode, campaign, closeSheet } = useCorroborateDispute();
  const { submitCorroboration } = useAppState();
  const sheetRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  // Form state
  const [evidenceType, setEvidenceType] = useState<EvidenceType>('observation');
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when sheet opens
  useEffect(() => {
    if (isOpen) {
      setEvidenceType('observation');
      setContent('');
      setDescription('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        closeSheet();
        return;
      }

      // Focus trap
      if (event.key === 'Tab' && sheetRef.current !== null) {
        const focusableElements =
          sheetRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (focusableElements.length === 0) return;

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement?.focus();
          }
        }
      }
    },
    [closeSheet]
  );

  // Handle click outside
  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>): void => {
      if (event.target === event.currentTarget) {
        closeSheet();
      }
    },
    [closeSheet]
  );

  // Setup event listeners and focus management
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';

      const firstFocusable =
        sheetRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      if (firstFocusable !== null && firstFocusable !== undefined) {
        firstFocusable.focus();
      } else {
        sheetRef.current?.focus();
      }

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';

        if (previousActiveElement.current instanceof HTMLElement) {
          previousActiveElement.current.focus();
        }
      };
    }
    return undefined;
  }, [isOpen, handleKeyDown]);

  // Handle form submission - uploads to Bulletin Chain
  const handleSubmit = useCallback(
    async (e: React.FormEvent): Promise<void> => {
      e.preventDefault();

      if (post === null || content.trim().length === 0) {
        return;
      }

      setIsSubmitting(true);

      try {
        const evidence: EvidenceInput = {
          type: evidenceType,
          content: content.trim(),
          ...(description.trim().length > 0 && { description: description.trim() }),
        };

        // Upload corroboration to Bulletin Chain
        const result = await submitCorroboration(post.id, mode, evidence);

        if (result !== null) {
          closeSheet();
        }
      } catch {
        // Silently handle errors - sheet will reset on close
      } finally {
        setIsSubmitting(false);
      }
    },
    [post, evidenceType, content, description, mode, submitCorroboration, closeSheet]
  );

  if (!isOpen || post === null) {
    return null;
  }

  const isCorroborate = mode === 'corroborate';
  const actionLabel = isCorroborate ? 'Corroborate' : 'Dispute';
  const actionColor = isCorroborate ? 'var(--fg-success)' : 'var(--fg-error)';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="corroborate-dispute-title"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-overlay backdrop-blur-sm animate-backdrop-in"
        aria-hidden="true"
      />

      {/* Sheet container - slides up on mobile, centered on desktop */}
      <div
        ref={sheetRef}
        tabIndex={-1}
        className="relative w-full sm:max-w-lg max-h-[90vh] overflow-y-auto bg-surface-nested border border-DEFAULT rounded-t-container sm:rounded-container shadow-3 animate-slide-up sm:animate-scale-in"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 sm:p-6 bg-surface-nested border-b border-DEFAULT">
          <h2
            id="corroborate-dispute-title"
            className="text-xl font-bold text-primary"
          >
            {actionLabel}
          </h2>
          <button
            type="button"
            onClick={closeSheet}
            className="p-2 text-secondary hover:text-primary transition-colors rounded-nested hover:bg-surface-hover"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={(e) => { void handleSubmit(e); }} className="p-4 sm:p-6 space-y-6">
          {/* Campaign notice */}
          {campaign !== null && (
            <div className="p-4 rounded-nested bg-[var(--color-firefly-gold)]/10 border border-[var(--color-firefly-gold)]/30">
              <p className="text-sm text-[var(--color-firefly-gold)] font-medium mb-1">
                This post is under funded investigation
              </p>
              <p className="text-sm text-secondary">
                Contributing evidence may earn you{' '}
                <span className="text-[var(--color-firefly-gold)] font-medium">
                  {formatPUSDCompact(campaign.fundingAmount)}
                </span>
              </p>
            </div>
          )}

          {/* Post preview */}
          <div className="p-4 rounded-nested bg-surface-container border border-subtle">
            <p className="text-sm text-secondary line-clamp-3">
              {post.content.text}
            </p>
            <p className="text-xs text-tertiary mt-2">
              by {post.author.pseudonym}
            </p>
          </div>

          {/* Evidence type selector */}
          <fieldset>
            <legend className="text-sm font-medium text-primary mb-3">
              What type of evidence are you providing?
            </legend>
            <div className="grid grid-cols-2 gap-3">
              {EVIDENCE_TYPES.map((option) => (
                <label
                  key={option.type}
                  className={`
                    flex flex-col p-3 rounded-nested border cursor-pointer transition-all
                    ${
                      evidenceType === option.type
                        ? 'border-[var(--fg-accent)] bg-[var(--fg-accent)]/5'
                        : 'border-DEFAULT hover:border-subtle'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="evidenceType"
                    value={option.type}
                    checked={evidenceType === option.type}
                    onChange={() => setEvidenceType(option.type)}
                    className="sr-only"
                  />
                  <span className="text-lg mb-1">{option.icon}</span>
                  <span className="text-sm font-medium text-primary">
                    {option.label}
                  </span>
                  <span className="text-xs text-tertiary">
                    {option.description}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Evidence input */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              {evidenceType === 'source_link' && 'Link URL'}
              {evidenceType === 'observation' && 'Describe what you observed'}
              {evidenceType === 'photo' && 'Photo upload'}
              {evidenceType === 'document' && 'Document upload'}
            </label>

            {evidenceType === 'source_link' && (
              <input
                type="url"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-3 rounded-nested bg-surface-container border border-DEFAULT text-primary placeholder:text-tertiary focus:outline-none focus:border-[var(--fg-accent)] transition-colors"
                required
              />
            )}

            {evidenceType === 'observation' && (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Describe what you witnessed..."
                rows={4}
                className="w-full px-4 py-3 rounded-nested bg-surface-container border border-DEFAULT text-primary placeholder:text-tertiary focus:outline-none focus:border-[var(--fg-accent)] transition-colors resize-none"
                required
              />
            )}

            {(evidenceType === 'photo' || evidenceType === 'document') && (
              <div className="flex flex-col items-center justify-center p-8 rounded-nested border-2 border-dashed border-DEFAULT text-center">
                <span className="text-3xl mb-2">
                  {evidenceType === 'photo' ? '📷' : '📄'}
                </span>
                <p className="text-sm text-secondary mb-2">
                  File upload coming soon
                </p>
                <p className="text-xs text-tertiary">
                  For now, use a link or describe your evidence
                </p>
                <input
                  type="text"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Or paste a link to the file..."
                  className="w-full mt-4 px-4 py-2 rounded-nested bg-surface-container border border-DEFAULT text-primary text-sm placeholder:text-tertiary focus:outline-none focus:border-[var(--fg-accent)] transition-colors"
                />
              </div>
            )}
          </div>

          {/* Optional description */}
          {evidenceType !== 'observation' && (
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                How does this support your {mode === 'corroborate' ? 'corroboration' : 'dispute'}?
                <span className="text-tertiary font-normal"> (optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain how this evidence relates to the post..."
                rows={2}
                className="w-full px-4 py-3 rounded-nested bg-surface-container border border-DEFAULT text-primary placeholder:text-tertiary focus:outline-none focus:border-[var(--fg-accent)] transition-colors resize-none"
              />
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={content.trim().length === 0 || isSubmitting}
            className="w-full py-3 px-6 rounded-nested font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: actionColor,
              color: 'var(--bg-primary)',
            }}
          >
            {isSubmitting ? 'Submitting...' : `Submit ${actionLabel}`}
          </button>
        </form>
      </div>
    </div>
  );
}
