/**
 * Navbar — Fixed top navigation for the Firefly Network.
 *
 * Features:
 * - Wordmark with firefly symbol
 * - Navigation links (Explore, Bounties, About)
 * - Illuminate CTA button (the only gold element)
 * - Mobile hamburger menu
 *
 * There are NO user avatars or profiles — fireflies are anonymous.
 */

'use client';

import type { ReactElement, ReactNode } from 'react';
import { useState } from 'react';
import { FireflySymbol } from '../FireflySymbol';
import { Button } from '../Button';

export interface NavbarProps {
  /** Current active path for highlighting */
  currentPath?: string;
  /** Callback when Illuminate is clicked */
  onIlluminate?: () => void;
  /** Optional slot for wallet connect button */
  walletSlot?: ReactNode;
  /** Optional slot for additional actions (e.g., theme toggle) */
  actionsSlot?: ReactNode;
}

interface NavLink {
  href: string;
  label: string;
}

const navLinks: NavLink[] = [
  { href: '/feed', label: 'Feed' },
  { href: '/explore', label: 'Explore' },
  { href: '/collectives', label: 'Collectives' },
  { href: '/verify', label: 'Verify' },
  { href: '/search', label: 'Search' },
];

export function Navbar({
  currentPath = '/',
  onIlluminate,
  walletSlot,
  actionsSlot,
}: NavbarProps): ReactElement {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = (): void => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const isActive = (href: string): boolean => {
    if (href === '/') return currentPath === '/';
    return currentPath.startsWith(href);
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-16 bg-[var(--bg-surface-main)] border-b border-[var(--border-default)]"
      role="banner"
    >
      <nav
        className="container-wide h-full flex items-center justify-between"
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Wordmark */}
        <a
          href="/"
          className="flex items-center gap-2 text-[var(--fg-primary)] hover:text-[var(--fg-primary)]"
          aria-label="Firefly Network home"
        >
          <FireflySymbol size={20} color="gold" />
          <span className="font-semibold text-lg tracking-tight">
            FIREFLY NETWORK
          </span>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <ul className="flex items-center gap-6">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={`
                    font-medium text-sm transition-colors relative
                    ${
                      isActive(link.href)
                        ? 'text-[var(--fg-primary)]'
                        : 'text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]'
                    }
                  `}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <span
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[var(--fg-accent)]"
                      aria-hidden="true"
                    />
                  )}
                </a>
              </li>
            ))}
          </ul>

          {walletSlot != null && (
            <div className="border-l border-[var(--border-default)] pl-6">
              {walletSlot}
            </div>
          )}

          {actionsSlot != null && (
            <div className="flex items-center gap-2">
              {actionsSlot}
            </div>
          )}

          <Button variant="illuminate" size="sm" onClick={onIlluminate}>
            Illuminate
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="md:hidden p-2 text-[var(--fg-primary)]"
          onClick={toggleMobileMenu}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden fixed inset-0 top-16 bg-[var(--bg-surface-main)] border-t border-[var(--border-default)] z-40"
        >
          <div className="container-wide py-6">
            <ul className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={`
                      block py-2 font-medium text-lg
                      ${
                        isActive(link.href)
                          ? 'text-[var(--fg-primary)]'
                          : 'text-[var(--fg-secondary)]'
                      }
                    `}
                    aria-current={isActive(link.href) ? 'page' : undefined}
                    onClick={() => { setIsMobileMenuOpen(false); }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            {walletSlot != null && (
              <div className="mt-6 pt-6 border-t border-[var(--border-default)]">
                {walletSlot}
              </div>
            )}
            {actionsSlot != null && (
              <div className="mt-4 flex items-center gap-2">
                {actionsSlot}
              </div>
            )}
            <div className="mt-6">
              <Button
                variant="illuminate"
                size="lg"
                className="w-full"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onIlluminate?.();
                }}
              >
                Illuminate
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
