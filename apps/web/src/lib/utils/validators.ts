/**
 * Validation utilities for route parameters and branded types.
 *
 * These functions validate and narrow unknown inputs to branded types,
 * avoiding unsafe type assertions (`as`) throughout the codebase.
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
 * Validate and convert a route parameter to SignalId.
 * Returns null if the input is not a valid signal ID format.
 */
export function validateSignalId(id: unknown): SignalId | null {
  if (typeof id !== 'string' || id.length === 0) {
    return null;
  }
  // Accept any non-empty string as a signal ID
  // The service layer will handle not-found cases
  return createSignalId(id);
}

/**
 * Validate and convert a route parameter to ChainId.
 * Returns null if the input is not a valid chain ID format.
 */
export function validateChainId(id: unknown): ChainId | null {
  if (typeof id !== 'string' || id.length === 0) {
    return null;
  }
  return createChainId(id);
}

/**
 * Validate and convert a route parameter to BountyId.
 * Returns null if the input is not a valid bounty ID format.
 */
export function validateBountyId(id: unknown): BountyId | null {
  if (typeof id !== 'string' || id.length === 0) {
    return null;
  }
  return createBountyId(id);
}

/**
 * Validate and convert a route parameter to PostId.
 * Returns null if the input is not a valid post ID format.
 */
export function validatePostId(id: unknown): PostId | null {
  if (typeof id !== 'string' || id.length === 0) {
    return null;
  }
  return createPostId(id);
}

/**
 * Validate and convert a route parameter to ClaimId.
 * Returns null if the input is not a valid claim ID format.
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
