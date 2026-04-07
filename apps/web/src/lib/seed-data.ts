/**
 * Seed data for development and demos.
 *
 * Inspired by real investigative journalism from Efecto Cocuyo.
 * https://efectococuyo.com/cocuyo-chequea/maquinaria-eco-44-medios/
 */

import type {
  Post,
  PostId,
  StoryChain,
  ChainId,
  Bounty,
  BountyId,
  Corroboration,
  CorroborationId,
  Claim,
  ClaimId,
} from '@cocuyo/types';
import {
  createPostId,
  createChainId,
  createBountyId,
  createCorroborationId,
  createClaimId,
  createDIMCredential,
  createPUSDAmount,
  createEscrowId,
  createTransactionHash,
  emptyCorroborationSummary,
} from '@cocuyo/types';

// Fixed IDs for seed data
const POST_1_ID = createPostId('seed-post-001');
const POST_2_ID = createPostId('seed-post-002');
const POST_3_ID = createPostId('seed-post-003');
const CHAIN_1_ID = createChainId('seed-chain-001');
const BOUNTY_1_ID = createBountyId('seed-bounty-001');
const CORR_1_ID = createCorroborationId('seed-corr-001');
const CORR_2_ID = createCorroborationId('seed-corr-002');
const CLAIM_1_ID = createClaimId('seed-claim-001');

const DIM_CREDENTIAL_1 = createDIMCredential('dim-seed-user-001');
const DIM_CREDENTIAL_2 = createDIMCredential('dim-seed-user-002');
const DIM_CREDENTIAL_3 = createDIMCredential('dim-seed-user-003');

const NOW = Date.now();
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

// ============================================================================
// Posts
// ============================================================================

const post1: Post = {
  id: POST_1_ID,
  author: {
    id: 'seed-author-001',
    credentialHash: DIM_CREDENTIAL_1,
    pseudonym: 'MediaWatcher',
    disclosureLevel: 'anonymous',
    location: 'Caracas',
  },
  content: {
    title: '44 medios amplifican narrativas del gobierno venezolano',
    text: 'Una investigación colaborativa de ProBox, Cazadores de Fake News, Efecto Cocuyo y Medianálisis revela una red coordinada de 44 medios que sistemáticamente amplifican las narrativas y propaganda del gobierno venezolano. La red incluye medios estatales (VTV), portales supuestamente independientes, y medios internacionales de Rusia, China, Irán y Estados Unidos.',
    links: ['https://efectococuyo.com/cocuyo-chequea/maquinaria-eco-44-medios/'],
  },
  context: {
    topics: ['media', 'disinformation', 'venezuela'],
    locationName: 'Venezuela',
    location: { latitude: 10.4806, longitude: -66.9036 },
  },
  dimSignature: DIM_CREDENTIAL_1,
  status: 'published',
  chainLinks: [CHAIN_1_ID],
  corroborations: {
    witnessCount: 2,
    evidenceCount: 3,
    expertiseCount: 1,
    challengeCount: 0,
    totalWeight: 6,
  },
  verification: { status: 'unverified' },
  createdAt: NOW - 2 * DAY,
};

const post2: Post = {
  id: POST_2_ID,
  author: {
    id: 'seed-author-002',
    credentialHash: DIM_CREDENTIAL_2,
    pseudonym: 'DataAnalyst',
    disclosureLevel: 'anonymous',
  },
  content: {
    title: '132 publicaciones idénticas entre El Universal y Globovisión',
    text: 'Documentamos 132 publicaciones compartidas entre El Universal y Globovisión con titulares, texto y estructura casi idénticos. Este patrón de replicación de contenido es consistente con una operación de amplificación coordinada.',
  },
  context: {
    topics: ['media', 'disinformation', 'venezuela'],
    locationName: 'Venezuela',
  },
  dimSignature: DIM_CREDENTIAL_2,
  status: 'published',
  chainLinks: [CHAIN_1_ID],
  corroborations: {
    witnessCount: 0,
    evidenceCount: 2,
    expertiseCount: 0,
    challengeCount: 0,
    totalWeight: 2,
  },
  verification: { status: 'unverified' },
  createdAt: NOW - DAY - 6 * HOUR,
};

const post3: Post = {
  id: POST_3_ID,
  author: {
    id: 'seed-author-003',
    credentialHash: DIM_CREDENTIAL_3,
    pseudonym: 'SocialMonitor',
    disclosureLevel: 'anonymous',
  },
  content: {
    text: 'Durante el período de monitoreo se registraron 30,948 menciones en redes sociales. X (Twitter) representó el 45.06% de la discusión. Se identificaron tres campañas de hashtags sincronizados: #HandsOffVenezuela, #VenezuelaNoSeRinde, y #PuebloLevantaLaCara.',
  },
  context: {
    topics: ['social-media', 'disinformation', 'venezuela'],
  },
  dimSignature: DIM_CREDENTIAL_3,
  status: 'published',
  chainLinks: [CHAIN_1_ID],
  corroborations: emptyCorroborationSummary(),
  verification: { status: 'unverified' },
  createdAt: NOW - 12 * HOUR,
};

// ============================================================================
// Story Chain
// ============================================================================

const storyChain1: StoryChain = {
  id: CHAIN_1_ID,
  title: '#LaMaquinariaDelEco',
  description: 'Investigación sobre cómo 44 medios globalizan la narrativa del régimen venezolano. Seguimiento colaborativo de la red de amplificación de propaganda.',
  topics: ['media', 'disinformation', 'venezuela'],
  status: 'emerging',
  postIds: [POST_1_ID, POST_2_ID, POST_3_ID],
  stats: {
    postCount: 3,
    totalCorroborations: 8,
    totalChallenges: 0,
    contributorCount: 3,
    totalWeight: 8,
  },
  createdAt: NOW - 2 * DAY,
  updatedAt: NOW - 12 * HOUR,
};

// ============================================================================
// Bounty
// ============================================================================

const bounty1: Bounty = {
  id: BOUNTY_1_ID,
  title: 'Identificar fuentes de financiamiento de la red de medios',
  description: 'Buscamos evidencia documentada sobre las fuentes de financiamiento de los 44 medios identificados en la investigación #LaMaquinariaDelEco. Interesa especialmente documentar contratos publicitarios con entidades estatales, transferencias internacionales, o vínculos corporativos.',
  topics: ['media', 'disinformation', 'venezuela', 'finance'],
  fundingAmount: createPUSDAmount(BigInt(50000)), // $500.00
  funderCredential: DIM_CREDENTIAL_1,
  escrowId: createEscrowId('escrow-seed-001'),
  fundingTxHash: createTransactionHash('0xseed001'),
  contributingPostIds: [POST_1_ID],
  status: 'open',
  payoutMode: 'public',
  createdAt: NOW - DAY,
  expiresAt: NOW + 30 * DAY,
};

// ============================================================================
// Corroborations
// ============================================================================

const corroboration1: Corroboration = {
  id: CORR_1_ID,
  postId: POST_1_ID,
  type: 'evidence',
  dimSignature: DIM_CREDENTIAL_2,
  weight: 1,
  createdAt: NOW - DAY - 12 * HOUR,
  evidenceType: 'source_link',
  evidenceContent: 'https://probox.org/investigacion-maquinaria-eco',
  evidenceDescription: 'Informe completo de ProBox con metodología y datos del análisis',
};

const corroboration2: Corroboration = {
  id: CORR_2_ID,
  postId: POST_1_ID,
  type: 'witness',
  dimSignature: DIM_CREDENTIAL_3,
  weight: 1,
  createdAt: NOW - DAY,
  evidenceType: 'observation',
  evidenceContent: 'Trabajo en medios digitales en Venezuela. He observado personalmente cómo llegan pautas de contenido similares a diferentes redacciones simultáneamente.',
};

// ============================================================================
// Claim
// ============================================================================

const claim1: Claim = {
  id: CLAIM_1_ID,
  statement: '44 medios participan en una red coordinada de amplificación de narrativas del gobierno venezolano',
  sourcePostId: POST_1_ID,
  extractedBy: DIM_CREDENTIAL_1,
  topics: ['media', 'disinformation', 'venezuela'],
  evidence: [],
  status: 'under_review',
  createdAt: NOW - 2 * DAY,
  updatedAt: NOW - DAY,
};

// ============================================================================
// Exports
// ============================================================================

export const seedPosts = new Map<PostId, Post>([
  [POST_1_ID, post1],
  [POST_2_ID, post2],
  [POST_3_ID, post3],
]);

export const seedStoryChains = new Map<ChainId, StoryChain>([
  [CHAIN_1_ID, storyChain1],
]);

export const seedBounties = new Map<BountyId, Bounty>([
  [BOUNTY_1_ID, bounty1],
]);

export const seedCorroborations = new Map<CorroborationId, Corroboration>([
  [CORR_1_ID, corroboration1],
  [CORR_2_ID, corroboration2],
]);

export const seedClaims = new Map<ClaimId, Claim>([
  [CLAIM_1_ID, claim1],
]);

// Derived mappings
export const seedPostClaims = new Map<PostId, ClaimId[]>([
  [POST_1_ID, [CLAIM_1_ID]],
]);

export const seedPostCorroborations = new Map<PostId, CorroborationId[]>([
  [POST_1_ID, [CORR_1_ID, CORR_2_ID]],
]);

export const seedPostBounties = new Map<PostId, BountyId[]>([
  [POST_1_ID, [BOUNTY_1_ID]],
]);

export const seedBountyPosts = new Map<BountyId, PostId[]>([
  [BOUNTY_1_ID, [POST_1_ID]],
]);
