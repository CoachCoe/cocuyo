'use client';

/**
 * AppStateProvider — Central session state management for the Firefly Network.
 *
 * Manages all session state in memory. No persistence, no mock data.
 * All entities are created through user actions during the session.
 *
 * Key design principles:
 * - Single source of truth for all entities
 * - Derived data computed from core entities
 * - Actions return the created/modified entity
 * - Integrates with wallet state via useSigner
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
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
  Claim,
  ClaimId,
  Bounty,
  BountyId,
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
  createBountyId,
  createCorroborationId,
  createVerdictId,
  createDIMCredential,
  createCollectiveId,
  createPUSDAmount,
  createEscrowId,
  createTransactionHash,
  emptyCorroborationSummary,
} from '@cocuyo/types';
import { useSigner } from '@/lib/context/SignerContext';
import { uploadToBulletin } from '@/lib/services/service-utils';
import {
  seedPosts,
  seedStoryChains,
  seedBounties,
  seedCorroborations,
  seedClaims,
  seedPostClaims,
  seedPostCorroborations,
  seedPostBounties,
  seedBountyPosts,
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

/** Input for creating a bounty */
export interface NewBountyInput {
  title: string;
  description: string;
  topics: string[];
  fundingAmount: number;
  expiresInDays: number;
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
  bounties: Map<BountyId, Bounty>;
  storyChains: Map<ChainId, StoryChain>;
  verdicts: Map<VerdictId, Verdict>;

  // User state
  currentUser: CurrentUser;

  // Derived mappings
  postClaims: Map<PostId, ClaimId[]>;
  postCorroborations: Map<PostId, CorroborationId[]>;
  postBounties: Map<PostId, BountyId[]>;
  bountyPosts: Map<BountyId, PostId[]>;
  claimVerdicts: Map<ClaimId, VerdictId | null>;
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
  /** Create a bounty (requires outlet mode) */
  createBounty: (input: NewBountyInput, targetPostId?: PostId) => Bounty | null;
  /** Contribute a post to a bounty */
  contributeToBounty: (bountyId: BountyId, postId: PostId) => boolean;
  /** Issue a verdict on a claim (requires outlet mode) */
  issueVerdict: (claimId: ClaimId, verdict: VerdictInput) => Verdict | null;
  /** Create a new story chain */
  createStory: (title: string, description: string, firstPostId: PostId, topics?: string[]) => StoryChain | null;
  /** Add a post to an existing story */
  addPostToStory: (chainId: ChainId, postId: PostId) => boolean;
  /** Toggle outlet mode for demos */
  toggleOutletMode: () => void;

  // Getters for convenience
  getPost: (id: PostId) => Post | undefined;
  getClaim: (id: ClaimId) => Claim | undefined;
  getBounty: (id: BountyId) => Bounty | undefined;
  getStory: (id: ChainId) => StoryChain | undefined;
  getPostClaims: (postId: PostId) => Claim[];
  getPostCorroborations: (postId: PostId) => Corroboration[];
  getPostBounties: (postId: PostId) => Bounty[];
  getAllPosts: () => Post[];
  getAllClaims: () => Claim[];
  getAllBounties: () => Bounty[];
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
  const [corroborations, setCorroborations] = useState<Map<CorroborationId, Corroboration>>(() => new Map(seedCorroborations));
  const [claims, setClaims] = useState<Map<ClaimId, Claim>>(() => new Map(seedClaims));
  const [bounties, setBounties] = useState<Map<BountyId, Bounty>>(() => new Map(seedBounties));
  const [storyChains, setStoryChains] = useState<Map<ChainId, StoryChain>>(() => new Map(seedStoryChains));
  const [verdicts, setVerdicts] = useState<Map<VerdictId, Verdict>>(new Map());

  // User state
  const [isOutletAccount, setIsOutletAccount] = useState(false);
  const [createdPostIds, setCreatedPostIds] = useState<PostId[]>([]);
  const [createdStoryIds, setCreatedStoryIds] = useState<ChainId[]>([]);
  const [corroborationIds, setCorroborationIds] = useState<CorroborationId[]>([]);

  // Derived mappings (initialized with seed data)
  const [postClaims, setPostClaims] = useState<Map<PostId, ClaimId[]>>(() => new Map(seedPostClaims));
  const [postCorroborations, setPostCorroborations] = useState<Map<PostId, CorroborationId[]>>(() => new Map(seedPostCorroborations));
  const [postBounties, setPostBounties] = useState<Map<PostId, BountyId[]>>(() => new Map(seedPostBounties));
  const [bountyPosts, setBountyPosts] = useState<Map<BountyId, PostId[]>>(() => new Map(seedBountyPosts));
  const [claimVerdicts, setClaimVerdicts] = useState<Map<ClaimId, VerdictId | null>>(new Map());

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
  }, [isConnected, selectedAccount, isOutletAccount, createdPostIds, createdStoryIds, corroborationIds]);

  // ============================================================================
  // Actions
  // ============================================================================

  const createPost = useCallback((input: NewPost): Post | null => {
    if (!currentUser.isConnected || currentUser.credentialHash === null || currentUser.pseudonym === null) {
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
        ...(input.context.locationName !== undefined && { locationName: input.context.locationName }),
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

    setPosts(prev => new Map(prev).set(id, post));
    setCreatedPostIds(prev => [...prev, id]);

    return post;
  }, [currentUser, selectedAccount]);

  const submitCorroboration = useCallback(async (
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

    const corroborationType: CorroborationType = type === 'dispute' ? 'challenge' :
      evidence?.type === 'observation' ? 'witness' : 'evidence';

    // Build corroboration without ID first (ID will be CID from Bulletin)
    const corroborationData = {
      postId,
      type: corroborationType,
      dimSignature: currentUser.credentialHash,
      weight: 1,
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

    setCorroborations(prev => new Map(prev).set(id, corroboration));
    setCorroborationIds(prev => [...prev, id]);

    // Update post-corroborations mapping
    setPostCorroborations(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(postId) ?? [];
      newMap.set(postId, [...existing, id]);
      return newMap;
    });

    // Update post's corroboration summary
    setPosts(prev => {
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
        summary.totalWeight += 1;
        newMap.set(postId, { ...existingPost, corroborations: summary });
      }
      return newMap;
    });

    return corroboration;
  }, [currentUser, posts]);

  const extractClaim = useCallback(async (
    postId: PostId,
    statement: string,
    topics?: string[]
  ): Promise<Claim | null> => {
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

    setClaims(prev => new Map(prev).set(id, claim));

    // Update post-claims mapping
    setPostClaims(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(postId) ?? [];
      newMap.set(postId, [...existing, id]);
      return newMap;
    });

    return claim;
  }, [currentUser, posts]);

  const createBounty = useCallback((
    input: NewBountyInput,
    targetPostId?: PostId
  ): Bounty | null => {
    if (!currentUser.isConnected || !currentUser.credentialHash || !currentUser.isOutletAccount) {
      return null;
    }

    const now = Date.now();
    const id = createBountyId(generateId());
    const expiresAt = now + (input.expiresInDays * 24 * 60 * 60 * 1000);
    // Convert dollars to cents (bigint) for PUSDAmount
    const fundingCents = BigInt(Math.round(input.fundingAmount * 100));

    const bounty: Bounty = {
      id,
      title: input.title,
      description: input.description,
      topics: input.topics,
      fundingAmount: createPUSDAmount(fundingCents),
      funderCredential: currentUser.credentialHash,
      escrowId: createEscrowId(`escrow-${generateId()}`),
      fundingTxHash: createTransactionHash(`0x${generateId()}`),
      contributingPostIds: targetPostId ? [targetPostId] : [],
      status: 'open',
      payoutMode: 'public',
      createdAt: now,
      expiresAt,
    };

    setBounties(prev => new Map(prev).set(id, bounty));

    // If there's a target post, update the mappings
    if (targetPostId) {
      setPostBounties(prev => {
        const newMap = new Map(prev);
        const existing = newMap.get(targetPostId) ?? [];
        newMap.set(targetPostId, [...existing, id]);
        return newMap;
      });

      setBountyPosts(prev => {
        const newMap = new Map(prev);
        newMap.set(id, [targetPostId]);
        return newMap;
      });
    }

    return bounty;
  }, [currentUser]);

  const contributeToBounty = useCallback((bountyId: BountyId, postId: PostId): boolean => {
    if (!currentUser.isConnected) {
      return false;
    }

    const bounty = bounties.get(bountyId);
    const post = posts.get(postId);
    if (!bounty || !post) {
      return false;
    }

    // Update bounty
    setBounties(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(bountyId);
      if (existing && !existing.contributingPostIds.includes(postId)) {
        newMap.set(bountyId, {
          ...existing,
          contributingPostIds: [...existing.contributingPostIds, postId],
        });
      }
      return newMap;
    });

    // Update mappings
    setPostBounties(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(postId) ?? [];
      if (!existing.includes(bountyId)) {
        newMap.set(postId, [...existing, bountyId]);
      }
      return newMap;
    });

    setBountyPosts(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(bountyId) ?? [];
      if (!existing.includes(postId)) {
        newMap.set(bountyId, [...existing, postId]);
      }
      return newMap;
    });

    return true;
  }, [currentUser, bounties, posts]);

  const issueVerdict = useCallback((claimId: ClaimId, input: VerdictInput): Verdict | null => {
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

    setVerdicts(prev => new Map(prev).set(id, verdict));

    // Update claim-verdicts mapping
    setClaimVerdicts(prev => {
      const newMap = new Map(prev);
      newMap.set(claimId, id);
      return newMap;
    });

    // Update claim status based on verdict
    setClaims(prev => {
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
  }, [currentUser, claims]);

  const createStory = useCallback((
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
        totalCorroborations: 0,
        totalChallenges: 0,
        contributorCount: 1,
        totalWeight: 0,
      },
      createdAt: now,
      updatedAt: now,
    };

    setStoryChains(prev => new Map(prev).set(id, chain));
    setCreatedStoryIds(prev => [...prev, id]);

    // Update post's chainLinks
    setPosts(prev => {
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
  }, [currentUser, posts]);

  const addPostToStory = useCallback((chainId: ChainId, postId: PostId): boolean => {
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
    setStoryChains(prev => {
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
    setPosts(prev => {
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
  }, [currentUser, storyChains, posts]);

  const toggleOutletMode = useCallback((): void => {
    setIsOutletAccount(prev => !prev);
  }, []);

  // ============================================================================
  // Getters
  // ============================================================================

  const getPost = useCallback((id: PostId): Post | undefined => {
    return posts.get(id);
  }, [posts]);

  const getClaim = useCallback((id: ClaimId): Claim | undefined => {
    return claims.get(id);
  }, [claims]);

  const getBounty = useCallback((id: BountyId): Bounty | undefined => {
    return bounties.get(id);
  }, [bounties]);

  const getStory = useCallback((id: ChainId): StoryChain | undefined => {
    return storyChains.get(id);
  }, [storyChains]);

  const getPostClaims = useCallback((postId: PostId): Claim[] => {
    const claimIds = postClaims.get(postId) ?? [];
    return claimIds.map(id => claims.get(id)).filter((c): c is Claim => c !== undefined);
  }, [postClaims, claims]);

  const getPostCorroborations = useCallback((postId: PostId): Corroboration[] => {
    const ids = postCorroborations.get(postId) ?? [];
    return ids.map(id => corroborations.get(id)).filter((c): c is Corroboration => c !== undefined);
  }, [postCorroborations, corroborations]);

  const getPostBounties = useCallback((postId: PostId): Bounty[] => {
    const ids = postBounties.get(postId) ?? [];
    return ids.map(id => bounties.get(id)).filter((b): b is Bounty => b !== undefined);
  }, [postBounties, bounties]);

  const getAllPosts = useCallback((): Post[] => {
    return Array.from(posts.values()).sort((a, b) => b.createdAt - a.createdAt);
  }, [posts]);

  const getAllClaims = useCallback((): Claim[] => {
    return Array.from(claims.values()).sort((a, b) => b.createdAt - a.createdAt);
  }, [claims]);

  const getAllBounties = useCallback((): Bounty[] => {
    return Array.from(bounties.values()).sort((a, b) => b.createdAt - a.createdAt);
  }, [bounties]);

  const getAllStories = useCallback((): StoryChain[] => {
    return Array.from(storyChains.values()).sort((a, b) => b.updatedAt - a.updatedAt);
  }, [storyChains]);

  // ============================================================================
  // Context Value
  // ============================================================================

  const value = useMemo((): AppStateContextValue => ({
    // State
    posts,
    corroborations,
    claims,
    bounties,
    storyChains,
    verdicts,
    currentUser,
    postClaims,
    postCorroborations,
    postBounties,
    bountyPosts,
    claimVerdicts,

    // Actions
    createPost,
    submitCorroboration,
    extractClaim,
    createBounty,
    contributeToBounty,
    issueVerdict,
    createStory,
    addPostToStory,
    toggleOutletMode,

    // Getters
    getPost,
    getClaim,
    getBounty,
    getStory,
    getPostClaims,
    getPostCorroborations,
    getPostBounties,
    getAllPosts,
    getAllClaims,
    getAllBounties,
    getAllStories,
  }), [
    posts,
    corroborations,
    claims,
    bounties,
    storyChains,
    verdicts,
    currentUser,
    postClaims,
    postCorroborations,
    postBounties,
    bountyPosts,
    claimVerdicts,
    createPost,
    submitCorroboration,
    extractClaim,
    createBounty,
    contributeToBounty,
    issueVerdict,
    createStory,
    addPostToStory,
    toggleOutletMode,
    getPost,
    getClaim,
    getBounty,
    getStory,
    getPostClaims,
    getPostCorroborations,
    getPostBounties,
    getAllPosts,
    getAllClaims,
    getAllBounties,
    getAllStories,
  ]);

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
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
