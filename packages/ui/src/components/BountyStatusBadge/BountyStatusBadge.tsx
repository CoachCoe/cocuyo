'use client';

/**
 * BountyStatusBadge — Shows the status of a bounty.
 *
 * Visual indicator showing whether a bounty is open, fulfilled,
 * expired, or cancelled. Color-coded for quick scanning.
 */

import type { ReactElement } from 'react';
import type { BountyStatus } from '@cocuyo/types';

export interface BountyStatusTranslations {
  open: string;
  fulfilled: string;
  expired: string;
  cancelled: string;
}

export interface BountyStatusBadgeProps {
  /** The bounty status to display */
  status: BountyStatus;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Show label text alongside icon */
  showLabel?: boolean;
  /** Translation strings */
  translations?: BountyStatusTranslations | undefined;
}

interface BadgeConfig {
  icon: string;
  label: string;
  colorClass: string;
  bgClass: string;
}

const defaultLabels: Record<BountyStatus, string> = {
  open: 'Open',
  fulfilled: 'Fulfilled',
  expired: 'Expired',
  cancelled: 'Cancelled',
};

function getBadgeConfig(status: BountyStatus, translations?: BountyStatusTranslations): BadgeConfig {
  const label = translations?.[status] ?? defaultLabels[status];

  switch (status) {
    case 'open':
      return {
        icon: '●',
        label,
        colorClass: 'text-[var(--fg-success)]',
        bgClass: 'bg-[var(--fg-success)]/10',
      };
    case 'fulfilled':
      return {
        icon: '✓',
        label,
        colorClass: 'text-[var(--color-firefly-gold)]',
        bgClass: 'bg-[var(--color-firefly-gold)]/10',
      };
    case 'expired':
      return {
        icon: '○',
        label,
        colorClass: 'text-[var(--fg-tertiary)]',
        bgClass: 'bg-[var(--bg-surface-nested)]',
      };
    case 'cancelled':
      return {
        icon: '✕',
        label,
        colorClass: 'text-[var(--fg-error)]',
        bgClass: 'bg-[var(--fg-error)]/10',
      };
  }
}

export function BountyStatusBadge({
  status,
  size = 'sm',
  showLabel = true,
  translations,
}: BountyStatusBadgeProps): ReactElement {
  const config = getBadgeConfig(status, translations);

  const sizeClasses = size === 'sm'
    ? 'text-xs px-1.5 py-0.5'
    : 'text-sm px-2 py-1';

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full font-medium
        ${config.bgClass} ${config.colorClass} ${sizeClasses}
      `}
      title={config.label}
      aria-label={`Bounty status: ${config.label}`}
    >
      <span aria-hidden="true">{config.icon}</span>
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}
