/**
 * Mock data for development.
 *
 * This module provides accessor functions for seeded data.
 * Data is populated by running `pnpm seed:dev`.
 * Use the service abstractions to access this data in components.
 */

import type {
  Signal, StoryChain, ChainPreview, FireflyAuthor, Collective, CollectivePreview, VerificationRequest,
} from '@cocuyo/types';
import {
  getSignals as getSeededSignals,
  getChains as getSeededChains,
  getCollectives as getSeededCollectives,
  getVerificationRequests as getSeededVerificationRequests,
  getAllSignalIds as getSeededSignalIds,
  getAllChainIds as getSeededChainIds,
  getAllCollectiveIds as getSeededCollectiveIds,
  type Locale,
} from './seed-store';

export type { Locale } from './seed-store';

/**
 * Attribution for Efecto Cocuyo inspiration (when data is seeded).
 */
export const ATTRIBUTION = {
  en: 'Stories inspired by Efecto Cocuyo (efectococuyo.com)',
  es: 'Historias inspiradas en Efecto Cocuyo (efectococuyo.com)',
} as const;

/**
 * Get signals for a given locale.
 */
export function getSignals(locale: Locale = 'en'): Signal[] {
  return getSeededSignals(locale);
}

/**
 * Get chains for a given locale.
 */
export function getChains(locale: Locale = 'en'): StoryChain[] {
  return getSeededChains(locale);
}

/**
 * Get chain previews for listing.
 */
export function getChainPreviews(locale: Locale = 'en'): ChainPreview[] {
  return getChains(locale).map((chain) => ({
    id: chain.id,
    title: chain.title,
    topics: chain.topics,
    ...(chain.location != null && { location: chain.location }),
    status: chain.status,
    signalCount: chain.stats.signalCount,
    totalCorroborations: chain.stats.totalCorroborations,
    updatedAt: chain.updatedAt,
  }));
}

/**
 * Get signals by chain ID.
 */
export function getSignalsByChainId(chainId: string, locale: Locale = 'en'): Signal[] {
  return getSignals(locale).filter((signal) =>
    signal.chainLinks.some((link) => link === chainId)
  );
}

/**
 * Get chain by ID.
 */
export function getChainById(chainId: string, locale: Locale = 'en'): StoryChain | undefined {
  return getChains(locale).find((c) => c.id === chainId);
}

/**
 * Get chain title by ID.
 */
export function getChainTitle(chainId: string, locale: Locale = 'en'): string | undefined {
  const chain = getChainById(chainId, locale);
  return chain?.title;
}

/**
 * Get a signal by ID.
 */
export function getSignalById(signalId: string, locale: Locale = 'en'): Signal | undefined {
  return getSignals(locale).find((s) => s.id === signalId);
}

/**
 * Get all signal IDs for static generation.
 */
export function getAllSignalIds(): string[] {
  return getSeededSignalIds();
}

/**
 * Get all chain IDs for static generation.
 */
export function getAllChainIds(): string[] {
  return getSeededChainIds();
}

// ============================================================
// Legacy exports for backward compatibility during migration
// ============================================================

/** @deprecated Use getSignals(locale) instead */
export const mockSignals: Signal[] = [];

/** @deprecated Use getChains(locale) instead */
export const mockChains: StoryChain[] = [];

// ============================================================
// Collectives (from seed store)
// ============================================================

/**
 * Mock collectives for fact-checking.
 */
export const mockCollectives: Collective[] = getSeededCollectives();

/**
 * Get collective previews for listing.
 */
export function getCollectivePreviews(): CollectivePreview[] {
  return getSeededCollectives().map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    topics: c.topics,
    memberCount: c.members.length,
    reputation: c.reputation.score,
    verificationsCompleted: c.reputation.verificationsCompleted,
  }));
}

/**
 * Get collective by ID.
 */
export function getCollectiveById(id: string): Collective | undefined {
  return getSeededCollectives().find((c) => c.id === id);
}

/**
 * Get all collective IDs for static generation.
 */
export function getAllCollectiveIds(): string[] {
  return getSeededCollectiveIds();
}

/**
 * Mock verification requests.
 */
export const mockVerificationRequests: VerificationRequest[] = getSeededVerificationRequests();

/**
 * Get verification requests for a collective.
 */
export function getVerificationsByCollective(collectiveId: string): VerificationRequest[] {
  return getSeededVerificationRequests().filter((v) => v.collectiveId === collectiveId);
}

/**
 * Get verification request by signal ID.
 */
export function getVerificationBySignalId(signalId: string): VerificationRequest | undefined {
  return getSeededVerificationRequests().find((v) => v.signalId === signalId);
}

/**
 * Get all pending/in-review verification requests.
 */
export function getPendingVerifications(): VerificationRequest[] {
  return getSeededVerificationRequests().filter((v) => v.status !== 'completed');
}

/**
 * Get author by ID (extracted from signals).
 */
export function getAuthorById(authorId: string, locale: Locale = 'en'): FireflyAuthor | undefined {
  const signal = getSignals(locale).find((s) => s.author.id === authorId);
  return signal?.author;
}

/**
 * Get signals by author ID.
 */
export function getSignalsByAuthor(authorId: string, locale: Locale = 'en'): Signal[] {
  return getSignals(locale).filter((s) => s.author.id === authorId);
}
