'use client';

/**
 * ExtractClaimSheet — Bottom sheet for extracting claims from posts.
 *
 * Opens from the Trust Drawer when user wants to extract a verifiable
 * claim from a post. Collects the claim statement text.
 */

import { useEffect, useRef, useCallback, useState, type ReactElement } from 'react';
import { useExtractClaim } from './ExtractClaimProvider';
import { useAppState } from '@/components/AppStateProvider';

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function ExtractClaimSheet(): ReactElement | null {
  const { isOpen, postId, closeSheet } = useExtractClaim();
  const { extractClaim, getPost } = useAppState();
  const sheetRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  // Form state
  const [statement, setStatement] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const post = postId !== null ? getPost(postId) : undefined;

  // Reset form when sheet opens
  useEffect(() => {
    if (isOpen) {
      setStatement('');
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

  // Focus management and keyboard listeners
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      document.addEventListener('keydown', handleKeyDown);

      // Focus first focusable element
      requestAnimationFrame(() => {
        const firstFocusable =
          sheetRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
        firstFocusable?.focus();
      });

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
    // Restore focus when closing
    if (previousActiveElement.current instanceof HTMLElement) {
      previousActiveElement.current.focus();
    }
    return undefined;
  }, [isOpen, handleKeyDown]);

  const handleSubmit = async (): Promise<void> => {
    if (postId === null || statement.trim().length === 0) return;

    setIsSubmitting(true);

    try {
      // Upload claim to Bulletin Chain
      const result = await extractClaim(postId, statement.trim());

      if (result !== null) {
        closeSheet();
      }
    } catch {
      // Silently handle errors - sheet will reset on close
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent): void => {
    if (e.target === e.currentTarget) {
      closeSheet();
    }
  };

  if (!isOpen || postId === null) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 animate-in fade-in duration-200"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="extract-claim-title"
    >
      <div
        ref={sheetRef}
        className="w-full max-w-lg bg-[var(--bg-surface-main)] rounded-t-2xl animate-in slide-in-from-bottom duration-300"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 rounded-full bg-[var(--border-default)]" />
        </div>

        {/* Header */}
        <div className="px-6 pb-4 border-b border-[var(--border-default)]">
          <h2 id="extract-claim-title" className="text-lg font-semibold text-primary">
            Extract a Claim
          </h2>
          <p className="text-sm text-secondary mt-1">
            Identify a specific, verifiable statement from this post
          </p>
        </div>

        {/* Post context */}
        {post !== undefined && (
          <div className="px-6 py-4 bg-[var(--bg-surface-nested)] border-b border-[var(--border-default)]">
            <p className="text-sm text-secondary line-clamp-3">
              {post.content.text}
            </p>
          </div>
        )}

        {/* Form */}
        <div className="px-6 py-6">
          <label htmlFor="claim-statement" className="block text-sm font-medium text-primary mb-2">
            Claim statement
          </label>
          <textarea
            id="claim-statement"
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            placeholder="Enter a specific, verifiable statement (e.g., 'Hospital X reported 50% medication shortage on March 15')"
            rows={3}
            className="w-full px-4 py-3 bg-surface-muted border border-DEFAULT rounded-nested text-primary placeholder-tertiary focus:outline-none focus:border-accent transition-colors resize-none"
            disabled={isSubmitting}
          />
          <p className="mt-2 text-xs text-tertiary">
            Good claims are specific, time-bound, and can be verified with evidence.
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 pb-8 flex gap-3">
          <button
            type="button"
            onClick={closeSheet}
            className="flex-1 py-3 px-4 rounded-nested text-sm font-medium text-secondary border border-[var(--border-default)] hover:bg-[var(--bg-surface-nested)] transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => { void handleSubmit(); }}
            disabled={statement.trim().length === 0 || isSubmitting}
            className="flex-1 py-3 px-4 rounded-nested text-sm font-medium bg-[var(--fg-accent)] text-[var(--bg-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {isSubmitting ? 'Extracting...' : 'Extract Claim'}
          </button>
        </div>
      </div>
    </div>
  );
}
