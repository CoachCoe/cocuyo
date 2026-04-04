/**
 * Claim types — truth targets in the Firefly Network.
 *
 * A claim is a verifiable assertion extracted from a post.
 * Claims are the fundamental unit of fact-checking — each claim
 * can be independently verified, with evidence linked from signals.
 */

import type { ClaimId, CollectiveId, DIMCredential, PostId, SignalId } from './brands';

/** Status of a claim in the verification workflow */
export type ClaimStatus =
  | 'pending'       // Extracted, waiting for evidence
  | 'under_review'  // Being reviewed by a collective
  | 'verified'      // Confirmed as accurate
  | 'disputed'      // Evidence is conflicting
  | 'false'         // Determined to be inaccurate
  | 'unverifiable'; // Cannot be verified (insufficient evidence)

/**
 * Evidence linking a signal to a claim.
 */
export interface ClaimEvidence {
  /** The signal providing evidence */
  readonly signalId: SignalId;
  /** Whether this signal supports or contradicts the claim */
  readonly supports: boolean;
  /** Who submitted this evidence link */
  readonly submittedBy: DIMCredential;
  /** Optional note explaining how the signal relates to the claim */
  readonly note?: string;
  /** When this evidence was submitted */
  readonly submittedAt: number;
}

/**
 * A verification verdict on a claim.
 */
export interface ClaimVerdict {
  /** Final status */
  readonly status: ClaimStatus;
  /** Collective that issued the verdict */
  readonly collectiveId: CollectiveId;
  /** Reasoning for the verdict */
  readonly reasoning: string;
  /** When the verdict was issued */
  readonly issuedAt: number;
}

/**
 * A claim — a verifiable assertion extracted from a post.
 *
 * Every claim:
 * - Originates from a specific post
 * - Can have evidence (signals) linked to it
 * - Goes through a verification workflow
 * - May receive a verdict from a collective
 */
export interface Claim {
  /** Unique identifier */
  readonly id: ClaimId;
  /** CID on Bulletin Chain */
  readonly cid?: string;
  /** The verifiable assertion text */
  readonly statement: string;
  /** Post this claim was extracted from */
  readonly sourcePostId: PostId;
  /** Who extracted this claim */
  readonly extractedBy: DIMCredential;
  /** Current verification status */
  readonly status: ClaimStatus;
  /** Signals linked as evidence */
  readonly evidence: readonly ClaimEvidence[];
  /** Verdict if verification is complete */
  readonly verdict?: ClaimVerdict;
  /** Topic tags (inherited from source post or added) */
  readonly topics: readonly string[];
  /** When this claim was extracted (Unix timestamp) */
  readonly createdAt: number;
  /** When this claim was last updated (Unix timestamp) */
  readonly updatedAt: number;
}

/**
 * A lightweight preview of a claim for list views.
 */
export interface ClaimPreview {
  readonly id: ClaimId;
  readonly statement: string;
  readonly sourcePostId: PostId;
  readonly status: ClaimStatus;
  readonly topics: readonly string[];
  readonly evidenceCount: number;
  readonly supportingCount: number;
  readonly contradictingCount: number;
  readonly createdAt: number;
}

/**
 * Input type for extracting a new claim from a post.
 */
export interface NewClaim {
  /** The verifiable assertion text */
  readonly statement: string;
  /** Post this claim is extracted from */
  readonly sourcePostId: PostId;
  /** Optional topics (defaults to post's topics) */
  readonly topics?: readonly string[];
}

/**
 * Input type for submitting evidence to a claim.
 */
export interface NewClaimEvidence {
  /** The signal providing evidence */
  readonly signalId: SignalId;
  /** Whether this signal supports or contradicts the claim */
  readonly supports: boolean;
  /** Optional note explaining the relationship */
  readonly note?: string;
}
