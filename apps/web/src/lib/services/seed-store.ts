/**
 * Seed Store — Runtime storage for seeded mock data.
 *
 * This store holds data populated by the seed function.
 * Mock services read from this store, which starts empty by default.
 *
 * To enable seed data:
 * - Set NEXT_PUBLIC_SEED_DATA=true in your .env.local file
 * - This will auto-populate seed data on first access
 */

import type {
  Signal,
  StoryChain,
  Collective,
  VerificationRequest,
  Bounty,
  Post,
  Claim,
} from '@cocuyo/types';

export type Locale = 'en' | 'es';

interface LocalizedSignalData {
  id: string;
  data: Record<Locale, Signal>;
}

interface LocalizedChainData {
  id: string;
  data: Record<Locale, StoryChain>;
}

interface LocalizedBountyData {
  id: string;
  data: Record<Locale, Bounty>;
}

interface LocalizedPostData {
  id: string;
  data: Record<Locale, Post>;
}

interface LocalizedClaimData {
  id: string;
  data: Record<Locale, Claim>;
}

interface SeedStore {
  signals: LocalizedSignalData[];
  chains: LocalizedChainData[];
  bounties: LocalizedBountyData[];
  posts: LocalizedPostData[];
  claims: LocalizedClaimData[];
  collectives: Collective[];
  verificationRequests: VerificationRequest[];
  isSeeded: boolean;
}

/**
 * The global seed store.
 * Starts empty - populated on first access if NEXT_PUBLIC_SEED_DATA=true.
 */
const store: SeedStore = {
  signals: [],
  chains: [],
  bounties: [],
  posts: [],
  claims: [],
  collectives: [],
  verificationRequests: [],
  isSeeded: false,
};

/**
 * Promise that resolves when auto-seeding is complete.
 * null means seeding hasn't been attempted yet.
 */
let seedingPromise: Promise<void> | null = null;

/**
 * Attempt to auto-seed if the environment variable is set.
 * Returns a promise that resolves when seeding is complete.
 * Safe to call multiple times - all callers await the same promise.
 *
 * IMPORTANT: This function propagates seeding errors instead of swallowing them.
 * Static generation will fail fast if seeding fails, rather than silently
 * producing empty route sets.
 */
function ensureAutoSeeded(): Promise<void> {
  if (seedingPromise !== null) {
    return seedingPromise;
  }

  // Check if auto-seed is enabled via environment variable
  if (process.env.NEXT_PUBLIC_SEED_DATA === 'true' && !store.isSeeded) {
    // Dynamically import and run the seed function
    // Errors are propagated to callers - static generation will fail fast
    seedingPromise = import('./seed-data')
      .then(({ seedAll }) => {
        seedAll();
      })
      .catch((error: unknown) => {
        // Log the error for debugging
        console.error('[seed-store] Failed to load seed data:', error);
        // Re-throw to propagate to callers (especially static generation)
        throw new Error(
          `Seeding failed: ${error instanceof Error ? error.message : 'Unknown error'}. ` +
          'Static generation cannot proceed without seed data when NEXT_PUBLIC_SEED_DATA=true.'
        );
      });
  } else {
    // No seeding needed - resolve immediately
    seedingPromise = Promise.resolve();
  }

  return seedingPromise;
}

// ============================================================
// Store accessors (used by mock services)
// ============================================================

export function getSignals(locale: Locale = 'en'): Signal[] {
  void ensureAutoSeeded();
  return store.signals.map((s) => s.data[locale]);
}

export function getChains(locale: Locale = 'en'): StoryChain[] {
  void ensureAutoSeeded();
  return store.chains.map((c) => c.data[locale]);
}

export function getBounties(locale: Locale = 'en'): Bounty[] {
  void ensureAutoSeeded();
  return store.bounties.map((b) => b.data[locale]);
}

export function getPosts(locale: Locale = 'en'): Post[] {
  void ensureAutoSeeded();
  return store.posts.map((p) => p.data[locale]);
}

export function getClaims(locale: Locale = 'en'): Claim[] {
  void ensureAutoSeeded();
  return store.claims.map((c) => c.data[locale]);
}

export function getCollectives(): Collective[] {
  void ensureAutoSeeded();
  return store.collectives;
}

export function getVerificationRequests(): VerificationRequest[] {
  void ensureAutoSeeded();
  return store.verificationRequests;
}

export function isSeeded(): boolean {
  return store.isSeeded;
}

// ============================================================
// Store mutators (used by seed script)
// ============================================================

export function seedSignals(signals: LocalizedSignalData[]): void {
  store.signals = signals;
}

export function seedChains(chains: LocalizedChainData[]): void {
  store.chains = chains;
}

export function seedBounties(bounties: LocalizedBountyData[]): void {
  store.bounties = bounties;
}

export function seedPosts(posts: LocalizedPostData[]): void {
  store.posts = posts;
}

export function seedClaims(claims: LocalizedClaimData[]): void {
  store.claims = claims;
}

export function seedCollectives(collectives: Collective[]): void {
  store.collectives = collectives;
}

export function seedVerificationRequests(requests: VerificationRequest[]): void {
  store.verificationRequests = requests;
}

export function markAsSeeded(): void {
  store.isSeeded = true;
}

export function clearStore(): void {
  store.signals = [];
  store.chains = [];
  store.bounties = [];
  store.posts = [];
  store.claims = [];
  store.collectives = [];
  store.verificationRequests = [];
  store.isSeeded = false;
}

// ============================================================
// ID accessors (for static generation)
// ============================================================

/**
 * Verify that seeding completed successfully.
 * Throws if NEXT_PUBLIC_SEED_DATA=true but store wasn't populated.
 */
function assertSeededIfRequired(): void {
  if (process.env.NEXT_PUBLIC_SEED_DATA === 'true' && !store.isSeeded) {
    throw new Error(
      'Seed data was expected (NEXT_PUBLIC_SEED_DATA=true) but store is empty. ' +
      'This likely means seeding failed silently. Check seed-data.ts for errors.'
    );
  }
}

/**
 * Get all signal IDs synchronously.
 * WARNING: May return empty array if seeding hasn't completed.
 * Prefer getAllSignalIdsAsync() for static generation.
 */
export function getAllSignalIds(): string[] {
  return store.signals.map((s) => s.id);
}

/**
 * Get all signal IDs after ensuring seeding is complete.
 * Use this in generateStaticParams().
 * Throws if seeding was expected but failed.
 */
export async function getAllSignalIdsAsync(): Promise<string[]> {
  await ensureAutoSeeded();
  assertSeededIfRequired();
  return store.signals.map((s) => s.id);
}

/**
 * Get all chain IDs synchronously.
 * WARNING: May return empty array if seeding hasn't completed.
 * Prefer getAllChainIdsAsync() for static generation.
 */
export function getAllChainIds(): string[] {
  return store.chains.map((c) => c.id);
}

/**
 * Get all chain IDs after ensuring seeding is complete.
 * Use this in generateStaticParams().
 * Throws if seeding was expected but failed.
 */
export async function getAllChainIdsAsync(): Promise<string[]> {
  await ensureAutoSeeded();
  assertSeededIfRequired();
  return store.chains.map((c) => c.id);
}

/**
 * Get all bounty IDs synchronously.
 * WARNING: May return empty array if seeding hasn't completed.
 * Prefer getAllBountyIdsAsync() for static generation.
 */
export function getAllBountyIds(): string[] {
  return store.bounties.map((b) => b.id);
}

/**
 * Get all bounty IDs after ensuring seeding is complete.
 * Use this in generateStaticParams().
 * Throws if seeding was expected but failed.
 */
export async function getAllBountyIdsAsync(): Promise<string[]> {
  await ensureAutoSeeded();
  assertSeededIfRequired();
  return store.bounties.map((b) => b.id);
}

/**
 * Get all post IDs synchronously.
 * WARNING: May return empty array if seeding hasn't completed.
 * Prefer getAllPostIdsAsync() for static generation.
 */
export function getAllPostIds(): string[] {
  return store.posts.map((p) => p.id);
}

/**
 * Get all post IDs after ensuring seeding is complete.
 * Use this in generateStaticParams().
 * Throws if seeding was expected but failed.
 */
export async function getAllPostIdsAsync(): Promise<string[]> {
  await ensureAutoSeeded();
  assertSeededIfRequired();
  return store.posts.map((p) => p.id);
}

/**
 * Get all claim IDs synchronously.
 * WARNING: May return empty array if seeding hasn't completed.
 * Prefer getAllClaimIdsAsync() for static generation.
 */
export function getAllClaimIds(): string[] {
  return store.claims.map((c) => c.id);
}

/**
 * Get all claim IDs after ensuring seeding is complete.
 * Use this in generateStaticParams().
 * Throws if seeding was expected but failed.
 */
export async function getAllClaimIdsAsync(): Promise<string[]> {
  await ensureAutoSeeded();
  assertSeededIfRequired();
  return store.claims.map((c) => c.id);
}

/**
 * Get all collective IDs synchronously.
 * WARNING: May return empty array if seeding hasn't completed.
 * Prefer getAllCollectiveIdsAsync() for static generation.
 */
export function getAllCollectiveIds(): string[] {
  return store.collectives.map((c) => c.id);
}

/**
 * Get all collective IDs after ensuring seeding is complete.
 * Use this in generateStaticParams().
 * Throws if seeding was expected but failed.
 */
export async function getAllCollectiveIdsAsync(): Promise<string[]> {
  await ensureAutoSeeded();
  assertSeededIfRequired();
  return store.collectives.map((c) => c.id);
}
