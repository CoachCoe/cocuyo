/**
 * Identity types — verified human identity in F-Network.
 *
 * Every participant has a DIM credential (proof-of-personhood) but controls
 * how much identity information they disclose. Anonymous by default.
 */

import type { FireflyId, DIMCredential, CollectiveId } from './brands';

/**
 * How much identity the user chooses to disclose.
 * - anonymous: Only pseudonym visible, no other info
 * - partial: Location and profession visible
 * - public: Full identity visible
 */
export type DisclosureLevel = 'anonymous' | 'partial' | 'public';

/**
 * Public information shown when disclosure level allows.
 */
export interface PublicProfileInfo {
  /** Display name (real name or chosen name) */
  readonly displayName?: string;
  /** General location (city/region, not precise) */
  readonly location?: string;
  /** Professional role or expertise area */
  readonly profession?: string;
  /** Short bio */
  readonly bio?: string;
  /** Avatar image CID (stored on Bulletin Chain) */
  readonly avatarCid?: string;
}

/**
 * Aggregated reputation score across all topics.
 */
export interface ReputationScore {
  /** Overall reputation 0-100 */
  readonly overall: number;
  /** Reputation by topic domain */
  readonly byTopic: Readonly<Record<string, number>>;
  /** Percentage of corroborations that weren't later disputed */
  readonly accuracyRate: number;
}

/**
 * Statistics about a firefly's contributions.
 */
export interface FireflyStats {
  /** Total posts created */
  readonly postsCreated: number;
  /** Total corroborations given to others */
  readonly corroborationsGiven: number;
  /** Total corroborations received on own posts */
  readonly corroborationsReceived: number;
  /** Number of collectives joined */
  readonly collectivesJoined: number;
  /** Number of verifications participated in */
  readonly verificationsCompleted: number;
}

/**
 * A firefly's profile in F-Network.
 *
 * This is NOT a social media profile. It's a privacy-controlled identity
 * tied to a DIM credential. The user decides what to reveal.
 */
export interface FireflyProfile {
  /** Unique identifier */
  readonly id: FireflyId;
  /** CID of this profile on Bulletin Chain */
  readonly cid?: string;
  /** DIM credential hash (the public identifier) */
  readonly credentialHash: DIMCredential;
  /** User-chosen pseudonym (always visible) */
  readonly pseudonym: string;
  /** How much identity to disclose */
  readonly disclosureLevel: DisclosureLevel;
  /** Public info (shown based on disclosure level) */
  readonly publicInfo?: PublicProfileInfo;
  /** Contribution statistics */
  readonly stats: FireflyStats;
  /** Reputation scores */
  readonly reputation: ReputationScore;
  /** Collectives the user belongs to */
  readonly collectiveMemberships: readonly CollectiveId[];
  /** Topics the user follows */
  readonly followedTopics: readonly string[];
  /** When profile was created */
  readonly createdAt: number;
  /** When profile was last updated */
  readonly updatedAt: number;
}

/**
 * Minimal profile info shown on signals and corroborations.
 * This is the "author" view that others see.
 */
export interface FireflyAuthor {
  /** Author identifier for linking */
  readonly id: string;
  /** DIM credential hash */
  readonly credentialHash: DIMCredential;
  /** Pseudonym */
  readonly pseudonym: string;
  /** Disclosure level (determines what else is shown) */
  readonly disclosureLevel: DisclosureLevel;
  /** Display name (only if partial/public) */
  readonly displayName?: string;
  /** Location (only if partial/public) */
  readonly location?: string;
  /** Reputation score (if disclosed) */
  readonly reputation?: number;
}

/**
 * Data needed to create a new profile.
 */
export interface NewFireflyProfile {
  readonly pseudonym: string;
  readonly disclosureLevel: DisclosureLevel;
  readonly publicInfo?: PublicProfileInfo;
  readonly followedTopics?: readonly string[];
}
