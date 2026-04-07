'use client';

/**
 * OutletModeToggle — Toggle component for demo mode.
 *
 * Allows toggling outlet/collective mode to demo bounty creation
 * and verdict issuance without switching wallets.
 */

import type { ReactElement } from 'react';
import { useAppState } from '@/components/AppStateProvider';

export function OutletModeToggle(): ReactElement {
  const { currentUser, toggleOutletMode } = useAppState();

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-secondary">Outlet Mode</span>
      <button
        type="button"
        onClick={toggleOutletMode}
        className={`
          relative w-12 h-6 rounded-full transition-colors
          ${currentUser.isOutletAccount ? 'bg-[var(--color-firefly-gold)]' : 'bg-[var(--bg-surface-container)]'}
        `}
        role="switch"
        aria-checked={currentUser.isOutletAccount}
        aria-label="Toggle outlet mode"
      >
        <span
          className={`
            absolute top-1 w-4 h-4 rounded-full bg-white transition-transform
            ${currentUser.isOutletAccount ? 'left-7' : 'left-1'}
          `}
        />
      </button>
      {currentUser.isOutletAccount && (
        <span className="text-xs text-[var(--color-firefly-gold)] font-medium">
          Active
        </span>
      )}
    </div>
  );
}
