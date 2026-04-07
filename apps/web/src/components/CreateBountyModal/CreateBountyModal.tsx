'use client';

/**
 * CreateBountyModal — Modal for creating new bounties.
 *
 * Features:
 * - Dark overlay with blur
 * - ESC key and click-outside to close
 * - Focus trap for accessibility
 * - Responsive design
 */

import { useEffect, useRef, useCallback, type ReactElement } from 'react';
import { useTranslations } from 'next-intl';
import { useCreateBounty } from '@/hooks/useCreateBounty';
import { CreateBountyForm } from './CreateBountyForm';

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function CreateBountyModal(): ReactElement | null {
  const t = useTranslations('bounties.create');
  const { isOpen, closeModal } = useCreateBounty();
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  // Handle keyboard events (ESC and Tab for focus trap)
  const handleKeyDown = useCallback(
    (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        closeModal();
        return;
      }

      // Focus trap: handle Tab key
      if (event.key === 'Tab' && modalRef.current !== null) {
        const focusableElements =
          modalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
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
    [closeModal]
  );

  // Handle click outside
  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>): void => {
      if (event.target === event.currentTarget) {
        closeModal();
      }
    },
    [closeModal]
  );

  // Setup event listeners and focus management
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';

      const firstFocusable =
        modalRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      if (firstFocusable !== null && firstFocusable !== undefined) {
        firstFocusable.focus();
      } else {
        modalRef.current?.focus();
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

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-bounty-title"
      onClick={handleBackdropClick}
    >
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-overlay backdrop-blur-sm animate-backdrop-in"
        aria-hidden="true"
      />

      {/* Modal container */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-surface-nested border border-DEFAULT rounded-container shadow-3 animate-scale-in"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 sm:p-6 bg-surface-nested border-b border-DEFAULT">
          <h2
            id="create-bounty-title"
            className="text-xl font-bold text-primary"
          >
            {t('title')}
          </h2>
          <button
            type="button"
            onClick={closeModal}
            className="p-2 text-secondary hover:text-primary transition-colors rounded-nested hover:bg-surface-hover"
            aria-label="Close modal"
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

        {/* Form content */}
        <div className="p-4 sm:p-6">
          <CreateBountyForm />
        </div>
      </div>
    </div>
  );
}
