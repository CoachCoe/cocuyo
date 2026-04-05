/**
 * Route parameter guards for branded types.
 *
 * These functions perform basic guards (non-empty string checks) before
 * branding route parameters. They do NOT validate ID format - that
 * validation happens at the service layer which returns null for
 * non-existent entities.
 *
 * Purpose: Avoid unsafe type assertions (`as`) in route handlers by
 * providing a consistent guard pattern that rejects obviously invalid
 * inputs (empty strings, non-strings) before service calls.
 */

import {
  createSignalId,
  createChainId,
  createBountyId,
  createPostId,
  createClaimId,
  type SignalId,
  type ChainId,
  type BountyId,
  type PostId,
  type ClaimId,
} from '@cocuyo/types';

/**
 * Guard and brand a route parameter as SignalId.
 * Returns null for empty/non-string inputs. Service layer validates existence.
 */
export function validateSignalId(id: unknown): SignalId | null {
  if (typeof id !== 'string' || id.length === 0) {
    return null;
  }
  return createSignalId(id);
}

/**
 * Guard and brand a route parameter as ChainId.
 * Returns null for empty/non-string inputs. Service layer validates existence.
 */
export function validateChainId(id: unknown): ChainId | null {
  if (typeof id !== 'string' || id.length === 0) {
    return null;
  }
  return createChainId(id);
}

/**
 * Guard and brand a route parameter as BountyId.
 * Returns null for empty/non-string inputs. Service layer validates existence.
 */
export function validateBountyId(id: unknown): BountyId | null {
  if (typeof id !== 'string' || id.length === 0) {
    return null;
  }
  return createBountyId(id);
}

/**
 * Guard and brand a route parameter as PostId.
 * Returns null for empty/non-string inputs. Service layer validates existence.
 */
export function validatePostId(id: unknown): PostId | null {
  if (typeof id !== 'string' || id.length === 0) {
    return null;
  }
  return createPostId(id);
}

/**
 * Guard and brand a route parameter as ClaimId.
 * Returns null for empty/non-string inputs. Service layer validates existence.
 */
export function validateClaimId(id: unknown): ClaimId | null {
  if (typeof id !== 'string' || id.length === 0) {
    return null;
  }
  return createClaimId(id);
}

/**
 * Validate locale parameter.
 * Returns the locale if valid, or 'en' as default.
 */
export function validateLocale(locale: unknown): 'en' | 'es' {
  if (locale === 'en' || locale === 'es') {
    return locale;
  }
  return 'en';
}
