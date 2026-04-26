/**
 * Verdict Service implementation with multi-sig voting.
 *
 * Provides:
 * - Verdict proposal creation and voting
 * - Threshold checking and finalization
 * - Bulletin Chain storage for proposals and verdicts
 */

import type {
  VerdictService,
  VerdictProposalService,
  Verdict,
  VerdictId,
  ClaimId,
  CollectiveId,
  Result,
  NewVerdict,
  VerdictProposal,
  NewVerdictProposal,
  NewVerdictVote,
  VerdictVote,
} from '@cocuyo/types';
import { ok, err, createVerdictId, calculateVotingProgress, hasVoted } from '@cocuyo/types';
import {
  getConnectedWallet,
  getConnectedCredential,
  uploadToBulletin,
  fetchFromBulletin,
} from './service-utils';
import { collectiveService } from './collective-service';
import { createLogger } from '../logging';

const logger = createLogger('VerdictService');

// Session caches
const verdictsCache: Verdict[] = [];
const proposalsCache: VerdictProposal[] = [];

// Map of claim ID to verdict ID for quick lookup
const claimToVerdictMap = new Map<string, string>();

// Default proposal expiry: 7 days
const DEFAULT_PROPOSAL_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Generate a unique proposal ID.
 */
function generateProposalId(): string {
  return `proposal-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Sign a vote (placeholder - in production this would use actual cryptographic signing).
 */
function signVote(vote: Omit<VerdictVote, 'signature'>): string {
  // In production, this would use the wallet's signRaw to sign the vote data
  const voteData = JSON.stringify({
    voter: vote.voter,
    decision: vote.decision,
    rationale: vote.rationale,
    votedAt: vote.votedAt,
  });
  // Placeholder signature - would be replaced with actual signing
  return `sig:${Buffer.from(voteData).toString('base64').slice(0, 32)}`;
}

export class VerdictServiceImpl implements VerdictService {
  async getVerdict(id: VerdictId): Promise<Verdict | null> {
    // Check cache first
    const cached = verdictsCache.find((v) => v.id === id);
    if (cached) return cached;

    // Try Bulletin Chain
    return fetchFromBulletin<Verdict>(id);
  }

  async getVerdictForClaim(claimId: ClaimId): Promise<Verdict | null> {
    // Check mapping first
    const verdictId = claimToVerdictMap.get(claimId);
    if (verdictId !== undefined) {
      return this.getVerdict(verdictId as VerdictId);
    }

    // Search cache
    const cached = verdictsCache.find((v) => v.claimId === claimId);
    if (cached) {
      claimToVerdictMap.set(claimId, cached.id);
      return cached;
    }

    return null;
  }

  async issueVerdict(newVerdict: NewVerdict): Promise<Result<VerdictId, string>> {
    const credential = getConnectedCredential();
    if (!credential) {
      return err('Wallet not connected. Please connect to issue a verdict.');
    }

    // Create verdict with temporary ID
    const verdict: Verdict = {
      id: '' as VerdictId,
      claimId: newVerdict.claimId,
      collectiveId: 'system' as CollectiveId, // Direct verdicts are from system
      status: newVerdict.status,
      rationale: newVerdict.rationale,
      issuedAt: Date.now(),
    };

    // Upload to Bulletin Chain
    const uploadResult = await uploadToBulletin(verdict);
    if (!uploadResult.ok) {
      return err(uploadResult.error);
    }

    const verdictWithId: Verdict = {
      ...verdict,
      id: createVerdictId(uploadResult.value.cid),
    };

    verdictsCache.unshift(verdictWithId);
    claimToVerdictMap.set(newVerdict.claimId, verdictWithId.id);

    logger.debug('Verdict issued', 'issueVerdict', {
      verdictId: verdictWithId.id,
      claimId: newVerdict.claimId,
      status: newVerdict.status,
    });

    return ok(verdictWithId.id);
  }
}

export class VerdictProposalServiceImpl implements VerdictProposalService {
  async getProposal(proposalId: string): Promise<VerdictProposal | null> {
    // Check cache first
    const cached = proposalsCache.find((p) => p.id === proposalId);
    if (cached) return cached;

    // Try Bulletin Chain
    return fetchFromBulletin<VerdictProposal>(proposalId);
  }

  getProposalsForClaim(claimId: ClaimId): Promise<readonly VerdictProposal[]> {
    // Return all proposals for this claim from cache
    return Promise.resolve(proposalsCache.filter((p) => p.claimId === claimId));
  }

  getActiveProposalsForCollective(
    collectiveId: CollectiveId
  ): Promise<readonly VerdictProposal[]> {
    const now = Date.now();
    return Promise.resolve(
      proposalsCache.filter(
        (p) => p.collectiveId === collectiveId && p.status === 'voting' && p.expiresAt > now
      )
    );
  }

  async createProposal(newProposal: NewVerdictProposal): Promise<Result<string, string>> {
    const wallet = getConnectedWallet();
    const credential = getConnectedCredential();

    if (wallet === null || credential === null) {
      return err('Wallet not connected. Please connect to create a proposal.');
    }

    // Verify user is a member of the collective
    const isMember = await collectiveService.isMember(newProposal.collectiveId, credential);
    if (!isMember) {
      return err('You must be a member of this collective to create proposals.');
    }

    // Get collective governance settings
    const collective = await collectiveService.getCollective(newProposal.collectiveId);
    if (!collective) {
      return err('Collective not found.');
    }

    // Check for existing active proposals on this claim
    const existingProposals = await this.getProposalsForClaim(newProposal.claimId);
    const activeProposal = existingProposals.find(
      (p) => p.collectiveId === newProposal.collectiveId && p.status === 'voting'
    );
    if (activeProposal) {
      return err('An active proposal already exists for this claim from your collective.');
    }

    const now = Date.now();
    const proposalId = generateProposalId();

    // Create the proposer's vote automatically
    const proposerVote: VerdictVote = {
      voter: credential,
      decision: newProposal.proposedStatus,
      rationale: newProposal.rationale,
      signature: signVote({
        voter: credential,
        decision: newProposal.proposedStatus,
        rationale: newProposal.rationale,
        votedAt: now,
      }),
      votedAt: now,
    };

    const proposal: VerdictProposal = {
      id: proposalId,
      claimId: newProposal.claimId,
      collectiveId: newProposal.collectiveId,
      proposedBy: credential,
      proposedStatus: newProposal.proposedStatus,
      rationale: newProposal.rationale,
      votes: [proposerVote],
      requiredVotes: collective.governance.minVotesForVerdict,
      threshold: collective.governance.verdictThreshold,
      status: 'voting',
      createdAt: now,
      expiresAt: now + DEFAULT_PROPOSAL_EXPIRY_MS,
    };

    // Upload to Bulletin Chain
    const uploadResult = await uploadToBulletin(proposal);
    if (!uploadResult.ok) {
      return err(uploadResult.error);
    }

    // Update proposal with CID as new ID
    const proposalWithCid: VerdictProposal = {
      ...proposal,
      id: uploadResult.value.cid,
    };

    proposalsCache.unshift(proposalWithCid);

    logger.debug('Proposal created', 'createProposal', {
      proposalId: proposalWithCid.id,
      claimId: newProposal.claimId,
      collectiveId: newProposal.collectiveId,
      proposedStatus: newProposal.proposedStatus,
    });

    return ok(proposalWithCid.id);
  }

  async vote(proposalId: string, newVote: NewVerdictVote): Promise<Result<VerdictVote, string>> {
    const wallet = getConnectedWallet();
    const credential = getConnectedCredential();

    if (wallet === null || credential === null) {
      return err('Wallet not connected. Please connect to vote.');
    }

    // Get the proposal
    const proposalIndex = proposalsCache.findIndex((p) => p.id === proposalId);
    if (proposalIndex === -1) {
      return err('Proposal not found.');
    }

    const proposal = proposalsCache[proposalIndex];
    if (!proposal) {
      return err('Proposal not found.');
    }

    // Check proposal is still active
    if (proposal.status !== 'voting') {
      return err(`Proposal is no longer accepting votes (status: ${proposal.status}).`);
    }

    if (proposal.expiresAt < Date.now()) {
      return err('Proposal has expired.');
    }

    // Verify user is a member of the collective
    const isMember = await collectiveService.isMember(proposal.collectiveId, credential);
    if (!isMember) {
      return err('You must be a member of this collective to vote.');
    }

    // Check if already voted
    if (hasVoted(proposal, credential)) {
      return err('You have already voted on this proposal.');
    }

    // Create the vote
    const now = Date.now();
    const voteBase = {
      voter: credential,
      decision: newVote.decision,
      votedAt: now,
    };
    const signatureInput =
      newVote.rationale !== undefined ? { ...voteBase, rationale: newVote.rationale } : voteBase;
    const vote: VerdictVote =
      newVote.rationale !== undefined
        ? {
            ...voteBase,
            rationale: newVote.rationale,
            signature: signVote(signatureInput),
          }
        : {
            ...voteBase,
            signature: signVote(signatureInput),
          };

    // Update proposal with new vote
    const updatedProposal: VerdictProposal = {
      ...proposal,
      votes: [...proposal.votes, vote],
    };

    // Replace in cache
    proposalsCache[proposalIndex] = updatedProposal;

    // Upload updated proposal to Bulletin Chain
    const uploadResult = await uploadToBulletin(updatedProposal);
    if (!uploadResult.ok) {
      // Rollback cache on persistence failure
      proposalsCache[proposalIndex] = proposal;
      return err(`Vote recorded but persistence failed: ${uploadResult.error}`);
    }

    logger.debug('Vote cast', 'vote', {
      proposalId,
      voter: credential,
      decision: newVote.decision,
    });

    // Check if we should finalize
    await this.checkAndFinalize(proposalId);

    return ok(vote);
  }

  async checkAndFinalize(proposalId: string): Promise<Result<VerdictId | null, string>> {
    const proposalIndex = proposalsCache.findIndex((p) => p.id === proposalId);
    if (proposalIndex === -1) {
      return err('Proposal not found.');
    }

    const proposal = proposalsCache[proposalIndex];
    if (!proposal) {
      return err('Proposal not found.');
    }

    // Can't finalize if not in voting status
    if (proposal.status !== 'voting') {
      return ok(null);
    }

    // Check if expired
    if (proposal.expiresAt < Date.now()) {
      const expiredProposal: VerdictProposal = {
        ...proposal,
        status: 'expired',
      };
      proposalsCache[proposalIndex] = expiredProposal;
      const expiredUploadResult = await uploadToBulletin(expiredProposal);
      if (!expiredUploadResult.ok) {
        logger.swallowed('Failed to persist expired proposal', 'checkAndFinalize', undefined, {
          proposalId,
          error: expiredUploadResult.error,
        });
      }
      return ok(null);
    }

    // Calculate voting progress
    const progress = calculateVotingProgress(proposal);

    if (!progress.thresholdReached) {
      return ok(null); // Not ready to finalize
    }

    // Threshold reached - create verdict
    const verdictService = new VerdictServiceImpl();
    const verdictResult = await verdictService.issueVerdict({
      claimId: proposal.claimId,
      status: progress.leadingStatus ?? proposal.proposedStatus,
      rationale: `Verdict reached by ${proposal.votes.length} votes with ${progress.agreementPercentage.toFixed(0)}% agreement. ${proposal.rationale}`,
    });

    if (!verdictResult.ok) {
      return err(verdictResult.error);
    }

    // Update proposal status
    const approvedProposal: VerdictProposal = {
      ...proposal,
      status: 'approved',
    };
    proposalsCache[proposalIndex] = approvedProposal;
    const approvedUploadResult = await uploadToBulletin(approvedProposal);
    if (!approvedUploadResult.ok) {
      logger.swallowed('Failed to persist approved proposal', 'checkAndFinalize', undefined, {
        proposalId,
        error: approvedUploadResult.error,
      });
    }

    logger.info('Proposal finalized', 'checkAndFinalize', {
      proposalId,
      verdictId: verdictResult.value,
      status: progress.leadingStatus,
      votes: proposal.votes.length,
      agreement: progress.agreementPercentage,
    });

    return ok(verdictResult.value);
  }
}

// Export singleton instances
export const verdictService = new VerdictServiceImpl();
export const verdictProposalService = new VerdictProposalServiceImpl();
