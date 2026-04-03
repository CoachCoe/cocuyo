'use client';

/**
 * External Link component - hidden when running in Triangle host.
 *
 * External links should not be shown in the host environment as they
 * would navigate away from the contained app experience.
 */

import type { ReactElement, ReactNode } from 'react';
import { useSigner } from '@/hooks';

interface ExternalLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

/**
 * Renders an external link only when NOT in host mode.
 * Returns null when running inside Triangle container.
 */
export function ExternalLink({
  href,
  children,
  className,
}: ExternalLinkProps): ReactElement | null {
  const { isInHost } = useSigner();

  // Don't render external links in host environment
  if (isInHost) {
    return null;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  );
}

interface ExternalLinkSectionProps {
  children: ReactNode;
}

/**
 * Wrapper for sections containing external links.
 * Hides the entire section when in host mode.
 */
export function ExternalLinkSection({
  children,
}: ExternalLinkSectionProps): ReactElement | null {
  const { isInHost } = useSigner();

  if (isInHost) {
    return null;
  }

  return <>{children}</>;
}
