/**
 * Mock data for posts and claims.
 *
 * This module provides accessor functions for seeded data.
 * Data is populated by running `pnpm seed:dev`.
 * Use the service abstractions to access this data in components.
 */

import type {
  Post,
  PostPreview,
  Claim,
  ClaimPreview,
  ClaimStatus,
} from '@cocuyo/types';
import {
  getPosts as getSeededPosts,
  getClaims as getSeededClaims,
  getAllPostIds as getSeededPostIds,
  getAllClaimIds as getSeededClaimIds,
  type Locale,
} from './seed-store';

export type { Locale } from './seed-store';

/**
 * Get posts for a given locale.
 */
export function getPosts(locale: Locale = 'en'): Post[] {
  return getSeededPosts(locale);
}

/**
 * Get post previews for listing.
 */
export function getPostPreviews(locale: Locale = 'en'): PostPreview[] {
  return getPosts(locale).map((post) => ({
    id: post.id,
    title: post.content.title,
    excerpt: post.content.text.slice(0, 200) + '...',
    topics: post.context.topics,
    ...(post.context.locationName !== undefined && { locationName: post.context.locationName }),
    status: post.status,
    claimCount: post.extractedClaimIds.length,
    signalCount: post.relatedSignalIds.length,
    createdAt: post.createdAt,
  }));
}

/**
 * Get a post by ID.
 */
export function getPostById(postId: string, locale: Locale = 'en'): Post | undefined {
  return getPosts(locale).find((p) => p.id === postId);
}

/**
 * Get claims for a given locale.
 */
export function getClaims(locale: Locale = 'en'): Claim[] {
  return getSeededClaims(locale);
}

/**
 * Get claim previews for listing.
 */
export function getClaimPreviews(locale: Locale = 'en'): ClaimPreview[] {
  return getClaims(locale).map((claim) => ({
    id: claim.id,
    statement: claim.statement,
    sourcePostId: claim.sourcePostId,
    status: claim.status,
    topics: claim.topics,
    evidenceCount: claim.evidence.length,
    supportingCount: claim.evidence.filter((e) => e.supports).length,
    contradictingCount: claim.evidence.filter((e) => !e.supports).length,
    createdAt: claim.createdAt,
  }));
}

/**
 * Get a claim by ID.
 */
export function getClaimById(claimId: string, locale: Locale = 'en'): Claim | undefined {
  return getClaims(locale).find((c) => c.id === claimId);
}

/**
 * Get claims by post ID.
 */
export function getClaimsByPostId(postId: string, locale: Locale = 'en'): Claim[] {
  return getClaims(locale).filter((c) => c.sourcePostId === postId);
}

/**
 * Get claims by status.
 */
export function getClaimsByStatus(status: ClaimStatus, locale: Locale = 'en'): Claim[] {
  return getClaims(locale).filter((c) => c.status === status);
}

/**
 * Get pending claims for workbench.
 */
export function getPendingClaims(locale: Locale = 'en'): Claim[] {
  return getClaims(locale).filter((c) =>
    c.status === 'pending' || c.status === 'under_review'
  );
}

/**
 * Get all post IDs for static generation.
 */
export function getAllPostIds(): string[] {
  return getSeededPostIds();
}

/**
 * Get all claim IDs for static generation.
 */
export function getAllClaimIds(): string[] {
  return getSeededClaimIds();
}
