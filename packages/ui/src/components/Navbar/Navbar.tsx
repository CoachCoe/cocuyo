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

import type { ReactElement, ReactNode, ComponentType } from 'react';
import { useState } from 'react';
import { FireflySymbol } from '../FireflySymbol';
import { Button } from '../Button';

/** Props for the link component - compatible with Next.js Link */
export interface NavLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
  'aria-label'?: string;
  'aria-current'?: 'page' | undefined;
  onClick?: () => void;
}

/** Default link component using plain anchor tags */
function DefaultLink({ href, className, children, onClick, ...props }: NavLinkProps): ReactElement {
  return (
    <a href={href} className={className} onClick={onClick} {...props}>
      {children}
    </a>
  );
}

export interface NavLink {
  href: string;
  label: string;
}

export interface NavbarProps {
  /** Current active path for highlighting */
  currentPath?: string;
  /** Callback when Illuminate is clicked */
  onIlluminate?: () => void;
  /** Optional slot for wallet connect button */
  walletSlot?: ReactNode;
  /** Optional slot for additional actions (e.g., theme toggle) */
  actionsSlot?: ReactNode;
  /** Custom Link component (e.g., Next.js Link) for client-side navigation */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  LinkComponent?: ComponentType<any>;
  /** Navigation links with translated labels */
  navLinks?: NavLink[];
  /** Translated label for Illuminate button */
  illuminateLabel?: string;
  /** Translated label for home link */
  homeLabel?: string;
  /** Home link href (for locale prefix) */
  homeHref?: string;
  /** Brand name displayed in navbar */
  brandName?: string;
  /** Development stage badge (e.g., "ALPHA", "BETA") */
  stageBadge?: string;
}

const defaultNavLinks: NavLink[] = [
  { href: '/explore', label: 'Signals' },
  { href: '/verify', label: 'Verify' },
  { href: '/about', label: 'About' },
];

export function Navbar({
  currentPath = '/',
  onIlluminate,
  walletSlot,
  actionsSlot,
  LinkComponent = DefaultLink,
  navLinks = defaultNavLinks,
  illuminateLabel = 'Illuminate',
  homeLabel = 'Firefly Network home',
  homeHref = '/',
  brandName = 'FIREFLY NETWORK',
  stageBadge,
}: NavbarProps): ReactElement {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const Link = LinkComponent;

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
        <Link
          href={homeHref}
          className="flex items-center gap-2 text-[var(--fg-primary)] hover:text-[var(--fg-primary)]"
          aria-label={homeLabel}
        >
          <FireflySymbol size={20} color="gold" />
          <span className="font-semibold text-lg tracking-tight">
            {brandName}
          </span>
          {stageBadge != null && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium tracking-wide border border-[var(--border-emphasis)] rounded text-[var(--fg-secondary)]">
              {stageBadge}
            </span>
          )}
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {/* Navigation links */}
          <ul className="flex items-center gap-6">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
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
                </Link>
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
                  <Link
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
                  </Link>
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
                {illuminateLabel}
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
