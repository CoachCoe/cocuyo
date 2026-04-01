/**
 * ExploreView — Client component for the explore page.
 *
 * Currently shows list view only. Map view is disabled until
 * the host API supports it.
 */

import type { ReactElement, ReactNode } from 'react';

interface ExploreViewProps {
  children: ReactNode;
}

export function ExploreView({ children }: ExploreViewProps): ReactElement {
  // Map view disabled for now - host API doesn't support it yet
  return <>{children}</>;
}
