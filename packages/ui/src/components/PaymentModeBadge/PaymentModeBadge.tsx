'use client';

/**
 * PaymentModeBadge — Shows the payment mode for a bounty payout.
 *
 * Visual indicator showing whether payment is public (pUSD) or
 * private (Coinage). Shield icon for private payments.
 */

import type { ReactElement } from 'react';
import type { PaymentMode } from '@cocuyo/types';

export interface PaymentModeBadgeProps {
  /** The payment mode to display */
  mode: PaymentMode;
  /** Size variant */
  size?: 'sm' | 'md';
}

interface BadgeConfig {
  icon: string;
  label: string;
  colorClass: string;
  bgClass: string;
}

function getBadgeConfig(mode: PaymentMode): BadgeConfig {
  switch (mode) {
    case 'public':
      return {
        icon: '$',
        label: 'Public pUSD',
        colorClass: 'text-[var(--fg-secondary)]',
        bgClass: 'bg-[var(--bg-surface-nested)]',
      };
    case 'private':
      return {
        icon: '⛨',
        label: 'Private',
        colorClass: 'text-[var(--fg-info)]',
        bgClass: 'bg-[var(--fg-info)]/10',
      };
  }
}

export function PaymentModeBadge({
  mode,
  size = 'sm',
}: PaymentModeBadgeProps): ReactElement {
  const config = getBadgeConfig(mode);

  const sizeClasses = size === 'sm'
    ? 'text-xs px-1.5 py-0.5'
    : 'text-sm px-2 py-1';

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full font-medium
        ${config.bgClass} ${config.colorClass} ${sizeClasses}
      `}
      title={mode === 'private' ? 'Payment via private Coinage' : 'Payment via public pUSD'}
      aria-label={`Payment mode: ${config.label}`}
    >
      <span aria-hidden="true">{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}
