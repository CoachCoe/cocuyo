/**
 * Seed Store — Runtime storage for seeded mock data.
 *
 * This store holds data populated by the seed script.
 * Mock services read from this store, which starts empty.
 * Run `pnpm seed:dev` to populate with test data.
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
 * Starts empty - populated by seed script or at runtime.
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

// ============================================================
// Store accessors (used by mock services)
// ============================================================

export function getSignals(locale: Locale = 'en'): Signal[] {
  return store.signals.map((s) => s.data[locale]);
}

export function getChains(locale: Locale = 'en'): StoryChain[] {
  return store.chains.map((c) => c.data[locale]);
}

export function getBounties(locale: Locale = 'en'): Bounty[] {
  return store.bounties.map((b) => b.data[locale]);
}

export function getPosts(locale: Locale = 'en'): Post[] {
  return store.posts.map((p) => p.data[locale]);
}

export function getClaims(locale: Locale = 'en'): Claim[] {
  return store.claims.map((c) => c.data[locale]);
}

export function getCollectives(): Collective[] {
  return store.collectives;
}

export function getVerificationRequests(): VerificationRequest[] {
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
