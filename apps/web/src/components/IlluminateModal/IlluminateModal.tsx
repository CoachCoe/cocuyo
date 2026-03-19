'use client';

/**
 * IlluminateModal — The universal signal creation modal.
 *
 * Features:
 * - Dark overlay with blur
 * - ESC key and click-outside to close
 * - Focus trap for accessibility
 * - Responsive design
 */

import {
  useEffect,
  useRef,
  useCallback,
  type ReactElement,
} from 'react';
import { useIlluminate } from '@/hooks/useIlluminate';
import { IlluminateForm } from './IlluminateForm';

export function IlluminateModal(): ReactElement | null {
  const { isOpen, closeModal } = useIlluminate();
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  // Handle ESC key
  const handleKeyDown = useCallback(
    (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        closeModal();
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
      // Store current active element for restoration
      previousActiveElement.current = document.activeElement;

      // Add ESC key listener
      document.addEventListener('keydown', handleKeyDown);

      // Prevent body scroll
      document.body.style.overflow = 'hidden';

      // Focus the modal
      modalRef.current?.focus();

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';

        // Restore focus
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
      aria-labelledby="illuminate-title"
      onClick={handleBackdropClick}
    >
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-overlay backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Modal container */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-surface-nested border border-DEFAULT rounded-container shadow-3"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-surface-nested border-b border-DEFAULT">
          <h2
            id="illuminate-title"
            className="text-xl font-bold text-primary"
          >
            Illuminate
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
        <div className="p-6">
          <IlluminateForm />
        </div>
      </div>
    </div>
  );
}
