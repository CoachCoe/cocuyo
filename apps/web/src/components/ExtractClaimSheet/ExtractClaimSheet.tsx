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
        const firstFocusable = sheetRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
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
      className="animate-in fade-in fixed inset-0 z-50 flex items-end justify-center bg-black/60 duration-200"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="extract-claim-title"
    >
      <div
        ref={sheetRef}
        className="animate-in slide-in-from-bottom w-full max-w-lg rounded-t-2xl bg-[var(--bg-surface-main)] duration-300"
      >
        {/* Handle */}
        <div className="flex justify-center pb-2 pt-3">
          <div className="h-1 w-12 rounded-full bg-[var(--border-default)]" />
        </div>

        {/* Header */}
        <div className="border-b border-[var(--border-default)] px-6 pb-4">
          <h2 id="extract-claim-title" className="text-lg font-semibold text-primary">
            Extract a Claim
          </h2>
          <p className="mt-1 text-sm text-secondary">
            Identify a specific, verifiable statement from this post
          </p>
        </div>

        {/* Post context */}
        {post !== undefined && (
          <div className="border-b border-[var(--border-default)] bg-[var(--bg-surface-nested)] px-6 py-4">
            <p className="line-clamp-3 text-sm text-secondary">{post.content.text}</p>
          </div>
        )}

        {/* Form */}
        <div className="px-6 py-6">
          <label htmlFor="claim-statement" className="mb-2 block text-sm font-medium text-primary">
            Claim statement
          </label>
          <textarea
            id="claim-statement"
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            placeholder="Enter a specific, verifiable statement (e.g., 'Hospital X reported 50% medication shortage on March 15')"
            rows={3}
            className="placeholder-tertiary w-full resize-none rounded-nested border border-DEFAULT bg-surface-muted px-4 py-3 text-primary transition-colors focus:border-accent focus:outline-none"
            disabled={isSubmitting}
          />
          <p className="mt-2 text-xs text-tertiary">
            Good claims are specific, time-bound, and can be verified with evidence.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-8">
          <button
            type="button"
            onClick={closeSheet}
            className="flex-1 rounded-nested border border-[var(--border-default)] px-4 py-3 text-sm font-medium text-secondary transition-colors hover:bg-[var(--bg-surface-nested)]"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              void handleSubmit();
            }}
            disabled={statement.trim().length === 0 || isSubmitting}
            className="flex-1 rounded-nested bg-[var(--fg-accent)] px-4 py-3 text-sm font-medium text-[var(--bg-primary)] transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Extracting...' : 'Extract Claim'}
          </button>
        </div>
      </div>
    </div>
  );
}
