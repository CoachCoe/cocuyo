/**
 * Verdict Voting Types — Multi-sig voting for collectives.
 *
 * Enables collective members to propose and vote on verdicts for claims.
 * Verdicts are finalized when the required number of votes reach threshold.
 */

import type { ClaimId, CollectiveId, DIMCredential } from './brands';
import type { VerdictStatus } from './claim';

/**
 * Status of a verdict proposal.
 */
export type ProposalStatus = 'voting' | 'approved' | 'rejected' | 'expired';

/**
 * A member's vote on a verdict proposal.
 */
export interface VerdictVote {
  /** Who cast this vote */
  readonly voter: DIMCredential;
  /** The verdict status they voted for */
  readonly decision: VerdictStatus;
  /** Optional explanation for the vote */
  readonly rationale?: string;
  /** Cryptographic signature of the vote */
  readonly signature: string;
  /** When the vote was cast (Unix timestamp) */
  readonly votedAt: number;
}

/**
 * A verdict proposal awaiting votes from collective members.
 *
 * Proposals go through the voting process:
 * 1. Member proposes a verdict status
 * 2. Other members vote (agree or propose different status)
 * 3. When votes reach threshold, verdict is finalized
 * 4. If threshold not reached by expiry, proposal is rejected/expired
 */
export interface VerdictProposal {
  /** Unique proposal identifier (CID on Bulletin Chain) */
  readonly id: string;
  /** The claim this proposal is for */
  readonly claimId: ClaimId;
  /** The collective voting on this proposal */
  readonly collectiveId: CollectiveId;
  /** Who created the proposal */
  readonly proposedBy: DIMCredential;
  /** The verdict status being proposed */
  readonly proposedStatus: VerdictStatus;
  /** Explanation for the proposed verdict */
  readonly rationale: string;
  /** Votes cast on this proposal */
  readonly votes: readonly VerdictVote[];
  /** Minimum number of votes required to finalize */
  readonly requiredVotes: number;
  /** Percentage of agreement needed (0-100) */
  readonly threshold: number;
  /** Current status of the proposal */
  readonly status: ProposalStatus;
  /** When the proposal was created (Unix timestamp) */
  readonly createdAt: number;
  /** When the proposal expires (Unix timestamp) */
  readonly expiresAt: number;
}

/**
 * Input for creating a new verdict proposal.
 */
export interface NewVerdictProposal {
  /** The claim to propose a verdict for */
  readonly claimId: ClaimId;
  /** The collective issuing the verdict */
  readonly collectiveId: CollectiveId;
  /** The proposed verdict status */
  readonly proposedStatus: VerdictStatus;
  /** Explanation for the proposed verdict */
  readonly rationale: string;
}

/**
 * Input for casting a vote on a proposal.
 */
export interface NewVerdictVote {
  /** The verdict status to vote for */
  readonly decision: VerdictStatus;
  /** Optional explanation for the vote */
  readonly rationale?: string;
}

/**
 * Summary of voting progress on a proposal.
 */
export interface VotingProgress {
  /** Total votes cast */
  readonly totalVotes: number;
  /** Votes needed to finalize */
  readonly requiredVotes: number;
  /** Current agreement percentage */
  readonly agreementPercentage: number;
  /** Threshold percentage needed */
  readonly threshold: number;
  /** Whether threshold has been reached */
  readonly thresholdReached: boolean;
  /** Vote counts by status */
  readonly voteCounts: Readonly<Record<VerdictStatus, number>>;
  /** Leading verdict status */
  readonly leadingStatus: VerdictStatus | null;
}

/**
 * Calculate voting progress for a proposal.
 */
export function calculateVotingProgress(proposal: VerdictProposal): VotingProgress {
  const voteCounts: Record<VerdictStatus, number> = {
    confirmed: 0,
    disputed: 0,
    false: 0,
    synthetic: 0,
    inconclusive: 0,
  };

  for (const vote of proposal.votes) {
    voteCounts[vote.decision]++;
  }

  const totalVotes = proposal.votes.length;
  let leadingStatus: VerdictStatus | null = null;
  let maxVotes = 0;

  for (const [status, count] of Object.entries(voteCounts)) {
    if (count > maxVotes) {
      maxVotes = count;
      leadingStatus = status as VerdictStatus;
    }
  }

  const agreementPercentage = totalVotes > 0 ? (maxVotes / totalVotes) * 100 : 0;
  const thresholdReached =
    totalVotes >= proposal.requiredVotes && agreementPercentage >= proposal.threshold;

  return {
    totalVotes,
    requiredVotes: proposal.requiredVotes,
    agreementPercentage,
    threshold: proposal.threshold,
    thresholdReached,
    voteCounts,
    leadingStatus,
  };
}

/**
 * Check if a member has already voted on a proposal.
 */
export function hasVoted(proposal: VerdictProposal, credential: DIMCredential): boolean {
  return proposal.votes.some((vote) => vote.voter === credential);
}

/**
 * Get a member's vote on a proposal, if they voted.
 */
export function getMemberVote(
  proposal: VerdictProposal,
  credential: DIMCredential
): VerdictVote | null {
  return proposal.votes.find((vote) => vote.voter === credential) ?? null;
}
