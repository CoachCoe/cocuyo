'use client';

/**
 * ManualLocationInput — Text-based location input.
 *
 * Fallback component for when the map isn't available
 * (e.g., inside Triangle without network permission).
 */

import { useState, type ReactNode } from 'react';

interface ManualLocationInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  helpText?: string | undefined;
  disabled?: boolean;
}

export function ManualLocationInput({
  value,
  onChange,
  placeholder = 'City, region, or general area',
  label = 'Location',
  helpText,
  disabled = false,
}: ManualLocationInputProps): ReactNode {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-[var(--fg-primary)]">
          {label}
        </label>
      )}

      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fg-tertiary)]">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full pl-10 pr-4 py-3
            bg-[var(--bg-surface-muted)] border rounded-nested
            text-[var(--fg-primary)] placeholder:text-[var(--fg-tertiary)]
            focus:outline-none transition-colors
            ${isFocused ? 'border-[var(--color-firefly-gold)]' : 'border-[var(--border-default)]'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        />
      </div>

      {helpText !== undefined && helpText.length > 0 && (
        <p className="text-xs text-[var(--fg-tertiary)]">{helpText}</p>
      )}
    </div>
  );
}
