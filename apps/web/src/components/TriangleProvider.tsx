'use client';

/**
 * Triangle Provider component.
 * Initializes host detection on the client side for Triangle deployment.
 */

import { type ReactNode, useEffect } from 'react';
import { initHostDetection } from '@/lib/host/detect';

interface TriangleProviderProps {
  children: ReactNode;
}

export function TriangleProvider({ children }: TriangleProviderProps): ReactNode {
  useEffect(() => {
    void initHostDetection();
  }, []);

  return <>{children}</>;
}
