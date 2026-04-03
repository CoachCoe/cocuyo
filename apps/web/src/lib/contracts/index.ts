/**
 * Contract configuration and utilities.
 */

export {
  NETWORKS,
  CONTRACT_ADDRESSES,
  getDefaultNetwork,
  getContractAddress,
  getRpcUrl,
  type NetworkName,
} from './config';

export {
  BOUNTY_ESCROW_ABI,
  FIREFLY_REPUTATION_ABI,
  BountyStatus,
  DEFAULT_TOPICS,
  type OnChainBounty,
  type Allocation,
  type TopicScore,
  type DefaultTopic,
} from './abis';
