# Cocuyo Demo Adjustments - Implementation Plan (v4)

## Overview

This plan addresses feedback to shift the Cocuyo demo toward an evidence-based verification model, reframe primitives, and convert bounties into fact-checking campaigns.

**Key Principles:**
1. Posts remain central to communication
2. Truth verification is evidence-based, NOT stake-based
3. Bounties become sponsored fact-checking campaigns
4. Evidence quality replaces reputation-weighted scores
5. Keep 100% Web3 on current infrastructure

---

## Terminology Decision: Keep "Corroboration"

**Issue:** Both proposed alternatives have collisions:
- "Signal" - already means "Post" in this codebase (`signalService`, `/signal/[id]` route)
- "Attestation" - already used for verification verdicts (`attestationCid` in `VerificationVerdict`)

**Resolution:** Keep **"Corroboration"** but change its semantics:
- Remove stake-based `weight` field
- Add evidence-based `quality` field
- Keep all existing service interfaces and method names
- Minimal code changes, maximum design goal achievement

This achieves the evidence-based model without terminology migration.

---

## Changes Summary

### Semantic Changes (No Rename)

| Entity | Change |
|--------|--------|
| Corroboration | Remove `weight`, add `quality: EvidenceQuality` |
| CorroborationSummary | Remove `totalWeight` |
| ChainStats | Remove `totalWeight`, rename `totalCorroborations` → `corroborationCount` |
| BountyContribution | Remove `corroborationWeight`, use `corroborationCount` |

### Bounty → Campaign Rename

| Current | New |
|---------|-----|
| Bounty | Campaign |
| BountyId | CampaignId |
| BountyStatus.open | CampaignStatus.active |
| BountyStatus.fulfilled | CampaignStatus.completed |
| BountyService | CampaignService |
| /bounties | /campaigns |
| /bounty/[id] | /campaign/[id] |

### New Entity: Outlet

News organization sponsors for campaigns.

---

## Phase 0: Design Decisions (Confirmed)

- [x] Keep "Corroboration" term, change semantics only
- [x] Rename Bounty → Campaign (clean rename, no shims)
- [x] Delete all Bounty references, fix all consumers in same PR
- [x] Keep BountyEscrow contract unchanged, use adapter layer
- [x] Keep `payoutMode` in Campaign type
- [x] Use discriminated union for CampaignSponsor with CommunityId
- [x] Follow code-quality.md: no backward-compatibility shims

---

## Phase A: Types (packages/types)

### Task A1: Add Outlet Type
**File:** `packages/types/src/outlet.ts` (new)

```typescript
import type { OutletId } from './brands';

export interface Outlet {
  readonly id: OutletId;
  readonly name: string;
  readonly description: string;
  readonly country: string;
  readonly website?: string;
  readonly topics: readonly string[];
  readonly foundedYear?: number;
  readonly verifiedAt?: number;
  readonly cid?: string;
}

export interface OutletPreview {
  readonly id: OutletId;
  readonly name: string;
  readonly country: string;
  readonly topics: readonly string[];
}
```

### Task A2: Update Corroboration Type (Semantic Change Only)
**File:** `packages/types/src/corroboration.ts`

**Changes:**
1. Add `EvidenceQuality` type
2. Add `quality` field to `Corroboration` (required)
3. Remove `weight` field from `Corroboration`
4. Add `quality` to `NewCorroboration` (optional, defaults to `'unverified'`)
5. Remove `totalWeight` from `CorroborationSummary`

```typescript
// NEW: Evidence quality assessment
export type EvidenceQuality =
  | 'peer_reviewed'    // Reviewed by collective members
  | 'source_verified'  // Original source confirmed
  | 'documented'       // Has supporting documents/media
  | 'observation'      // First-hand witness account
  | 'unverified';      // Not yet reviewed (default)

export interface Corroboration {
  readonly id: CorroborationId;
  readonly postId: PostId;
  readonly claimId?: ClaimId;  // NEW: optional link to specific claim
  readonly type: CorroborationType;
  readonly dimSignature: DIMCredential;
  readonly quality: EvidenceQuality;  // NEW: replaces weight
  readonly note?: string;
  readonly evidencePostId?: PostId;
  readonly evidenceType?: EvidenceType;
  readonly evidenceContent?: string;
  readonly evidenceDescription?: string;
  readonly createdAt: number;
  // REMOVED: weight
}

export interface CorroborationSummary {
  readonly witnessCount: number;
  readonly evidenceCount: number;
  readonly expertiseCount: number;
  readonly challengeCount: number;
  // REMOVED: totalWeight
}

export interface NewCorroboration {
  readonly postId: PostId;
  readonly claimId?: ClaimId;
  readonly type: CorroborationType;
  readonly quality?: EvidenceQuality;  // NEW: defaults to 'unverified'
  readonly note?: string;
  readonly evidencePostId?: PostId;
  readonly evidenceType?: EvidenceType;
  readonly evidenceContent?: string;
  readonly evidenceDescription?: string;
}
```

### Task A3: Create Campaign Type
**File:** `packages/types/src/campaign.ts` (new)

```typescript
import type {
  CampaignId,
  ChainId,
  ClaimId,
  CollectiveId,
  CommunityId,
  DIMCredential,
  EscrowId,
  OutletId,
  PolkadotAddress,
  PostId,
  TransactionHash,
} from './brands';
import type { PUSDAmount } from './currency';
import type { PaymentMode } from './payment-mode';

export type CampaignStatus =
  | 'active'     // Accepting contributions (was 'open')
  | 'completed'  // Deliverables met (was 'fulfilled')
  | 'expired'
  | 'cancelled';

// Discriminated union for type-safe sponsors
export type CampaignSponsor =
  | { readonly type: 'outlet'; readonly id: OutletId; readonly name: string }
  | { readonly type: 'collective'; readonly id: CollectiveId; readonly name: string }
  | { readonly type: 'community'; readonly id: CommunityId; readonly name: string };

export type DeliverableType =
  | 'evidence_gathered'
  | 'sources_verified'
  | 'verdict_issued'
  | 'story_published';

export interface CampaignDeliverable {
  readonly type: DeliverableType;
  readonly target: number;
  readonly current: number;
}

export interface Campaign {
  readonly id: CampaignId;
  readonly title: string;
  readonly description: string;
  readonly topics: readonly string[];
  readonly location?: string;
  readonly sponsor: CampaignSponsor;
  readonly status: CampaignStatus;
  readonly fundingAmount: PUSDAmount;
  readonly escrowId: EscrowId;
  readonly fundingTxHash: TransactionHash;
  readonly payoutMode: PaymentMode;
  readonly deliverables: readonly CampaignDeliverable[];
  readonly assignedCollectiveId?: CollectiveId;
  readonly contributingPostIds: readonly PostId[];
  readonly targetClaimIds?: readonly ClaimId[];
  readonly relatedChainId?: ChainId;
  readonly createdAt: number;
  readonly expiresAt: number;
  readonly cid?: string;  // Bulletin Chain CID for metadata
}

export interface CampaignPreview {
  readonly id: CampaignId;
  readonly title: string;
  readonly topics: readonly string[];
  readonly location?: string;
  readonly sponsor: CampaignSponsor;
  readonly status: CampaignStatus;
  readonly fundingAmount: PUSDAmount;
  readonly payoutMode: PaymentMode;
  readonly contributionCount: number;
  readonly deliverableProgress: number;  // 0-100 percentage
  readonly expiresAt: number;
}

export interface NewCampaign {
  readonly title: string;
  readonly description: string;
  readonly topics: readonly string[];
  readonly location?: string;
  readonly sponsor: CampaignSponsor;
  readonly fundingAmount: PUSDAmount;
  readonly payoutMode?: PaymentMode;
  readonly deliverables: readonly Omit<CampaignDeliverable, 'current'>[];
  readonly targetClaimIds?: readonly ClaimId[];
  readonly duration: number;  // seconds
}

export interface CampaignPayout {
  readonly campaignId: CampaignId;
  readonly totalAmount: PUSDAmount;
  readonly distributions: readonly PayoutDistribution[];
  readonly txHash?: TransactionHash;
  readonly executedAt: number;
}

export interface PayoutDistribution {
  readonly postId: PostId;
  readonly recipientAddress?: PolkadotAddress;
  readonly recipientCredential: DIMCredential;
  readonly amount: PUSDAmount;
  readonly percentage: number;
}

export interface CampaignContribution {
  readonly postId: PostId;
  readonly campaignId: CampaignId;
  readonly contributorCredential: DIMCredential;
  readonly topics: readonly string[];
  readonly corroborationCount: number;  // Replaces corroborationWeight
  readonly createdAt: number;
}
```

### Task A4: Delete bounty.ts
**File:** `packages/types/src/bounty.ts` (DELETE)

```bash
rm packages/types/src/bounty.ts
```

All imports of `Bounty`, `BountyId`, etc. will be updated to use `Campaign`, `CampaignId` directly. No shims.

### Task A5: Update Chain Type (Remove Weight)
**File:** `packages/types/src/chain.ts`

```typescript
export interface ChainStats {
  readonly postCount: number;
  readonly corroborationCount: number;  // Renamed from totalCorroborations
  readonly challengeCount: number;      // Renamed from totalChallenges
  readonly contributorCount: number;
  // REMOVED: totalWeight
}

export interface ChainPreview {
  readonly id: ChainId;
  readonly title: string;
  readonly topics: readonly string[];
  readonly location?: string;
  readonly status: ChainStatus;
  readonly postCount: number;
  readonly corroborationCount: number;  // Renamed from totalCorroborations
  readonly updatedAt: number;
}
```

### Task A6: Update brands.ts
**File:** `packages/types/src/brands.ts`

**Add:**
```typescript
export type CampaignId = string & { readonly __brand: 'CampaignId' };
export type OutletId = string & { readonly __brand: 'OutletId' };
export type CommunityId = string & { readonly __brand: 'CommunityId' };

export function createCampaignId(id: string): CampaignId {
  return id as CampaignId;
}

export function createOutletId(id: string): OutletId {
  return id as OutletId;
}

export function createCommunityId(id: string): CommunityId {
  return id as CommunityId;
}
```

**Delete:**
```typescript
// REMOVE these - no aliases
export type BountyId = ...
export function createBountyId(...) ...
```

### Task A7: Update services.ts
**File:** `packages/types/src/services.ts`

**Add new interfaces:**
```typescript
export interface CampaignService {
  getCampaign(id: CampaignId, locale?: string): Promise<Campaign | null>;

  getCampaigns(params: {
    status?: CampaignStatus;
    topic?: string;
    location?: string;
    sponsorType?: 'outlet' | 'collective' | 'community';
    locale?: string;
    pagination: PaginationParams;
  }): Promise<PaginatedResult<CampaignPreview>>;

  getActiveCampaigns(params: {
    topic?: string;
    location?: string;
    locale?: string;
    pagination: PaginationParams;
  }): Promise<PaginatedResult<CampaignPreview>>;

  createCampaign(campaign: NewCampaign): Promise<Result<CampaignId, string>>;

  contributeToCampaign(
    campaignId: CampaignId,
    postId: PostId
  ): Promise<Result<void, string>>;
}

export interface OutletService {
  getOutlet(id: OutletId): Promise<Outlet | null>;

  getOutlets(params: {
    country?: string;
    topic?: string;
    pagination: PaginationParams;
  }): Promise<PaginatedResult<OutletPreview>>;
}
```

**Delete:**
- Remove `BountyService` interface entirely (no shims)

### Task A8: Update index.ts Exports
**File:** `packages/types/src/index.ts`

- Export new types from `campaign.ts`, `outlet.ts`
- Export `EvidenceQuality` from `corroboration.ts`
- Export new branded types from `brands.ts`
- **Delete** all Bounty exports (no re-exports, no aliases)

---

## Phase B: Services & Data

### Task B1: Create Campaign Service (with Bulletin Chain Integration)
**File:** `apps/web/src/lib/services/campaign-service.ts` (new)

Implement `CampaignService` interface following `bulletin-chain.md` patterns.

**Campaign-to-Escrow Adapter Design:**
```
┌─────────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   CampaignService   │────▶│  Bulletin Chain  │     │  BountyEscrow   │
│                     │     │   (metadata)     │     │   (funds)       │
└─────────────────────┘     └──────────────────┘     └─────────────────┘
         │                          │                        │
         │                          ▼                        ▼
         │                   ┌──────────────┐         ┌──────────────┐
         │                   │ contentHash  │         │  bountyId    │
         │                   │ CID          │         │  amount      │
         │                   │ title        │         │  funder      │
         │                   │ description  │         │  status      │
         │                   │ sponsor      │         │  expiresAt   │
         │                   │ deliverables │         │              │
         │                   └──────────────┘         └──────────────┘
         │
         └── getCampaign() joins: CID metadata + escrow state + hash verification
```

**Bulletin Chain Integration (per bulletin-chain.md):**

```typescript
import { keccak256, toBytes } from 'viem';
import { uploadToBulletin, fetchFromBulletin } from './service-utils';

// Campaign metadata stored on Bulletin Chain
interface BulletinCampaignContent {
  readonly title: string;
  readonly description: string;
  readonly topics: readonly string[];
  readonly location?: string;
  readonly sponsor: CampaignSponsor;
  readonly deliverables: readonly CampaignDeliverable[];
  readonly targetClaimIds?: readonly ClaimId[];
  readonly createdAt: number;
}

// Deterministic content hash (REQUIRED per bulletin-chain.md)
function computeCampaignContentHash(content: BulletinCampaignContent): string {
  const normalized = JSON.stringify(content, Object.keys(content).sort());
  return keccak256(toBytes(normalized));
}

// Campaign ID = content hash (content-addressed)
function computeCampaignId(content: BulletinCampaignContent): CampaignId {
  return computeCampaignContentHash(content) as CampaignId;
}
```

**Data flow with hash verification:**

1. `createCampaign(input: NewCampaign)`:
   ```typescript
   // 1. Build metadata
   const metadata: BulletinCampaignContent = {
     title: input.title,
     description: input.description,
     // ... other fields
     createdAt: Date.now(),
   };

   // 2. Compute content hash BEFORE storage (bulletin-chain.md pattern)
   const contentHash = computeCampaignContentHash(metadata);
   const campaignId = contentHash as CampaignId;

   // 3. Store on Bulletin Chain
   const { cid } = await uploadToBulletin(metadata);

   // 4. Fund escrow using content hash as bountyId
   const tx = await escrowContract.fundBounty(
     contentHash,           // bountyId = content hash
     ethers.ZeroAddress,    // native token
     input.fundingAmount,
     expiresAt,
     { value: input.fundingAmount }
   );

   // 5. Return complete campaign
   return { id: campaignId, cid, contentHash, ...metadata };
   ```

2. `getCampaign(id: CampaignId)`:
   ```typescript
   // 1. Fetch escrow state from contract
   const escrowState = await escrowContract.getBounty(id);
   if (!escrowState.exists) return null;

   // 2. Fetch metadata from Bulletin Chain
   const metadata = await fetchFromBulletin<BulletinCampaignContent>(escrowState.cid);

   // 3. VERIFY content hash matches (REQUIRED per bulletin-chain.md)
   const computedHash = computeCampaignContentHash(metadata);
   if (computedHash !== id) {
     throw new Error('Campaign content hash mismatch - data integrity failure');
   }

   // 4. Map contract status to CampaignStatus
   const statusMap: Record<number, CampaignStatus> = {
     0: 'active',      // OPEN
     1: 'completed',   // CLOSED
     2: 'cancelled',   // CANCELLED
     3: 'expired',     // EXPIRED
   };

   // 5. Merge and return
   return {
     id,
     cid: escrowState.cid,
     ...metadata,
     status: statusMap[escrowState.status],
     fundingAmount: escrowState.amount,
     escrowId: escrowState.id,
     fundingTxHash: escrowState.depositTxHash,
     expiresAt: escrowState.expiresAt,
   };
   ```

**Retention:** Campaign metadata follows 2-week minimum retention on Bulletin Chain. Important campaigns can be pinned for permanence.

### Task B2: Delete bounty-service.ts
**File:** `apps/web/src/lib/services/bounty-service.ts` (DELETE)

```bash
rm apps/web/src/lib/services/bounty-service.ts
```

All consumers updated to import `CampaignServiceImpl` directly. No wrappers.

### Task B3: Update Corroboration Service
**File:** `apps/web/src/lib/services/corroboration-service.ts`

- Remove weight calculations
- Default `quality` to `'unverified'` when creating
- Update summary computation (remove totalWeight)

### Task B4: Update Service Hooks
**Files:**
- `apps/web/src/lib/services/hooks/useCampaignService.ts` (new)
- `apps/web/src/lib/services/hooks/index.ts` (update)
- `apps/web/src/lib/services/hooks/useBountyService.ts` (DELETE)

Delete `useBountyService` entirely. All consumers use `useCampaignService`.

### Task B5: Update Seed Data
**File:** `apps/web/src/lib/seed-data.ts`

**Changes:**
1. Remove `weight` from corroboration data
2. Add `quality` to corroborations (default 'unverified', some 'documented')
3. Remove `totalWeight` from `CorroborationSummary` in posts
4. Remove `totalWeight` from `ChainStats`
5. Convert bounties to campaigns with `sponsor` discriminated union
6. Add mock outlets

**Mock Outlets:**
```typescript
export const seedOutlets: [OutletId, Outlet][] = [
  [createOutletId('outlet-efecto-cocuyo'), {
    id: createOutletId('outlet-efecto-cocuyo'),
    name: 'Efecto Cocuyo',
    description: 'Independent digital journalism from Venezuela',
    country: 'Venezuela',
    website: 'https://efectococuyo.com',
    topics: ['politics', 'human-rights', 'economy'],
    foundedYear: 2015,
  }],
  [createOutletId('outlet-animal-politico'), {
    id: createOutletId('outlet-animal-politico'),
    name: 'Animal Político',
    description: 'Political journalism and fact-checking from Mexico',
    country: 'Mexico',
    website: 'https://animalpolitico.com',
    topics: ['politics', 'corruption', 'human-rights'],
    foundedYear: 2010,
  }],
  [createOutletId('outlet-el-faro'), {
    id: createOutletId('outlet-el-faro'),
    name: 'El Faro',
    description: 'Investigative journalism from Central America',
    country: 'El Salvador',
    website: 'https://elfaro.net',
    topics: ['corruption', 'migration', 'violence'],
    foundedYear: 1998,
  }],
  [createOutletId('outlet-chequeado'), {
    id: createOutletId('outlet-chequeado'),
    name: 'Chequeado',
    description: 'Fact-checking organization from Argentina',
    country: 'Argentina',
    website: 'https://chequeado.com',
    topics: ['fact-checking', 'politics', 'health'],
    foundedYear: 2010,
  }],
];
```

### Task B6: Update AppStateProvider
**File:** `apps/web/src/components/AppStateProvider.tsx`

**Changes:**
1. Update `submitCorroboration` to not set `weight`
2. Update post summary computation to not include `totalWeight`
3. Update `createStory` to not set `totalWeight` in ChainStats
4. Update type imports for Campaign/CampaignId
5. Convert bounty actions to campaign terminology internally

### Task B7: Update services/index.ts
**File:** `apps/web/src/lib/services/index.ts`

- Export `campaignService` (replaces bountyService)
- Delete `bountyService` export entirely
- Update all import references throughout codebase

### Task B8: Define Evidence Quality Upgrade Workflow
**File:** `apps/web/src/lib/services/corroboration-service.ts` (add method)

Evidence quality starts at `'unverified'` and can be upgraded through specific actions.

**Quality Ladder:**
```
unverified → observation → documented → source_verified → peer_reviewed
     ↑            ↑             ↑              ↑               ↑
  (default)   (witness      (has media/    (original      (collective
              account)       links)         source         reviewed)
                                           confirmed)
```

**Upgrade Rules:**

| From | To | Trigger | Who Can Do It |
|------|-----|---------|---------------|
| `unverified` | `observation` | Corroboration type is `'witness'` | Auto on creation |
| `unverified` | `documented` | Has `evidenceContent` with URL or media | Auto on creation |
| `documented` | `source_verified` | Source link validated as accessible | System or collective |
| Any | `peer_reviewed` | Collective member reviews and approves | Collective member only |

**Implementation:**

```typescript
// In CorroborationService

/**
 * Determine initial quality based on corroboration content.
 * Called automatically during submitCorroboration().
 */
function determineInitialQuality(input: NewCorroboration): EvidenceQuality {
  // Witness accounts are observations
  if (input.type === 'witness') {
    return 'observation';
  }

  // Evidence with links/media is documented
  if (input.evidenceContent || input.evidencePostId) {
    return 'documented';
  }

  // Default
  return 'unverified';
}

/**
 * Upgrade quality to source_verified.
 * Called when source link is validated.
 */
async function markSourceVerified(
  corroborationId: CorroborationId
): Promise<Result<void, string>> {
  const corroboration = await getCorroboration(corroborationId);
  if (!corroboration) return err('Corroboration not found');

  if (corroboration.quality === 'peer_reviewed') {
    return ok(undefined); // Already at highest level
  }

  // Update quality and store updated record
  const updated = { ...corroboration, quality: 'source_verified' as const };
  await updateCorroborationOnBulletin(updated);
  return ok(undefined);
}

/**
 * Upgrade quality to peer_reviewed.
 * Called when collective member reviews and approves.
 * REQUIRES: Caller must be a collective member.
 */
async function markPeerReviewed(
  corroborationId: CorroborationId,
  reviewerCredential: DIMCredential,
  collectiveId: CollectiveId
): Promise<Result<void, string>> {
  // Verify reviewer is a collective member
  const isMember = await verifyCollectiveMembership(reviewerCredential, collectiveId);
  if (!isMember) return err('Reviewer is not a collective member');

  const corroboration = await getCorroboration(corroborationId);
  if (!corroboration) return err('Corroboration not found');

  // Update to highest quality level
  const updated = { ...corroboration, quality: 'peer_reviewed' as const };
  await updateCorroborationOnBulletin(updated);
  return ok(undefined);
}
```

**UI Integration (Phase C/D):**
- Show quality badge on corroboration cards
- Collective workbench: "Review Evidence" action upgrades to `peer_reviewed`
- Auto-upgrade happens silently on creation based on content

**Seed Data:**
- Most corroborations: `'unverified'` or `'observation'`
- Some with links: `'documented'`
- One or two from collective: `'peer_reviewed'`

---

## Phase C: UI Components

### Task C1: Create CampaignCard Component
**File:** `packages/ui/src/components/CampaignCard/` (new)

- Display sponsor info (badge by type + name)
- Show deliverable progress bar
- Keep PaymentModeBadge
- Handle all three sponsor types in switch

### Task C2: Create CampaignStatusBadge Component
**File:** `packages/ui/src/components/CampaignStatusBadge/` (new)

Status colors:
- `active` → green
- `completed` → blue
- `expired` → gray
- `cancelled` → red

### Task C3: Delete BountyCard
**Directory:** `packages/ui/src/components/BountyCard/` (DELETE)

```bash
rm -rf packages/ui/src/components/BountyCard/
```

All consumers updated to use `CampaignCard` directly.

### Task C4: Delete BountyStatusBadge
**Directory:** `packages/ui/src/components/BountyStatusBadge/` (DELETE)

```bash
rm -rf packages/ui/src/components/BountyStatusBadge/
```

All consumers updated to use `CampaignStatusBadge` directly.

### Task C5: Update FeedPostCard (Remove Weight)
**File:** `packages/ui/src/components/FeedPostCard/`

- Remove any `totalWeight` display
- Update tests

### Task C6: Update PostMapView (Replace Weight Logic)
**File:** `apps/web/src/components/Map/PostMapView.tsx`

**Current logic:**
```typescript
if (corroborationWeight >= 5) return 'gold';
if (corroborationWeight >= 2) return 'green';
```

**New logic (count-based):**
```typescript
const total = summary.witnessCount + summary.evidenceCount + summary.expertiseCount;
if (status === 'verified' || total >= 5) return 'gold';
if (total >= 2) return 'green';
```

### Task C7: Update packages/ui/src/index.ts
- Export new components (`CampaignCard`, `CampaignStatusBadge`)
- Delete `BountyCard`, `BountyStatusBadge` exports

---

## Phase D: Pages, Routes & Localization (Bundled)

### Task D1: Update Translation Files
**Files:**
- `apps/web/i18n/messages/en.json`
- `apps/web/i18n/messages/es.json`

**Changes:**
1. Rename `bounty.*` namespace to `campaign.*`
2. Add sponsor type translations
3. Add deliverable type translations
4. Add `evidenceQuality.*` translations
5. Delete all `bounty.*` keys (no aliases)

### Task D2: Create Campaign Pages
**Files:**
- `apps/web/src/app/[locale]/campaigns/page.tsx` (new)
- `apps/web/src/app/[locale]/campaigns/CampaignsView.tsx` (new)
- `apps/web/src/app/[locale]/campaigns/CampaignsList.tsx` (new)
- `apps/web/src/app/[locale]/campaigns/CampaignsHeader.tsx` (new)
- `apps/web/src/app/[locale]/campaigns/CampaignFilters.tsx` (new)
- `apps/web/src/app/[locale]/campaign/[id]/page.tsx` (new)
- `apps/web/src/app/[locale]/campaign/[id]/CampaignDetailView.tsx` (new)

### Task D3: Create Bounty Route Redirects
**Files:**
- `apps/web/src/app/[locale]/bounties/page.tsx` (update to redirect)
- `apps/web/src/app/[locale]/bounty/[id]/page.tsx` (update to redirect)

**Pattern (with generateStaticParams for static export):**
```typescript
import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export function generateStaticParams(): { locale: string; id: string }[] {
  const locales = ['en', 'es'];
  // Include all seed bounty IDs for static export
  const ids = ['_', 'seed-bounty-001', 'seed-bounty-002', 'seed-bounty-003'];
  return locales.flatMap((locale) => ids.map((id) => ({ locale, id })));
}

export default async function BountyRedirect({ params }: Props): Promise<never> {
  const { locale, id } = await params;
  setRequestLocale(locale);
  redirect(`/${locale}/campaign/${id}`);
}
```

### Task D4: Update Navigation
**Files:**
- `packages/ui/src/components/Navbar/Navbar.tsx`
- `apps/web/src/components/AppNavbar/` (if separate)

Update nav link: `/bounties` → `/campaigns`

### Task D5: Update Chain Pages (Remove Weight)
**Files:**
- `apps/web/src/app/[locale]/chain/[id]/page.tsx`
- `apps/web/src/app/[locale]/chain/[id]/ChainPostList.tsx`

Remove any `totalWeight` display, use count-based metrics.

### Task D6: Hard-Coded Copy Audit (Moved from Phase F)
**Scope:**
- Route components with hard-coded strings
- Error messages
- Console logs
- Modal/form labels
- Button text
- Alt text

**Files to audit:**
- `apps/web/src/app/[locale]/bounty/`
- `apps/web/src/app/[locale]/bounties/`
- `apps/web/src/components/CreateBountyModal/`
- `packages/ui/src/components/BountyCard/`
- `packages/ui/src/components/BountyStatusBadge/`
- Any file containing "bounty" or "weight"

### Task D7: Update Product Manifest
**File:** `apps/web/public/product.manifest.json`

Update description strings.

---

## Phase E: Test Migration

### Task E1: Update Type Package Tests
**Files:** `packages/types/**/*.test.ts`

- Remove weight-related assertions
- Add quality-related tests
- Test emptyCorroborationSummary() has no totalWeight

### Task E2: Update UI Component Tests
**Files:** `packages/ui/src/components/**/*.test.tsx`

- Update FeedPostCard tests
- Add CampaignCard tests
- Add CampaignStatusBadge tests
- Update fixture data (remove weight)
- Add exhaustive switch tests for CampaignSponsor variants

### Task E3: Update Web App Tests
**Files:** `apps/web/**/*.test.{ts,tsx}`

- Update service tests
- Update AppStateProvider tests
- Update seed data references
- Add shim backward-compat tests

### Task E4: Contract Tests (No Changes)
**File:** `packages/contracts/test/BountyEscrow.test.ts`

Verify tests still pass. No changes needed.

---

## Phase F: Cleanup & Verification

### Task F1: Type Check
```bash
pnpm typecheck
```

### Task F2: Lint
```bash
pnpm lint
```

### Task F3: Build
```bash
pnpm build
```

### Task F4: Run Tests
```bash
pnpm test
```

### Task F5: Manual Testing Checklist
- [ ] Navigate to /campaigns - see campaign list with sponsor badges
- [ ] Navigate to /bounties - redirects to /campaigns
- [ ] View campaign detail - see sponsor, deliverables, progress
- [ ] View post - corroboration counts work (no weight)
- [ ] View chain - no weight displayed, counts work
- [ ] Map view - marker colors work with count-based logic
- [ ] Workbench - claims still work
- [ ] Switch to Spanish - verify all new translations
- [ ] Create campaign via outlet mode
- [ ] Submit corroboration - quality defaults to unverified

---

## Weight Removal: Complete Consumer List

### Type Definitions
| File | Field | Action |
|------|-------|--------|
| `corroboration.ts` | `Corroboration.weight` | Remove |
| `corroboration.ts` | `CorroborationSummary.totalWeight` | Remove |
| `chain.ts` | `ChainStats.totalWeight` | Remove |
| `bounty.ts` | `BountyContribution.corroborationWeight` | Replace with `corroborationCount` |

### Services
| File | Usage | Action |
|------|-------|--------|
| `corroboration-service.ts` | Weight calculation | Remove |
| `AppStateProvider.tsx:336` | `weight: 1` | Remove |
| `AppStateProvider.tsx:380` | `summary.totalWeight += 1` | Remove |
| `AppStateProvider.tsx:633` | `totalWeight: 0` in ChainStats | Remove |

### UI Components
| File | Usage | Replacement |
|------|-------|-------------|
| `FeedPostCard.tsx` | Display weight? | Use count sum |
| `PostMapView.tsx:44` | `corroborationWeight >= 5` | `totalCount >= 5` |
| `ChainPostList.tsx` | Weight display? | Use count sum |

### Seed Data
| File | Fields | Action |
|------|--------|--------|
| `seed-data.ts` | All `weight: N` | Remove |
| `seed-data.ts` | All `totalWeight: N` | Remove |
| `seed-data.ts` | `corroborationWeight` | Replace |

---

## Implementation Order

```
Phase A: Types (A1 → A8 in order)
    │
    ├── A1: outlet.ts (new, no deps)
    ├── A2: corroboration.ts (semantic changes)
    ├── A3: campaign.ts (new, depends on brands)
    ├── A4: bounty.ts (DELETE)
    ├── A5: chain.ts (remove weight fields)
    ├── A6: brands.ts (new IDs, remove old)
    ├── A7: services.ts (new interfaces, remove old)
    └── A8: index.ts (exports, remove old)
    ↓
Phase B: Services & Data (B1 → B8)
    │
    ├── B1: campaign-service.ts (new)
    ├── B2: bounty-service.ts (DELETE)
    ├── B3: corroboration-service.ts (update)
    ├── B4: hooks (new, delete old)
    ├── B5: seed-data.ts (major update)
    ├── B6: AppStateProvider.tsx (remove weight)
    ├── B7: services/index.ts (exports)
    └── B8: corroboration-service.ts (quality upgrade workflow)
    ↓
Phase C: UI Components (C1 → C7)
    ↓
Phase D: Pages, Routes & Localization (D1 → D7, bundled)
    ↓
Phase E: Test Migration (E1 → E4)
    ↓
Phase F: Cleanup & Verification (F1 → F5)
```

**Total tasks: 39**

---

## Breaking Changes Summary

### Removed Fields
- `Corroboration.weight`
- `CorroborationSummary.totalWeight`
- `ChainStats.totalWeight`
- `BountyContribution.corroborationWeight`

### Added Fields
- `Corroboration.quality: EvidenceQuality`
- `Corroboration.claimId?: ClaimId`
- `NewCorroboration.quality?: EvidenceQuality`

### Deleted Types (No Aliases)
- `Bounty` → DELETE, use `Campaign`
- `BountyId` → DELETE, use `CampaignId`
- `BountyStatus` → DELETE, use `CampaignStatus`
- `BountyService` → DELETE, use `CampaignService`

### Renamed Fields
- `ChainStats.totalCorroborations` → `corroborationCount`
- `ChainStats.totalChallenges` → `challengeCount`
- `ChainPreview.totalCorroborations` → `corroborationCount`
- `CampaignContribution.corroborationWeight` → `corroborationCount`

### Route Changes
- `/bounties` → `/campaigns` (redirect in place)
- `/bounty/[id]` → `/campaign/[id]` (redirect in place)

### Contract Boundary
- App uses `Campaign` terminology
- Contract stays `BountyEscrow`
- `CampaignId` = hash of Bulletin CID
- Adapter joins Bulletin metadata + escrow state
