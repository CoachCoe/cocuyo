/**
 * Claim types — truth targets in the Firefly Network.
 *
 * A claim is a verifiable assertion extracted from a post.
 * Claims are the fundamental unit of fact-checking — each claim
 * can be independently verified, with evidence linked from posts.
 *
 * Note: "Claim" is an internal term. The UI shows claims in the Trust Drawer
 * but doesn't expose this vocabulary in primary user-facing surfaces.
 */

import type { ClaimId, CollectiveId, DIMCredential, PostId, VerdictId } from './brands';

/** Status of a claim in the verification workflow */
export type ClaimStatus =
  | 'pending'       // Extracted, waiting for evidence
  | 'under_review'  // Being reviewed by a collective
  | 'verified'      // Confirmed as accurate
  | 'disputed'      // Evidence is conflicting
  | 'false'         // Determined to be inaccurate
  | 'unverifiable'; // Cannot be verified (insufficient evidence)

/**
 * Evidence linking a post to a claim.
 */
export interface ClaimEvidence {
  /** The post providing evidence */
  readonly postId: PostId;
  /** Whether this post supports or contradicts the claim */
  readonly supports: boolean;
  /** Who submitted this evidence link */
  readonly submittedBy: DIMCredential;
  /** Optional note explaining how the post relates to the claim */
  readonly note?: string;
  /** When this evidence was submitted */
  readonly submittedAt: number;
}

/**
 * A verification verdict on a claim (legacy format).
 * See also: Verdict type for new user-visible verdict format.
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
 * - Can have evidence (posts) linked to it
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
  /** Posts linked as evidence */
  readonly evidence: readonly ClaimEvidence[];
  /** Verdict if verification is complete (legacy) */
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
  /** The post providing evidence */
  readonly postId: PostId;
  /** Whether this post supports or contradicts the claim */
  readonly supports: boolean;
  /** Optional note explaining the relationship */
  readonly note?: string;
}

// ============================================================================
// Verdict Types (user-visible collective determinations)
// ============================================================================

/**
 * Verdict status — the user-visible determination on a claim.
 * These map to the badge colors shown on posts.
 */
export type VerdictStatus =
  | 'confirmed'     // Claim is accurate (gold badge)
  | 'disputed'      // Evidence is conflicting (amber badge)
  | 'false'         // Claim is inaccurate (red badge)
  | 'synthetic'     // Content is AI-generated (orange badge)
  | 'inconclusive'; // Cannot determine (gray badge)

/**
 * A verdict — a collective's formal determination on a claim.
 *
 * Verdicts are the user-visible outcome of the verification process.
 * They appear as badges on post cards and in the Trust Drawer.
 */
export interface Verdict {
  /** Unique identifier */
  readonly id: VerdictId;
  /** The claim this verdict addresses */
  readonly claimId: ClaimId;
  /** Collective that issued the verdict */
  readonly collectiveId: CollectiveId;
  /** The determination status */
  readonly status: VerdictStatus;
  /** Explanation of the reasoning */
  readonly rationale: string;
  /** When the verdict was issued (Unix timestamp) */
  readonly issuedAt: number;
}

/**
 * Input type for issuing a new verdict.
 */
export interface NewVerdict {
  readonly claimId: ClaimId;
  readonly status: VerdictStatus;
  readonly rationale: string;
}
