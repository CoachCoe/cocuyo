/**
 * Corroboration types — the core interaction in the Firefly Network.
 *
 * A corroboration is NOT a "like." It is a reputation-staked act of verification.
 * When you corroborate, you are putting your accumulated reputation behind
 * your assessment. If the post is later successfully challenged,
 * your reputation in that domain diminishes.
 */

import type { CorroborationId, DIMCredential, PostId } from './brands';

/**
 * Types of corroboration — each carries different meaning and weight.
 */
export type CorroborationType =
  | 'witness'    // "I can independently confirm this observation"
  | 'evidence'   // "I have additional documentation that supports this"
  | 'expertise'  // "This is consistent with my knowledge in this domain"
  | 'challenge'; // "I have reason to believe this is inaccurate"

/**
 * Evidence type for submissions via Corroborate/Dispute gestures.
 */
export type EvidenceType =
  | 'source_link'    // URL input
  | 'document'       // File upload (placeholder)
  | 'photo'          // Image upload (placeholder)
  | 'observation';   // Free text firsthand account

/**
 * A single corroboration record.
 *
 * Every corroboration is:
 * - Signed with a DIM credential (verified human)
 * - Recorded permanently on-chain
 * - Weighted by the contributor's topic reputation
 */
export interface Corroboration {
  /** Unique identifier */
  readonly id: CorroborationId;
  /** The post being corroborated */
  readonly postId: PostId;
  /** Type of corroboration */
  readonly type: CorroborationType;
  /** DIM credential of the corroborating firefly */
  readonly dimSignature: DIMCredential;
  /** Optional explanation or evidence reference */
  readonly note?: string;
  /** If type is 'evidence', the supporting post ID */
  readonly evidencePostId?: PostId;
  /** Reputation weight at time of corroboration */
  readonly weight: number;
  /** When this corroboration was made (Unix timestamp) */
  readonly createdAt: number;

  // Evidence fields (for Corroborate/Dispute sheet submissions)
  /** Type of evidence submitted */
  readonly evidenceType?: EvidenceType;
  /** Evidence content (URL, file reference, or text) */
  readonly evidenceContent?: string;
  /** Description of what the evidence shows */
  readonly evidenceDescription?: string;
}

/**
 * Summary of corroborations for a post.
 * This is the aggregated view displayed on post cards.
 */
export interface CorroborationSummary {
  /** Number of witness corroborations */
  readonly witnessCount: number;
  /** Number of evidence corroborations */
  readonly evidenceCount: number;
  /** Number of expertise corroborations */
  readonly expertiseCount: number;
  /** Number of challenges */
  readonly challengeCount: number;
  /** Total reputation-weighted score */
  readonly totalWeight: number;
}

/**
 * Input type for creating a new corroboration.
 */
export interface NewCorroboration {
  readonly postId: PostId;
  readonly type: CorroborationType;
  readonly note?: string;
  /** Required if type is 'evidence' */
  readonly evidencePostId?: PostId;

  // Evidence fields (for Corroborate/Dispute sheet submissions)
  readonly evidenceType?: EvidenceType;
  readonly evidenceContent?: string;
  readonly evidenceDescription?: string;
}

/**
 * Create an empty corroboration summary.
 */
export function emptyCorroborationSummary(): CorroborationSummary {
  return {
    witnessCount: 0,
    evidenceCount: 0,
    expertiseCount: 0,
    challengeCount: 0,
    totalWeight: 0,
  };
}
