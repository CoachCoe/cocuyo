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
 * Auto-seed flag. Set to true once we've attempted to auto-seed.
 */
let autoSeedAttempted = false;

/**
 * Attempt to auto-seed if the environment variable is set.
 * Only runs once, on first data access.
 */
function ensureAutoSeeded(): void {
  if (autoSeedAttempted) return;
  autoSeedAttempted = true;

  // Check if auto-seed is enabled via environment variable
  if (process.env.NEXT_PUBLIC_SEED_DATA === 'true' && !store.isSeeded) {
    // Dynamically import and run the seed function
    // This is async but we call it fire-and-forget style
    // The next request will have the data
    void import('./seed-data').then(({ seedAll }) => {
      seedAll();
    }).catch(() => {
      // Seed module not found or error - continue with empty data
    });
  }
}

// ============================================================
// Store accessors (used by mock services)
// ============================================================

export function getSignals(locale: Locale = 'en'): Signal[] {
  ensureAutoSeeded();
  return store.signals.map((s) => s.data[locale]);
}

export function getChains(locale: Locale = 'en'): StoryChain[] {
  ensureAutoSeeded();
  return store.chains.map((c) => c.data[locale]);
}

export function getBounties(locale: Locale = 'en'): Bounty[] {
  ensureAutoSeeded();
  return store.bounties.map((b) => b.data[locale]);
}

export function getPosts(locale: Locale = 'en'): Post[] {
  ensureAutoSeeded();
  return store.posts.map((p) => p.data[locale]);
}

export function getClaims(locale: Locale = 'en'): Claim[] {
  ensureAutoSeeded();
  return store.claims.map((c) => c.data[locale]);
}

export function getCollectives(): Collective[] {
  ensureAutoSeeded();
  return store.collectives;
}

export function getVerificationRequests(): VerificationRequest[] {
  ensureAutoSeeded();
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

export function getAllSignalIds(): string[] {
  return store.signals.map((s) => s.id);
}

export function getAllChainIds(): string[] {
  return store.chains.map((c) => c.id);
}

export function getAllBountyIds(): string[] {
  return store.bounties.map((b) => b.id);
}

export function getAllPostIds(): string[] {
  return store.posts.map((p) => p.id);
}

export function getAllClaimIds(): string[] {
  return store.claims.map((c) => c.id);
}

export function getAllCollectiveIds(): string[] {
  return store.collectives.map((c) => c.id);
}
