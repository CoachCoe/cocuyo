'use client';

/**
 * VerdictVotingPanel — Main panel for verdict voting on claims.
 *
 * Displays active proposals, allows creating new proposals, and enables voting.
 * Only visible to members of collectives with jurisdiction over the claim's topics.
 */

import { useState, useEffect, useCallback, useRef, type ReactElement } from 'react';
import type {
  ClaimId,
  VerdictProposal,
  VerdictStatus,
  CollectivePreview,
  NewVerdictVote,
} from '@cocuyo/types';
import { calculateVotingProgress, hasVoted } from '@cocuyo/types';
import { useSigner } from '@/hooks';
import { collectiveService, verdictProposalService } from '@/lib/services';
import { getConnectedCredential } from '@/lib/services/service-utils';
import { VerdictProposalCard } from './VerdictProposalCard';
import { VoteProgress } from './VoteProgress';
import { VoteButtons } from './VoteButtons';
import { CreateProposalSheet } from './CreateProposalSheet';

export interface VerdictVotingPanelProps {
  /** The claim being voted on */
  claimId: ClaimId;
  /** The claim statement for context */
  claimStatement: string;
  /** Translations */
  translations?: {
    title?: string;
    noProposals?: string;
    createProposal?: string;
    castYourVote?: string;
    alreadyVoted?: string;
    notAMember?: string;
    connectWallet?: string;
    loading?: string;
  };
}

export function VerdictVotingPanel({
  claimId,
  claimStatement,
  translations: t = {},
}: VerdictVotingPanelProps): ReactElement | null {
  const { isConnected } = useSigner();
  const [proposals, setProposals] = useState<readonly VerdictProposal[]>([]);
  const [userCollectives, setUserCollectives] = useState<readonly CollectivePreview[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<VerdictProposal | null>(null);
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  const credential = getConnectedCredential();
  const isMember = userCollectives.length > 0;

  // Track mounted state to prevent state updates after unmount
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Load proposals and user's collectives
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [proposalsData, collectivesData] = await Promise.all([
        verdictProposalService.getProposalsForClaim(claimId),
        credential ? collectiveService.getCollectivesForMember(credential) : Promise.resolve([]),
      ]);

      // Guard: don't update state if unmounted
      if (!mountedRef.current) return;

      setProposals(proposalsData);
      setUserCollectives(collectivesData);

      // Auto-select first active proposal if any
      const activeProposal = proposalsData.find((p) => p.status === 'voting');
      if (activeProposal) {
        setSelectedProposal(activeProposal);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [claimId, credential]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Handle vote submission
  const handleVote = async (status: VerdictStatus): Promise<void> => {
    if (!selectedProposal || !credential) return;

    setVoting(true);
    try {
      const vote: NewVerdictVote = { decision: status };
      const result = await verdictProposalService.vote(selectedProposal.id, vote);

      if (result.ok) {
        // Reload data to get updated proposal
        await loadData();
      }
    } finally {
      setVoting(false);
    }
  };

  // Handle proposal creation
  const handleCreateProposal = async (params: {
    claimId: ClaimId;
    collectiveId: string;
    proposedStatus: VerdictStatus;
    rationale: string;
  }): Promise<void> => {
    const result = await verdictProposalService.createProposal({
      claimId: params.claimId,
      collectiveId: params.collectiveId as Parameters<
        typeof verdictProposalService.createProposal
      >[0]['collectiveId'],
      proposedStatus: params.proposedStatus,
      rationale: params.rationale,
    });

    if (result.ok) {
      await loadData();
    } else {
      throw new Error(result.error);
    }
  };

  // Don't render if not connected
  if (!isConnected) {
    return (
      <div className="rounded-container border border-[var(--border-default)] bg-[var(--bg-surface-nested)] p-4 text-center">
        <p className="text-sm text-[var(--fg-secondary)]">
          {t.connectWallet ?? 'Connect your wallet to participate in verdict voting'}
        </p>
      </div>
    );
  }

  // Don't render if not a member of any collective
  if (!loading && !isMember) {
    return (
      <div className="rounded-container border border-[var(--border-default)] bg-[var(--bg-surface-nested)] p-4 text-center">
        <p className="text-sm text-[var(--fg-secondary)]">
          {t.notAMember ?? 'Join a collective to participate in verdict voting'}
        </p>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="rounded-container border border-[var(--border-default)] bg-[var(--bg-surface-nested)] p-4 text-center">
        <p className="animate-pulse text-sm text-[var(--fg-tertiary)]">
          {t.loading ?? 'Loading...'}
        </p>
      </div>
    );
  }

  const activeProposals = proposals.filter((p) => p.status === 'voting');
  const pastProposals = proposals.filter((p) => p.status !== 'voting');

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-medium text-[var(--fg-primary)]">
          {t.title ?? 'Collective Verification'}
        </h3>
        {userCollectives.length > 0 && (
          <button
            type="button"
            onClick={() => setShowCreateSheet(true)}
            className="text-sm text-[var(--color-firefly-gold)] hover:underline"
          >
            {t.createProposal ?? '+ New Proposal'}
          </button>
        )}
      </div>

      {/* Active proposals */}
      {activeProposals.length > 0 ? (
        <div className="space-y-4">
          {activeProposals.map((proposal) => (
            <div
              key={proposal.id}
              className={`rounded-container border bg-[var(--bg-surface-nested)] p-4 transition-colors ${
                selectedProposal?.id === proposal.id
                  ? 'border-[var(--color-firefly-gold)]'
                  : 'border-[var(--border-default)]'
              }`}
            >
              <VerdictProposalCard
                proposal={proposal}
                onClick={() => setSelectedProposal(proposal)}
              />

              {/* Expanded voting section */}
              {selectedProposal?.id === proposal.id && (
                <div className="mt-4 space-y-4 border-t border-[var(--border-subtle)] pt-4">
                  <VoteProgress progress={calculateVotingProgress(proposal)} />

                  {credential && !hasVoted(proposal, credential) ? (
                    <div>
                      <p className="mb-3 text-sm text-[var(--fg-secondary)]">
                        {t.castYourVote ?? 'Cast your vote:'}
                      </p>
                      <VoteButtons
                        onVote={(status) => void handleVote(status)}
                        disabled={voting}
                        loading={voting}
                      />
                    </div>
                  ) : (
                    <p className="text-sm italic text-[var(--fg-tertiary)]">
                      {t.alreadyVoted ?? 'You have already voted on this proposal'}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-container border border-[var(--border-default)] bg-[var(--bg-surface-nested)] p-6 text-center">
          <p className="mb-4 text-sm text-[var(--fg-secondary)]">
            {t.noProposals ?? 'No active proposals for this claim'}
          </p>
          <button
            type="button"
            onClick={() => setShowCreateSheet(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-firefly-gold)] px-4 py-2 text-sm font-medium text-[var(--bg-default)] transition-opacity hover:opacity-90"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            {t.createProposal ?? 'Create Proposal'}
          </button>
        </div>
      )}

      {/* Past proposals (collapsed) */}
      {pastProposals.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-sm text-[var(--fg-tertiary)] hover:text-[var(--fg-secondary)]">
            {pastProposals.length} past proposal{pastProposals.length !== 1 ? 's' : ''}
          </summary>
          <div className="mt-2 space-y-2">
            {pastProposals.map((proposal) => (
              <VerdictProposalCard key={proposal.id} proposal={proposal} />
            ))}
          </div>
        </details>
      )}

      {/* Create proposal sheet */}
      {showCreateSheet && (
        <CreateProposalSheet
          claimId={claimId}
          claimStatement={claimStatement}
          collectives={userCollectives}
          onSubmit={handleCreateProposal}
          onClose={() => setShowCreateSheet(false)}
        />
      )}
    </section>
  );
}
