/**
 * Toast — Non-blocking notification component.
 *
 * Displays temporary messages that auto-dismiss.
 * Supports success, error, warning, and info variants.
 */

'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactElement,
  type ReactNode,
} from 'react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  toasts: ToastData[];
  addToast: (message: string, variant?: ToastVariant, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const variantStyles: Record<ToastVariant, { bg: string; icon: string }> = {
  success: {
    bg: 'bg-[var(--bg-success)]',
    icon: '✓',
  },
  error: {
    bg: 'bg-[var(--bg-error)]',
    icon: '✕',
  },
  warning: {
    bg: 'bg-[#92400e]',
    icon: '!',
  },
  info: {
    bg: 'bg-[var(--bg-surface-container)]',
    icon: 'ℹ',
  },
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastData;
  onDismiss: () => void;
}): ReactElement {
  const styles = variantStyles[toast.variant];

  useEffect(() => {
    const timer = setTimeout(onDismiss, toast.duration ?? 4000);
    return () => clearTimeout(timer);
  }, [onDismiss, toast.duration]);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-nested shadow-2 animate-slide-up ${styles.bg}`}
      role="status"
      aria-live="polite"
    >
      <span className="text-[var(--fg-primary)] font-medium" aria-hidden="true">
        {styles.icon}
      </span>
      <p className="text-sm text-[var(--fg-primary)] flex-1">{toast.message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] transition-colors p-1"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps): ReactElement {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback(
    (message: string, variant: ToastVariant = 'info', duration?: number) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const toast: ToastData =
        duration !== undefined
          ? { id, message, variant, duration }
          : { id, message, variant };
      setToasts((prev) => [...prev, toast]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      {/* Toast container */}
      <div
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-[var(--z-toast)] flex flex-col gap-2 max-w-sm sm:w-full mx-auto sm:mx-0 pointer-events-none"
        aria-label="Notifications"
      >
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onDismiss={() => removeToast(toast.id)} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (context === null) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
