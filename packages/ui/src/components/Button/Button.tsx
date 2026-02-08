/**
 * Button — High-contrast button component.
 *
 * Variants:
 * - primary: White text on black, inverts on hover
 * - secondary: Outlined, transparent background
 * - illuminate: Gold accent, used ONLY for the "Illuminate" action
 *
 * The illuminate variant is special — it should feel like lighting a signal fire.
 */

import type { ButtonHTMLAttributes, ReactElement, ReactNode } from 'react';
import { FireflySymbol } from '../FireflySymbol';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button visual variant */
  variant?: 'primary' | 'secondary' | 'illuminate';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Whether the button is in a loading state */
  isLoading?: boolean;
  /** Content to render inside the button */
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps): ReactElement {
  const isDisabled = disabled === true || isLoading;

  const baseStyles = `
    inline-flex items-center justify-center gap-2
    font-medium transition-all
    focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
    disabled:cursor-not-allowed
  `;

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm rounded',
    md: 'px-4 py-2 text-sm rounded-md',
    lg: 'px-6 py-3 text-base rounded-md',
  };

  const variantStyles = {
    primary: `
      bg-transparent text-[var(--color-text-primary)] border border-[var(--color-text-primary)]
      hover:bg-[var(--color-text-primary)] hover:text-[var(--color-bg-primary)]
      focus-visible:outline-[var(--color-text-primary)]
      disabled:border-[var(--color-text-tertiary)] disabled:text-[var(--color-text-tertiary)]
      disabled:hover:bg-transparent disabled:hover:text-[var(--color-text-tertiary)]
    `,
    secondary: `
      bg-transparent text-[var(--color-text-secondary)] border border-[var(--color-border-default)]
      hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-emphasis)]
      focus-visible:outline-[var(--color-border-emphasis)]
      disabled:text-[var(--color-text-tertiary)] disabled:border-[var(--color-border-subtle)]
    `,
    illuminate: `
      bg-transparent text-[var(--color-accent)] border border-[var(--color-accent)]
      hover:bg-[var(--color-accent)] hover:text-black hover:shadow-[0_0_20px_var(--color-accent-glow)]
      active:bg-[var(--color-accent-hover)] active:shadow-[0_0_30px_rgba(232,185,49,0.25)]
      focus-visible:outline-[var(--color-accent)]
      disabled:border-[var(--color-text-tertiary)] disabled:text-[var(--color-text-tertiary)]
      disabled:hover:bg-transparent disabled:hover:text-[var(--color-text-tertiary)] disabled:hover:shadow-none
    `,
  };

  const combinedClassName = `
    ${baseStyles}
    ${sizeStyles[size]}
    ${variantStyles[variant]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <button
      className={combinedClassName}
      disabled={isDisabled}
      {...props}
    >
      {variant === 'illuminate' && !isLoading && (
        <FireflySymbol size={14} color="inherit" aria-hidden="true" />
      )}
      {isLoading ? (
        <span className="animate-pulse">Loading...</span>
      ) : (
        children
      )}
    </button>
  );
}
