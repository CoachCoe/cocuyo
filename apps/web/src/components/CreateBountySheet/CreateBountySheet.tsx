'use client';

/**
 * CreateBountySheet — Bottom sheet for funding claim fact-checking bounties.
 *
 * Opens from the Trust Drawer when user wants to fund a bounty for
 * fact-checking a specific claim.
 */

import { useEffect, useRef, useCallback, useState, type ReactElement } from 'react';
import { useCreateBounty } from './CreateBountyProvider';
import { useAppState } from '@/components/AppStateProvider';
import { usePersonhood } from '@/hooks/usePersonhood';

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const DURATION_OPTIONS = [
  { value: 7, label: '7 days' },
  { value: 14, label: '14 days' },
  { value: 30, label: '30 days' },
];

export function CreateBountySheet(): ReactElement | null {
  const { isOpen, claimId, closeSheet } = useCreateBounty();
  const { createCampaign, getClaim } = useAppState();
  const { canPerform } = usePersonhood();
  const sheetRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fundingAmount, setFundingAmount] = useState('100');
  const [duration, setDuration] = useState(14);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const claim = claimId !== null ? getClaim(claimId) : undefined;

  // Reset form when sheet opens with new claim
  useEffect(() => {
    if (isOpen && claim !== undefined) {
      // Auto-fill title from claim statement (truncated at word boundary)
      // Max title length ~100 chars, prefix is 12 chars, so truncate statement at ~88
      const MAX_STATEMENT_LENGTH = 88;
      let truncatedStatement = claim.statement;
      if (claim.statement.length > MAX_STATEMENT_LENGTH) {
        // Find last space before limit to avoid splitting words
        const lastSpace = claim.statement.lastIndexOf(' ', MAX_STATEMENT_LENGTH);
        const cutoff = lastSpace > MAX_STATEMENT_LENGTH / 2 ? lastSpace : MAX_STATEMENT_LENGTH;
        truncatedStatement = `${claim.statement.slice(0, cutoff)}...`;
      }
      setTitle(`Fact-check: ${truncatedStatement}`);
      setDescription('');
      setFundingAmount('100');
      setDuration(14);
      setIsSubmitting(false);
      setError(null);
    }
  }, [isOpen, claim]);

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

  const handleSubmit = (): void => {
    if (claimId === null || title.trim().length === 0) return;

    // Check personhood capability
    if (!canPerform('canFundBounty')) {
      setError('You need to verify your personhood to fund bounties.');
      return;
    }

    const amount = parseFloat(fundingAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid funding amount.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = createCampaign({
      title: title.trim(),
      description: description.trim(),
      topics: claim !== undefined ? [...claim.topics] : [],
      fundingAmount: amount,
      expiresInDays: duration,
      targetClaimIds: [claimId],
    });

    if (result !== null) {
      closeSheet();
    } else {
      setError('Failed to create bounty. Please try again.');
    }

    setIsSubmitting(false);
  };

  const handleBackdropClick = (e: React.MouseEvent): void => {
    if (e.target === e.currentTarget) {
      closeSheet();
    }
  };

  if (!isOpen || claimId === null) {
    return null;
  }

  return (
    <div
      className="animate-in fade-in fixed inset-0 z-50 flex items-end justify-center bg-black/60 duration-200"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-bounty-title"
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
          <h2 id="create-bounty-title" className="text-lg font-semibold text-primary">
            Fund a Bounty
          </h2>
          <p className="mt-1 text-sm text-secondary">Fund fact-checking for this claim</p>
        </div>

        {/* Claim context */}
        {claim !== undefined && (
          <div className="border-b border-[var(--border-default)] bg-[var(--bg-surface-nested)] px-6 py-4">
            <p className="mb-1 text-xs text-tertiary">Claim to fact-check:</p>
            <p className="line-clamp-3 text-sm text-secondary">{claim.statement}</p>
          </div>
        )}

        {/* Form */}
        <div className="space-y-4 px-6 py-6">
          {/* Title */}
          <div>
            <label htmlFor="bounty-title" className="mb-2 block text-sm font-medium text-primary">
              Bounty title
            </label>
            <input
              id="bounty-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for this bounty"
              className="placeholder-tertiary w-full rounded-nested border border-DEFAULT bg-surface-muted px-4 py-3 text-primary transition-colors focus:border-accent focus:outline-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="bounty-description"
              className="mb-2 block text-sm font-medium text-primary"
            >
              Description (optional)
            </label>
            <textarea
              id="bounty-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Any additional context for fact-checkers"
              rows={2}
              className="placeholder-tertiary w-full resize-none rounded-nested border border-DEFAULT bg-surface-muted px-4 py-3 text-primary transition-colors focus:border-accent focus:outline-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Funding Amount */}
          <div>
            <label htmlFor="bounty-amount" className="mb-2 block text-sm font-medium text-primary">
              Funding amount (USD)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary">$</span>
              <input
                id="bounty-amount"
                type="number"
                min="1"
                step="1"
                value={fundingAmount}
                onChange={(e) => setFundingAmount(e.target.value)}
                className="placeholder-tertiary w-full rounded-nested border border-DEFAULT bg-surface-muted py-3 pl-8 pr-4 text-primary transition-colors focus:border-accent focus:outline-none"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label
              htmlFor="bounty-duration"
              className="mb-2 block text-sm font-medium text-primary"
            >
              Duration
            </label>
            <select
              id="bounty-duration"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value, 10))}
              className="w-full rounded-nested border border-DEFAULT bg-surface-muted px-4 py-3 text-primary transition-colors focus:border-accent focus:outline-none"
              disabled={isSubmitting}
            >
              {DURATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Error message */}
          {error !== null && <p className="text-sm text-[var(--fg-error)]">{error}</p>}
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
            onClick={handleSubmit}
            disabled={title.trim().length === 0 || isSubmitting}
            className="flex-1 rounded-nested bg-[var(--fg-accent)] px-4 py-3 text-sm font-medium text-[var(--bg-primary)] transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Fund Bounty'}
          </button>
        </div>
      </div>
    </div>
  );
}
