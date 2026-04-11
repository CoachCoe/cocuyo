'use client';

/**
 * Campaign service hook.
 *
 * Provides campaign operations with integrated wallet state from useSigner().
 * Handles both mock and chain implementations based on NEXT_PUBLIC_USE_CHAIN.
 */

import { useCallback, useRef } from 'react';
import type {
  CampaignService,
  Campaign,
  CampaignId,
  CampaignPreview,
  CampaignStatus,
  NewCampaign,
  PaginationParams,
  PaginatedResult,
  Result,
  PostId,
} from '@cocuyo/types';
import {
  ok,
  err,
  createCampaignId,
  createEscrowId,
  createTransactionHash,
} from '@cocuyo/types';
import { calculateCIDFromJSON } from '@cocuyo/bulletin';
import { useSigner } from '@/lib/context/SignerContext';
import { getBulletinClient } from '@/lib/chain/client';
import { fetchFromBulletin } from '../service-utils';

export type Locale = 'en' | 'es';

const USE_CHAIN = process.env.NEXT_PUBLIC_USE_CHAIN === 'true';

// Session cache for user-created campaigns
const userCampaigns: Campaign[] = [];

function campaignToPreview(campaign: Campaign): CampaignPreview {
  // Calculate deliverable progress
  const totalTarget = campaign.deliverables.reduce((sum, d) => sum + d.target, 0);
  const totalCurrent = campaign.deliverables.reduce((sum, d) => sum + d.current, 0);
  const deliverableProgress = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0;

  return {
    id: campaign.id,
    title: campaign.title,
    topics: campaign.topics,
    ...(campaign.location !== undefined && { location: campaign.location }),
    sponsor: campaign.sponsor,
    status: campaign.status,
    fundingAmount: campaign.fundingAmount,
    payoutMode: campaign.payoutMode,
    contributionCount: campaign.contributingPostIds.length,
    deliverableProgress,
    expiresAt: campaign.expiresAt,
  };
}

/**
 * Hook providing campaign service operations.
 *
 * Write operations use wallet state from useSigner().
 * Read operations work without wallet connection.
 */
export function useCampaignService(): CampaignService {
  const { selectedAccount, isConnected } = useSigner();

  const accountRef = useRef(selectedAccount);
  accountRef.current = selectedAccount;

  const connectedRef = useRef(isConnected);
  connectedRef.current = isConnected;

  const getCampaign = useCallback(
    async (id: CampaignId, _locale = 'en'): Promise<Campaign | null> => {
      // Check user campaigns first
      const userCampaign = userCampaigns.find((c) => c.id === id);
      if (userCampaign) return userCampaign;

      if (USE_CHAIN) {
        try {
          const bulletin = await getBulletinClient();
          return await bulletin.fetchJson<Campaign>(id);
        } catch {
          return null;
        }
      }

      // Try fetching from Bulletin Chain
      return fetchFromBulletin<Campaign>(id);
    },
    []
  );

  const getCampaigns = useCallback(
    async (params: {
      status?: CampaignStatus;
      topic?: string;
      location?: string;
      sponsorType?: 'outlet' | 'collective' | 'community';
      locale?: string;
      pagination: PaginationParams;
    }): Promise<PaginatedResult<CampaignPreview>> => {
      let campaigns = userCampaigns.map(campaignToPreview);

      // Filter by status
      if (params.status !== undefined) {
        campaigns = campaigns.filter((c) => c.status === params.status);
      }

      // Filter by sponsor type
      if (params.sponsorType !== undefined) {
        campaigns = campaigns.filter((c) => c.sponsor.type === params.sponsorType);
      }

      // Filter by topic
      if (params.topic !== undefined) {
        const topicLower = params.topic.toLowerCase();
        campaigns = campaigns.filter((c) =>
          c.topics.some((t: string) => t.toLowerCase().includes(topicLower))
        );
      }

      // Filter by location
      if (params.location !== undefined) {
        const locationLower = params.location.toLowerCase();
        campaigns = campaigns.filter(
          (c) => c.location?.toLowerCase().includes(locationLower) ?? false
        );
      }

      // Apply pagination
      const { limit, offset } = params.pagination;
      const paginatedItems = campaigns.slice(offset, offset + limit);

      return {
        items: paginatedItems,
        total: campaigns.length,
        hasMore: offset + limit < campaigns.length,
      };
    },
    []
  );

  const getActiveCampaigns = useCallback(
    async (params: {
      topic?: string;
      location?: string;
      locale?: string;
      pagination: PaginationParams;
    }): Promise<PaginatedResult<CampaignPreview>> => {
      return getCampaigns({
        ...params,
        status: 'active',
      });
    },
    [getCampaigns]
  );

  const createCampaign = useCallback(
    async (newCampaign: NewCampaign): Promise<Result<CampaignId, string>> => {
      const account = accountRef.current;
      const connected = connectedRef.current;

      if (!connected || !account) {
        return err('Wallet not connected. Please connect to create a campaign.');
      }

      if (USE_CHAIN) {
        return err(
          'On-chain campaign creation requires DIM signing infrastructure. ' +
          'Use mock mode (NEXT_PUBLIC_USE_CHAIN=false) for demos.'
        );
      }

      const now = Date.now();

      const campaign: Campaign = {
        id: '' as CampaignId,
        title: newCampaign.title,
        description: newCampaign.description,
        topics: newCampaign.topics,
        ...(newCampaign.location !== undefined && { location: newCampaign.location }),
        sponsor: newCampaign.sponsor,
        status: 'active',
        fundingAmount: newCampaign.fundingAmount,
        escrowId: createEscrowId(`escrow-${Date.now()}`),
        fundingTxHash: createTransactionHash(`0x${Date.now().toString(16)}`),
        payoutMode: newCampaign.payoutMode ?? 'private',
        deliverables: newCampaign.deliverables.map((d) => ({ ...d, current: 0 })),
        contributingPostIds: [],
        ...(newCampaign.targetClaimIds !== undefined && { targetClaimIds: newCampaign.targetClaimIds }),
        createdAt: now,
        expiresAt: now + newCampaign.duration * 1000,
      };

      // Generate CID-based ID
      const cid = calculateCIDFromJSON(campaign);
      const campaignWithId: Campaign = { ...campaign, id: createCampaignId(cid) };

      // Add to session cache
      userCampaigns.unshift(campaignWithId);

      return ok(campaignWithId.id);
    },
    []
  );

  const contributeToCampaign = useCallback(
    async (campaignId: CampaignId, postId: PostId): Promise<Result<void, string>> => {
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

      // Find campaign in user cache
      const campaignIndex = userCampaigns.findIndex((c) => c.id === campaignId);
      if (campaignIndex !== -1) {
        const oldCampaign = userCampaigns[campaignIndex];
        if (oldCampaign) {
          userCampaigns[campaignIndex] = {
            ...oldCampaign,
            contributingPostIds: [...oldCampaign.contributingPostIds, postId],
          };
          return ok(undefined);
        }
      }

      // Campaign not found in user cache
      return err('Campaign not found or is read-only.');
    },
    []
  );

  return {
    getCampaign,
    getCampaigns,
    getActiveCampaigns,
    createCampaign,
    contributeToCampaign,
  };
}
