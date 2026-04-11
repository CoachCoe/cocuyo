/**
 * Service exports.
 *
 * All data access should go through these services.
 * Components should never import data directly.
 *
 * ## Preferred: Service Hooks
 *
 * Use the hook-based services for new code:
 * ```typescript
 * import { usePostService } from '@/lib/services/hooks';
 * const { illuminate } = usePostService();
 * ```
 *
 * Hooks provide:
 * - Integrated wallet state from useSigner()
 * - No global state management needed
 * - Bulletin Chain storage
 *
 * ## Legacy: Singleton Services
 *
 * Singleton exports below are maintained for backward compatibility.
 * Service selection is controlled by NEXT_PUBLIC_USE_CHAIN environment variable:
 * - false (default): Use session-cached services with Bulletin fallback
 * - true: Use chain services with Bulletin Chain storage
 */

import type { ChainService, CampaignService, PostService, ClaimService, CorroborationService } from '@cocuyo/types';
import { SignalServiceImpl } from './signal-service';
import { ChainServiceImpl } from './chain-service';
import { CampaignServiceImpl } from './campaign-service';
import { ClaimServiceImpl } from './claim-service';
import { CorroborationServiceImpl } from './corroboration-service';
import { ChainSignalService } from './chain-signal-service';
import { ChainChainService } from './chain-chain-service';

/**
 * Whether to use chain-backed services.
 * Set NEXT_PUBLIC_USE_CHAIN=true to enable blockchain storage.
 */
const USE_CHAIN_SERVICES = process.env.NEXT_PUBLIC_USE_CHAIN === 'true';

/**
 * Signal service instance (now uses Post types).
 *
 * Provides access to post data:
 * - getPost: Fetch a single post by ID
 * - getChainPosts: Get all posts in a story chain
 * - getRecentPosts: Paginated post listing
 * - illuminate: Create a new post
 *
 * Note: Named "signalService" for backwards compatibility.
 */
export const signalService: PostService = USE_CHAIN_SERVICES
  ? new ChainSignalService()
  : new SignalServiceImpl();

/**
 * Chain service instance.
 *
 * Provides access to story chain data:
 * - getChain: Fetch a single chain by ID
 * - getChains: Paginated chain listing with filters
 * - getFeaturedChains: Top chains by corroboration
 */
export const chainService: ChainService = USE_CHAIN_SERVICES
  ? new ChainChainService()
  : new ChainServiceImpl();

/**
 * Campaign service instance.
 *
 * Provides access to campaign data:
 * - getCampaign: Fetch a single campaign by ID
 * - getCampaigns: Paginated campaign listing with filters
 * - getActiveCampaigns: Active campaigns
 * - createCampaign: Create a new campaign (requires wallet)
 * - contributeToCampaign: Link a post to a campaign
 */
export const campaignService: CampaignService = new CampaignServiceImpl();

/**
 * Post service instance.
 *
 * Alias to signalService for consistent naming.
 * Use this for new code; signalService is kept for backwards compatibility.
 */
export const postService: PostService = signalService;

/**
 * Claim service instance.
 *
 * Provides access to claim data:
 * - getClaim: Fetch a single claim by ID
 * - getClaimsByPost: Get claims extracted from a post
 * - getClaimsByStatus: Filter claims by status
 * - getPendingClaims: Get claims awaiting verification
 * - extractClaim: Extract a claim from a post
 * - submitEvidence: Submit evidence for a claim
 */
export const claimService: ClaimService = new ClaimServiceImpl();

/**
 * Corroboration service instance.
 *
 * Provides corroboration functionality:
 * - getPostCorroborations: Get all corroborations for a post
 * - corroborate: Submit a corroboration
 */
export const corroborationService: CorroborationService = new CorroborationServiceImpl();

// Export classes for type checking and direct instantiation
export { SignalServiceImpl, SignalServiceImpl as MockSignalService } from './signal-service';
export { ChainServiceImpl, ChainServiceImpl as MockChainService } from './chain-service';
export { CampaignServiceImpl } from './campaign-service';
export { SignalServiceImpl as PostServiceImpl, SignalServiceImpl as MockPostService } from './signal-service';
export { ClaimServiceImpl, ClaimServiceImpl as MockClaimService } from './claim-service';
export { CorroborationServiceImpl, CorroborationServiceImpl as MockCorroborationService } from './corroboration-service';
export { ChainSignalService } from './chain-signal-service';
export { ChainChainService } from './chain-chain-service';

// Export service hooks (preferred for new code)
export {
  useSignalService,
  useChainService,
  useCampaignService,
  useClaimService,
  useCorroborationService,
} from './hooks';
