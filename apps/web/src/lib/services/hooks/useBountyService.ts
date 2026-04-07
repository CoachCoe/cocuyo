'use client';

/**
 * Bounty service hook.
 *
 * Provides bounty operations with integrated wallet state from useSigner().
 * Handles both mock and chain implementations based on NEXT_PUBLIC_USE_CHAIN.
 */

import { useCallback, useRef } from 'react';
import type {
  BountyService,
  Bounty,
  BountyId,
  BountyPreview,
  NewBounty,
  PaginationParams,
  PaginatedResult,
  Result,
  PostId,
} from '@cocuyo/types';
import {
  ok,
  err,
  createBountyId,
  createEscrowId,
  createTransactionHash,
  createDIMCredential,
} from '@cocuyo/types';
import { calculateCIDFromJSON } from '@cocuyo/bulletin';
import { useSigner } from '@/lib/context/SignerContext';
import { getBulletinClient } from '@/lib/chain/client';
import { fetchFromBulletin } from '../service-utils';

export type Locale = 'en' | 'es';

const USE_CHAIN = process.env.NEXT_PUBLIC_USE_CHAIN === 'true';

// Session cache for user-created bounties
const userBounties: Bounty[] = [];

function bountyToPreview(bounty: Bounty): BountyPreview {
  return {
    id: bounty.id,
    title: bounty.title,
    topics: bounty.topics,
    ...(bounty.location !== undefined && { location: bounty.location }),
    status: bounty.status,
    fundingAmount: bounty.fundingAmount,
    contributionCount: bounty.contributingPostIds.length,
    payoutMode: bounty.payoutMode,
    expiresAt: bounty.expiresAt,
  };
}

/**
 * Hook providing bounty service operations.
 *
 * Write operations use wallet state from useSigner().
 * Read operations work without wallet connection.
 */
export function useBountyService(): BountyService {
  const { selectedAccount, isConnected } = useSigner();

  const accountRef = useRef(selectedAccount);
  accountRef.current = selectedAccount;

  const connectedRef = useRef(isConnected);
  connectedRef.current = isConnected;

  const getBounty = useCallback(
    async (id: BountyId, _locale = 'en'): Promise<Bounty | null> => {
      // Check user bounties first
      const userBounty = userBounties.find((b) => b.id === id);
      if (userBounty) return userBounty;

      if (USE_CHAIN) {
        try {
          const bulletin = await getBulletinClient();
          return await bulletin.fetchJson<Bounty>(id);
        } catch {
          return null;
        }
      }

      // Try fetching from Bulletin Chain
      return fetchFromBulletin<Bounty>(id);
    },
    []
  );

  const getOpenBounties = useCallback(
    async (params: {
      topic?: string;
      location?: string;
      locale?: string;
      pagination: PaginationParams;
    }): Promise<PaginatedResult<BountyPreview>> => {
      // Return only user-created open bounties
      let bounties = userBounties
        .filter((b) => b.status === 'open')
        .map(bountyToPreview);

      // Filter by topic
      if (params.topic !== undefined) {
        const topicLower = params.topic.toLowerCase();
        bounties = bounties.filter((b) =>
          b.topics.some((t) => t.toLowerCase().includes(topicLower))
        );
      }

      // Filter by location
      if (params.location !== undefined) {
        const locationLower = params.location.toLowerCase();
        bounties = bounties.filter(
          (b) => b.location?.toLowerCase().includes(locationLower) ?? false
        );
      }

      // Apply pagination
      const { limit, offset } = params.pagination;
      const paginatedItems = bounties.slice(offset, offset + limit);

      return {
        items: paginatedItems,
        total: bounties.length,
        hasMore: offset + limit < bounties.length,
      };
    },
    []
  );

  const createBounty = useCallback(
    async (newBounty: NewBounty): Promise<Result<BountyId, string>> => {
      const account = accountRef.current;
      const connected = connectedRef.current;

      if (!connected || !account) {
        return err('Wallet not connected. Please connect to create a bounty.');
      }

      if (USE_CHAIN) {
        return err(
          'On-chain bounty creation requires DIM signing infrastructure. ' +
          'Use mock mode (NEXT_PUBLIC_USE_CHAIN=false) for demos.'
        );
      }

      // Session-cached implementation
      const connectedAddress = account.address;
      const dimCredential = createDIMCredential(`dim-${connectedAddress.slice(2, 14)}`);
      const now = Date.now();

      const bounty: Bounty = {
        id: '' as BountyId,
        title: newBounty.title,
        description: newBounty.description,
        topics: newBounty.topics,
        ...(newBounty.location !== undefined && { location: newBounty.location }),
        status: 'open',
        fundingAmount: newBounty.fundingAmount,
        funderCredential: dimCredential,
        escrowId: createEscrowId(`escrow-${Date.now()}`),
        fundingTxHash: createTransactionHash(`0x${Date.now().toString(16)}`),
        payoutMode: newBounty.payoutMode ?? 'private',
        contributingPostIds: [],
        createdAt: now,
        expiresAt: now + newBounty.duration * 1000,
      };

      // Generate CID-based ID
      const cid = calculateCIDFromJSON(bounty);
      const bountyWithId: Bounty = { ...bounty, id: createBountyId(cid) };

      // Add to session cache
      userBounties.unshift(bountyWithId);

      return ok(bountyWithId.id);
    },
    []
  );

  const contributeToBounty = useCallback(
    async (bountyId: BountyId, postId: PostId): Promise<Result<void, string>> => {
      const connected = connectedRef.current;

      if (!connected) {
        return err('Wallet not connected. Please connect to contribute.');
      }

      if (USE_CHAIN) {
        return err(
          'On-chain contributions require DIM signing infrastructure. ' +
          'Use mock mode (NEXT_PUBLIC_USE_CHAIN=false) for demos.'
        );
      }

      // Find bounty in user cache
      const bountyIndex = userBounties.findIndex((b) => b.id === bountyId);
      if (bountyIndex !== -1) {
        const oldBounty = userBounties[bountyIndex];
        if (oldBounty) {
          userBounties[bountyIndex] = {
            ...oldBounty,
            contributingPostIds: [...oldBounty.contributingPostIds, postId],
          };
          return ok(undefined);
        }
      }

      // Bounty not found in user cache
      return err('Bounty not found or is read-only.');
    },
    []
  );

  return {
    getBounty,
    getOpenBounties,
    createBounty,
    contributeToBounty,
  };
}
