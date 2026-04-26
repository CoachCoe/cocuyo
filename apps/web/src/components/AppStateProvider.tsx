'use client';

/**
 * AppStateProvider — Central session state management for the Firefly Network.
 *
 * Manages session state with localStorage persistence for claims.
 * Claims are stored on Bulletin Chain and indexed in localStorage for
 * cross-session persistence.
 *
 * Key design principles:
 * - Single source of truth for all entities
 * - Derived data computed from core entities
 * - Actions return the created/modified entity
 * - Integrates with wallet state via useSigner
 * - Claims persist across page refreshes via localStorage index
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
  type ReactElement,
} from 'react';
import type {
  Post,
  PostId,
  NewPost,
  Corroboration,
  CorroborationId,
  CorroborationType,
  EvidenceType,
  EvidenceQuality,
  Claim,
  ClaimId,
  Campaign,
  CampaignId,
  StoryChain,
  ChainId,
  Verdict,
  VerdictId,
  VerdictStatus,
  DIMCredential,
} from '@cocuyo/types';
import {
  createPostId,
  createChainId,
  createClaimId,
  createCampaignId,
  createCorroborationId,
  createVerdictId,
  createDIMCredential,
  createCollectiveId,
  createOutletId,
  createPUSDAmount,
  createEscrowId,
  createTransactionHash,
  emptyCorroborationSummary,
} from '@cocuyo/types';
import { useSigner } from '@/lib/context/SignerContext';
import { uploadToBulletin } from '@/lib/services/service-utils';
import { indexClaim, loadClaimIndex, fetchClaims, cacheClaim } from '@/lib/services/claim-service';
import {
  seedPosts,
  seedStoryChains,
  seedCampaigns,
  seedCorroborations,
  seedClaims,
  seedPostClaims,
  seedPostCorroborations,
  seedPostCampaigns,
  seedCampaignPosts,
} from '@/lib/seed-data';

// ============================================================================
// Types
// ============================================================================

/** Evidence input for corroborate/dispute actions */
export interface EvidenceInput {
  type: EvidenceType;
  content: string;
  description?: string;
}

/** Input for creating a campaign */
export interface NewCampaignInput {
  title: string;
  description: string;
  topics: string[];
  fundingAmount: number;
  expiresInDays: number;
  targetClaimIds?: ClaimId[];
}

/** Input for issuing a verdict */
export interface VerdictInput {
  status: VerdictStatus;
  rationale: string;
}

/** User state within the app */
interface CurrentUser {
  /** Whether wallet is connected */
  isConnected: boolean;
  /** Whether user can create bounties (outlet/collective mode) */
  isOutletAccount: boolean;
  /** DIM credential hash (derived from wallet address) */
  credentialHash: DIMCredential | null;
  /** User's pseudonym */
  pseudonym: string | null;
  /** IDs of posts created by this user in current session */
  createdPostIds: PostId[];
  /** IDs of stories created by this user in current session */
  createdStoryIds: ChainId[];
  /** IDs of corroborations made by this user in current session */
  corroborationIds: CorroborationId[];
}

/** Core application state */
interface AppState {
  // Core entities
  posts: Map<PostId, Post>;
  corroborations: Map<CorroborationId, Corroboration>;
  claims: Map<ClaimId, Claim>;
  campaigns: Map<CampaignId, Campaign>;
  storyChains: Map<ChainId, StoryChain>;
  verdicts: Map<VerdictId, Verdict>;

  // User state
  currentUser: CurrentUser;

  // Derived mappings
  postClaims: Map<PostId, ClaimId[]>;
  postCorroborations: Map<PostId, CorroborationId[]>;
  postCampaigns: Map<PostId, CampaignId[]>;
  campaignPosts: Map<CampaignId, PostId[]>;
  claimVerdicts: Map<ClaimId, VerdictId | null>;
  claimCampaigns: Map<ClaimId, CampaignId[]>;
}

/** Actions available on the app state */
interface AppStateActions {
  /** Create a new post */
  createPost: (input: NewPost) => Post | null;
  /** Submit a corroboration or dispute with evidence (uploads to Bulletin Chain) */
  submitCorroboration: (
    postId: PostId,
    type: 'corroborate' | 'dispute',
    evidence?: EvidenceInput
  ) => Promise<Corroboration | null>;
  /** Extract a claim from a post (uploads to Bulletin Chain) */
  extractClaim: (postId: PostId, statement: string, topics?: string[]) => Promise<Claim | null>;
  /** Create a campaign (requires outlet mode) */
  createCampaign: (input: NewCampaignInput, targetPostId?: PostId) => Campaign | null;
  /** Contribute a post to a campaign */
  contributeToCampaign: (campaignId: CampaignId, postId: PostId) => boolean;
  /** Issue a verdict on a claim (requires outlet mode) */
  issueVerdict: (claimId: ClaimId, verdict: VerdictInput) => Verdict | null;
  /** Submit a claim for fact-checking by collectives */
  submitClaimForFactCheck: (claimId: ClaimId) => boolean;
  /** Create a new story chain */
  createStory: (
    title: string,
    description: string,
    firstPostId: PostId,
    topics?: string[]
  ) => StoryChain | null;
  /** Add a post to an existing story */
  addPostToStory: (chainId: ChainId, postId: PostId) => boolean;
  /** Toggle outlet mode for demos */
  toggleOutletMode: () => void;

  // Getters for convenience
  getPost: (id: PostId) => Post | undefined;
  getClaim: (id: ClaimId) => Claim | undefined;
  getCampaign: (id: CampaignId) => Campaign | undefined;
  getStory: (id: ChainId) => StoryChain | undefined;
  getPostClaims: (postId: PostId) => Claim[];
  getPostCorroborations: (postId: PostId) => Corroboration[];
  getPostCampaigns: (postId: PostId) => Campaign[];
  getClaimCampaigns: (claimId: ClaimId) => Campaign[];
  getAllPosts: () => Post[];
  getAllClaims: () => Claim[];
  getAllCampaigns: () => Campaign[];
  getAllStories: () => StoryChain[];
}

/** Combined context value */
type AppStateContextValue = AppState & AppStateActions;

// ============================================================================
// Context
// ============================================================================

const AppStateContext = createContext<AppStateContextValue | null>(null);

// ============================================================================
// Helper functions
// ============================================================================

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function generatePseudonym(address: string): string {
  const adjectives = ['Swift', 'Bright', 'Silent', 'Brave', 'Calm', 'Keen', 'Noble', 'Wise'];
  const nouns = ['Firefly', 'Phoenix', 'Falcon', 'Raven', 'Spark', 'Ember', 'Star', 'Light'];

  // Use address to deterministically pick words
  const hash = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const adj = adjectives[hash % adjectives.length];
  const noun = nouns[(hash >> 4) % nouns.length];

  return `${adj}${noun}`;
}

// ============================================================================
// Provider
// ============================================================================

interface AppStateProviderProps {
  children: ReactNode;
}

export function AppStateProvider({ children }: AppStateProviderProps): ReactElement {
  const { selectedAccount, isConnected } = useSigner();

  // Core entity state (initialized with seed data)
  const [posts, setPosts] = useState<Map<PostId, Post>>(() => new Map(seedPosts));
  const [corroborations, setCorroborations] = useState<Map<CorroborationId, Corroboration>>(
    () => new Map(seedCorroborations)
  );
  const [claims, setClaims] = useState<Map<ClaimId, Claim>>(() => new Map(seedClaims));
  const [campaigns, setCampaigns] = useState<Map<CampaignId, Campaign>>(
    () => new Map(seedCampaigns)
  );
  const [storyChains, setStoryChains] = useState<Map<ChainId, StoryChain>>(
    () => new Map(seedStoryChains)
  );
  const [verdicts, setVerdicts] = useState<Map<VerdictId, Verdict>>(new Map());

  // User state
  const [isOutletAccount, setIsOutletAccount] = useState(false);
  const [createdPostIds, setCreatedPostIds] = useState<PostId[]>([]);
  const [createdStoryIds, setCreatedStoryIds] = useState<ChainId[]>([]);
  const [corroborationIds, setCorroborationIds] = useState<CorroborationId[]>([]);

  // Derived mappings (initialized with seed data)
  const [postClaims, setPostClaims] = useState<Map<PostId, ClaimId[]>>(
    () => new Map(seedPostClaims)
  );
  const [postCorroborations, setPostCorroborations] = useState<Map<PostId, CorroborationId[]>>(
    () => new Map(seedPostCorroborations)
  );
  const [postCampaigns, setPostCampaigns] = useState<Map<PostId, CampaignId[]>>(
    () => new Map(seedPostCampaigns)
  );
  const [campaignPosts, setCampaignPosts] = useState<Map<CampaignId, PostId[]>>(
    () => new Map(seedCampaignPosts)
  );
  const [claimVerdicts, setClaimVerdicts] = useState<Map<ClaimId, VerdictId | null>>(new Map());
  const [claimCampaigns, setClaimCampaigns] = useState<Map<ClaimId, CampaignId[]>>(new Map());

  // Load persisted claims from localStorage on mount
  useEffect(() => {
    let mounted = true;

    async function loadPersistedClaims(): Promise<void> {
      try {
        const index = await loadClaimIndex();

        // Fetch all persisted claims from Bulletin Chain
        const persistedClaims = await fetchClaims(index.all);

        if (!mounted) return;

        // Merge persisted claims with seed data
        setClaims((prev) => {
          const merged = new Map(prev);
          for (const claim of persistedClaims) {
            merged.set(claim.id, claim);
            // Also cache in claim-service for consistency
            cacheClaim(claim);
          }
          return merged;
        });

        // Update postClaims mapping
        setPostClaims((prev) => {
          const merged = new Map(prev);
          for (const [postId, claimIds] of Object.entries(index.byPost)) {
            const existing = merged.get(postId as PostId) ?? [];
            const newIds = claimIds.filter((id) => !existing.includes(id as ClaimId));
            if (newIds.length > 0) {
              merged.set(postId as PostId, [...existing, ...(newIds as ClaimId[])]);
            }
          }
          return merged;
        });
      } catch (error) {
        // Log error for debugging - localStorage or Bulletin fetch may have failed
        console.warn('[AppStateProvider] Failed to load persisted claims:', error);
      }
    }

    void loadPersistedClaims();

    return () => {
      mounted = false;
    };
  }, []);

  // Compute current user from wallet state
  const currentUser: CurrentUser = useMemo(() => {
    if (!isConnected || !selectedAccount) {
      return {
        isConnected: false,
        isOutletAccount: false,
        credentialHash: null,
        pseudonym: null,
        createdPostIds: [],
        createdStoryIds: [],
        corroborationIds: [],
      };
    }

    const address = selectedAccount.address;
    const credentialHash = createDIMCredential(`dim-${address.slice(0, 16)}`);
    const pseudonym = generatePseudonym(address);

    return {
      isConnected: true,
      isOutletAccount,
      credentialHash,
      pseudonym,
      createdPostIds,
      createdStoryIds,
      corroborationIds,
    };
  }, [
    isConnected,
    selectedAccount,
    isOutletAccount,
    createdPostIds,
    createdStoryIds,
    corroborationIds,
  ]);

  // ============================================================================
  // Actions
  // ============================================================================

  const createPost = useCallback(
    (input: NewPost): Post | null => {
      if (
        !currentUser.isConnected ||
        currentUser.credentialHash === null ||
        currentUser.pseudonym === null
      ) {
        return null;
      }

      const now = Date.now();
      const id = createPostId(generateId());

      const post: Post = {
        id,
        author: {
          id: selectedAccount?.address ?? '',
          credentialHash: currentUser.credentialHash,
          pseudonym: currentUser.pseudonym,
          disclosureLevel: 'anonymous',
        },
        content: {
          ...(input.content.title !== undefined && { title: input.content.title }),
          text: input.content.text,
          ...(input.content.links !== undefined && { links: input.content.links }),
          ...(input.content.media !== undefined && { media: input.content.media }),
        },
        context: {
          topics: [...input.context.topics],
          ...(input.context.locationName !== undefined && {
            locationName: input.context.locationName,
          }),
          ...(input.context.location !== undefined && { location: input.context.location }),
          ...(input.context.timeframe !== undefined && { timeframe: input.context.timeframe }),
        },
        dimSignature: currentUser.credentialHash,
        status: 'published',
        chainLinks: input.chainLinks ?? [],
        corroborations: emptyCorroborationSummary(),
        verification: { status: 'unverified' },
        createdAt: now,
      };

      setPosts((prev) => new Map(prev).set(id, post));
      setCreatedPostIds((prev) => [...prev, id]);

      return post;
    },
    [currentUser, selectedAccount]
  );

  const submitCorroboration = useCallback(
    async (
      postId: PostId,
      type: 'corroborate' | 'dispute',
      evidence?: EvidenceInput
    ): Promise<Corroboration | null> => {
      if (!currentUser.isConnected || !currentUser.credentialHash) {
        return null;
      }

      const post = posts.get(postId);
      if (!post) {
        return null;
      }

      const now = Date.now();

      const corroborationType: CorroborationType =
        type === 'dispute'
          ? 'challenge'
          : evidence?.type === 'observation'
            ? 'witness'
            : 'evidence';

      // Determine evidence quality based on type and evidence
      const quality: EvidenceQuality =
        type === 'dispute'
          ? 'unverified'
          : evidence?.type === 'observation'
            ? 'observation'
            : evidence
              ? 'documented'
              : 'unverified';

      // Build corroboration without ID first (ID will be CID from Bulletin)
      const corroborationData = {
        postId,
        type: corroborationType,
        dimSignature: currentUser.credentialHash,
        quality,
        createdAt: now,
        ...(evidence !== undefined && {
          evidenceType: evidence.type,
          evidenceContent: evidence.content,
          ...(evidence.description !== undefined && { evidenceDescription: evidence.description }),
        }),
      };

      // Upload to Bulletin Chain
      const uploadResult = await uploadToBulletin(corroborationData);
      if (!uploadResult.ok) {
        // Bulletin upload failed - return null
        return null;
      }

      // Use CID as the corroboration ID
      const id = createCorroborationId(uploadResult.value.cid);
      const corroboration: Corroboration = { id, ...corroborationData };

      setCorroborations((prev) => new Map(prev).set(id, corroboration));
      setCorroborationIds((prev) => [...prev, id]);

      // Update post-corroborations mapping
      setPostCorroborations((prev) => {
        const newMap = new Map(prev);
        const existing = newMap.get(postId) ?? [];
        newMap.set(postId, [...existing, id]);
        return newMap;
      });

      // Update post's corroboration summary
      setPosts((prev) => {
        const newMap = new Map(prev);
        const existingPost = newMap.get(postId);
        if (existingPost) {
          const summary = { ...existingPost.corroborations };
          if (type === 'dispute') {
            summary.challengeCount += 1;
          } else if (evidence?.type === 'observation') {
            summary.witnessCount += 1;
          } else {
            summary.evidenceCount += 1;
          }
          newMap.set(postId, { ...existingPost, corroborations: summary });
        }
        return newMap;
      });

      return corroboration;
    },
    [currentUser, posts]
  );

  const extractClaim = useCallback(
    async (postId: PostId, statement: string, topics?: string[]): Promise<Claim | null> => {
      if (!currentUser.isConnected || !currentUser.credentialHash) {
        return null;
      }

      const post = posts.get(postId);
      if (!post) {
        return null;
      }

      const now = Date.now();

      // Build claim without ID first (ID will be CID from Bulletin)
      const claimData = {
        statement,
        sourcePostId: postId,
        extractedBy: currentUser.credentialHash,
        topics: topics ?? [...post.context.topics],
        evidence: [],
        status: 'pending' as const,
        createdAt: now,
        updatedAt: now,
      };

      // Upload to Bulletin Chain
      const uploadResult = await uploadToBulletin(claimData);
      if (!uploadResult.ok) {
        // Bulletin upload failed - return null
        return null;
      }

      // Use CID as the claim ID
      const id = createClaimId(uploadResult.value.cid);
      const claim: Claim = { id, ...claimData };

      // Cache in claim-service for consistency
      cacheClaim(claim);

      // Persist to localStorage index (survives page refresh)
      await indexClaim(id, postId);

      setClaims((prev) => new Map(prev).set(id, claim));

      // Update post-claims mapping
      setPostClaims((prev) => {
        const newMap = new Map(prev);
        const existing = newMap.get(postId) ?? [];
        newMap.set(postId, [...existing, id]);
        return newMap;
      });

      return claim;
    },
    [currentUser, posts]
  );

  const createCampaign = useCallback(
    (input: NewCampaignInput, targetPostId?: PostId): Campaign | null => {
      // Allow any connected user with credentials (personhood check happens in UI)
      if (!currentUser.isConnected || !currentUser.credentialHash || !currentUser.pseudonym) {
        return null;
      }

      const now = Date.now();
      const id = createCampaignId(generateId());
      const expiresAt = now + input.expiresInDays * 24 * 60 * 60 * 1000;

      // Convert dollars to smallest unit (6 decimals, 1 pUSD = 1,000,000 units)
      // Use string parsing to avoid floating point multiplication errors
      // e.g., 0.000001 * 1_000_000 can produce 0.9999999999999999 instead of 1
      const amountStr = input.fundingAmount.toFixed(6);
      const [whole = '0', decimal = ''] = amountStr.split('.');
      const paddedDecimal = decimal.padEnd(6, '0').slice(0, 6);
      const fundingUnits = BigInt(whole + paddedDecimal);

      // Use outlet sponsor if in outlet mode, otherwise firefly sponsor
      const sponsor: Campaign['sponsor'] = currentUser.isOutletAccount
        ? {
            type: 'outlet',
            id: createOutletId('demo-outlet'),
            name: 'Demo Outlet',
          }
        : {
            type: 'firefly',
            credential: currentUser.credentialHash,
            pseudonym: currentUser.pseudonym,
          };

      const campaign: Campaign = {
        id,
        title: input.title,
        description: input.description,
        topics: input.topics,
        sponsor,
        fundingAmount: createPUSDAmount(fundingUnits),
        escrowId: createEscrowId(`escrow-${generateId()}`),
        fundingTxHash: createTransactionHash(`0x${generateId()}`),
        contributingPostIds: targetPostId ? [targetPostId] : [],
        ...(input.targetClaimIds !== undefined &&
          input.targetClaimIds.length > 0 && { targetClaimIds: input.targetClaimIds }),
        deliverables: [{ type: 'evidence_gathered', target: 10, current: 0 }],
        payoutMode: 'public',
        status: 'active',
        createdAt: now,
        expiresAt,
      };

      setCampaigns((prev) => new Map(prev).set(id, campaign));

      // If there's a target post, update the mappings
      if (targetPostId) {
        setPostCampaigns((prev) => {
          const newMap = new Map(prev);
          const existing = newMap.get(targetPostId) ?? [];
          newMap.set(targetPostId, [...existing, id]);
          return newMap;
        });

        setCampaignPosts((prev) => {
          const newMap = new Map(prev);
          newMap.set(id, [targetPostId]);
          return newMap;
        });
      }

      // Update claim-campaign mappings
      if (input.targetClaimIds !== undefined && input.targetClaimIds.length > 0) {
        setClaimCampaigns((prev) => {
          const newMap = new Map(prev);
          for (const claimId of input.targetClaimIds ?? []) {
            const existing = newMap.get(claimId) ?? [];
            newMap.set(claimId, [...existing, id]);
          }
          return newMap;
        });
      }

      return campaign;
    },
    [currentUser]
  );

  const contributeToCampaign = useCallback(
    (campaignId: CampaignId, postId: PostId): boolean => {
      if (!currentUser.isConnected) {
        return false;
      }

      const campaign = campaigns.get(campaignId);
      const post = posts.get(postId);
      if (!campaign || !post) {
        return false;
      }

      // Update campaign
      setCampaigns((prev) => {
        const newMap = new Map(prev);
        const existing = newMap.get(campaignId);
        if (existing && !existing.contributingPostIds.includes(postId)) {
          newMap.set(campaignId, {
            ...existing,
            contributingPostIds: [...existing.contributingPostIds, postId],
          });
        }
        return newMap;
      });

      // Update mappings
      setPostCampaigns((prev) => {
        const newMap = new Map(prev);
        const existing = newMap.get(postId) ?? [];
        if (!existing.includes(campaignId)) {
          newMap.set(postId, [...existing, campaignId]);
        }
        return newMap;
      });

      setCampaignPosts((prev) => {
        const newMap = new Map(prev);
        const existing = newMap.get(campaignId) ?? [];
        if (!existing.includes(postId)) {
          newMap.set(campaignId, [...existing, postId]);
        }
        return newMap;
      });

      return true;
    },
    [currentUser, campaigns, posts]
  );

  const issueVerdict = useCallback(
    (claimId: ClaimId, input: VerdictInput): Verdict | null => {
      if (!currentUser.isConnected || !currentUser.isOutletAccount) {
        return null;
      }

      const claim = claims.get(claimId);
      if (!claim) {
        return null;
      }

      const now = Date.now();
      const id = createVerdictId(generateId());
      const collectiveId = createCollectiveId('demo-collective');

      const verdict: Verdict = {
        id,
        claimId,
        collectiveId,
        status: input.status,
        rationale: input.rationale,
        issuedAt: now,
      };

      setVerdicts((prev) => new Map(prev).set(id, verdict));

      // Update claim-verdicts mapping
      setClaimVerdicts((prev) => {
        const newMap = new Map(prev);
        newMap.set(claimId, id);
        return newMap;
      });

      // Update claim status based on verdict
      setClaims((prev) => {
        const newMap = new Map(prev);
        const existing = newMap.get(claimId);
        if (existing) {
          // Map VerdictStatus to ClaimStatus
          const statusMap: Record<VerdictStatus, Claim['status']> = {
            confirmed: 'verified',
            disputed: 'disputed',
            false: 'false',
            synthetic: 'false',
            inconclusive: 'unverifiable',
          };
          const newStatus = statusMap[input.status];

          newMap.set(claimId, {
            ...existing,
            status: newStatus,
            verdict: {
              status: newStatus,
              collectiveId,
              reasoning: input.rationale,
              issuedAt: now,
            },
            updatedAt: now,
          });
        }
        return newMap;
      });

      return verdict;
    },
    [currentUser, claims]
  );

  const submitClaimForFactCheck = useCallback(
    (claimId: ClaimId): boolean => {
      if (!currentUser.isConnected) {
        return false;
      }

      const claim = claims.get(claimId);
      // Only allow submission of pending claims
      if (!claim || claim.status !== 'pending') {
        return false;
      }

      // Update claim status to under_review to indicate it's been submitted
      setClaims((prev) => {
        const newMap = new Map(prev);
        const existing = newMap.get(claimId);
        if (existing && existing.status === 'pending') {
          newMap.set(claimId, {
            ...existing,
            status: 'under_review',
            updatedAt: Date.now(),
          });
        }
        return newMap;
      });

      return true;
    },
    [currentUser, claims]
  );

  const createStory = useCallback(
    (
      title: string,
      description: string,
      firstPostId: PostId,
      topics?: string[]
    ): StoryChain | null => {
      if (!currentUser.isConnected) {
        return null;
      }

      const post = posts.get(firstPostId);
      if (!post) {
        return null;
      }

      const now = Date.now();
      const id = createChainId(generateId());

      const chain: StoryChain = {
        id,
        title,
        description,
        topics: topics ?? [...post.context.topics],
        status: 'emerging',
        postIds: [firstPostId],
        stats: {
          postCount: 1,
          corroborationCount: 0,
          challengeCount: 0,
          contributorCount: 1,
        },
        createdAt: now,
        updatedAt: now,
      };

      setStoryChains((prev) => new Map(prev).set(id, chain));
      setCreatedStoryIds((prev) => [...prev, id]);

      // Update post's chainLinks
      setPosts((prev) => {
        const newMap = new Map(prev);
        const existing = newMap.get(firstPostId);
        if (existing) {
          newMap.set(firstPostId, {
            ...existing,
            chainLinks: [...existing.chainLinks, id],
          });
        }
        return newMap;
      });

      return chain;
    },
    [currentUser, posts]
  );

  const addPostToStory = useCallback(
    (chainId: ChainId, postId: PostId): boolean => {
      if (!currentUser.isConnected) {
        return false;
      }

      const chain = storyChains.get(chainId);
      const post = posts.get(postId);
      if (!chain || !post) {
        return false;
      }

      if (chain.postIds.includes(postId)) {
        return false; // Already in chain
      }

      const now = Date.now();

      // Update chain
      setStoryChains((prev) => {
        const newMap = new Map(prev);
        const existing = newMap.get(chainId);
        if (existing) {
          newMap.set(chainId, {
            ...existing,
            postIds: [...existing.postIds, postId],
            stats: {
              ...existing.stats,
              postCount: existing.stats.postCount + 1,
            },
            updatedAt: now,
          });
        }
        return newMap;
      });

      // Update post's chainLinks
      setPosts((prev) => {
        const newMap = new Map(prev);
        const existing = newMap.get(postId);
        if (existing && !existing.chainLinks.includes(chainId)) {
          newMap.set(postId, {
            ...existing,
            chainLinks: [...existing.chainLinks, chainId],
          });
        }
        return newMap;
      });

      return true;
    },
    [currentUser, storyChains, posts]
  );

  const toggleOutletMode = useCallback((): void => {
    setIsOutletAccount((prev) => !prev);
  }, []);

  // ============================================================================
  // Getters
  // ============================================================================

  const getPost = useCallback(
    (id: PostId): Post | undefined => {
      return posts.get(id);
    },
    [posts]
  );

  const getClaim = useCallback(
    (id: ClaimId): Claim | undefined => {
      return claims.get(id);
    },
    [claims]
  );

  const getCampaign = useCallback(
    (id: CampaignId): Campaign | undefined => {
      return campaigns.get(id);
    },
    [campaigns]
  );

  const getStory = useCallback(
    (id: ChainId): StoryChain | undefined => {
      return storyChains.get(id);
    },
    [storyChains]
  );

  const getPostClaims = useCallback(
    (postId: PostId): Claim[] => {
      const claimIds = postClaims.get(postId) ?? [];
      return claimIds.map((id) => claims.get(id)).filter((c): c is Claim => c !== undefined);
    },
    [postClaims, claims]
  );

  const getPostCorroborations = useCallback(
    (postId: PostId): Corroboration[] => {
      const ids = postCorroborations.get(postId) ?? [];
      return ids
        .map((id) => corroborations.get(id))
        .filter((c): c is Corroboration => c !== undefined);
    },
    [postCorroborations, corroborations]
  );

  const getPostCampaigns = useCallback(
    (postId: PostId): Campaign[] => {
      const ids = postCampaigns.get(postId) ?? [];
      return ids.map((id) => campaigns.get(id)).filter((c): c is Campaign => c !== undefined);
    },
    [postCampaigns, campaigns]
  );

  const getClaimCampaigns = useCallback(
    (claimId: ClaimId): Campaign[] => {
      const ids = claimCampaigns.get(claimId) ?? [];
      return ids.map((id) => campaigns.get(id)).filter((c): c is Campaign => c !== undefined);
    },
    [claimCampaigns, campaigns]
  );

  const getAllPosts = useCallback((): Post[] => {
    return Array.from(posts.values()).sort((a, b) => b.createdAt - a.createdAt);
  }, [posts]);

  const getAllClaims = useCallback((): Claim[] => {
    return Array.from(claims.values()).sort((a, b) => b.createdAt - a.createdAt);
  }, [claims]);

  const getAllCampaigns = useCallback((): Campaign[] => {
    return Array.from(campaigns.values()).sort((a, b) => b.createdAt - a.createdAt);
  }, [campaigns]);

  const getAllStories = useCallback((): StoryChain[] => {
    return Array.from(storyChains.values()).sort((a, b) => b.updatedAt - a.updatedAt);
  }, [storyChains]);

  // ============================================================================
  // Context Value
  // ============================================================================

  const value = useMemo(
    (): AppStateContextValue => ({
      // State
      posts,
      corroborations,
      claims,
      campaigns,
      storyChains,
      verdicts,
      currentUser,
      postClaims,
      postCorroborations,
      postCampaigns,
      campaignPosts,
      claimVerdicts,
      claimCampaigns,

      // Actions
      createPost,
      submitCorroboration,
      extractClaim,
      createCampaign,
      contributeToCampaign,
      issueVerdict,
      submitClaimForFactCheck,
      createStory,
      addPostToStory,
      toggleOutletMode,

      // Getters
      getPost,
      getClaim,
      getCampaign,
      getStory,
      getPostClaims,
      getPostCorroborations,
      getPostCampaigns,
      getClaimCampaigns,
      getAllPosts,
      getAllClaims,
      getAllCampaigns,
      getAllStories,
    }),
    [
      posts,
      corroborations,
      claims,
      campaigns,
      storyChains,
      verdicts,
      currentUser,
      postClaims,
      postCorroborations,
      postCampaigns,
      campaignPosts,
      claimVerdicts,
      claimCampaigns,
      createPost,
      submitCorroboration,
      extractClaim,
      createCampaign,
      contributeToCampaign,
      issueVerdict,
      submitClaimForFactCheck,
      createStory,
      addPostToStory,
      toggleOutletMode,
      getPost,
      getClaim,
      getCampaign,
      getStory,
      getPostClaims,
      getPostCorroborations,
      getPostCampaigns,
      getClaimCampaigns,
      getAllPosts,
      getAllClaims,
      getAllCampaigns,
      getAllStories,
    ]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to access the app state and actions.
 * Must be used within an AppStateProvider.
 */
export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return ctx;
}
