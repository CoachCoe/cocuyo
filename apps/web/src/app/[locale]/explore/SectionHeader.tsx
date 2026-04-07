'use client';

/**
 * SectionHeader — Reusable section header with info popover.
 *
 * Combines section title with an optional info icon that opens
 * an educational popover explaining the concept.
 */

import type { ReactElement, ReactNode } from 'react';
import { InfoPopover } from '@cocuyo/ui';

export interface SectionHeaderProps {
  /** Section title text */
  title: string;
  /** Title for the info popover */
  infoTitle?: string | undefined;
  /** Body content for the info popover */
  infoBody?: ReactNode | undefined;
  /** Additional CSS classes */
  className?: string | undefined;
}

export function SectionHeader({
  title,
  infoTitle,
  infoBody,
  className,
}: SectionHeaderProps): ReactElement {
  const showInfo = infoTitle !== undefined && infoBody !== undefined;

  return (
    <div className={`flex items-center gap-2 ${className ?? 'mb-4'}`}>
      <h2 className="text-sm font-semibold text-secondary uppercase tracking-wide">
        {title}
      </h2>
      {showInfo && (
        <InfoPopover title={infoTitle} position="bottom">
          {infoBody}
        </InfoPopover>
      )}
    </div>
  );
}
