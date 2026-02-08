# Polkadot & Web3 Development Skill

## Overview

The Firefly Network is built on and for the Polkadot ecosystem. This skill covers conventions, integration patterns, and Web3 development principles that must be followed throughout the project.

---

## Polkadot Ecosystem Context

### What We Use from Polkadot

| Component | Polkadot Primitive | Firefly Usage | Status |
|-----------|-------------------|---------------|--------|
| Identity | DIM (Decentralized Identity Mechanism) | Proof-of-personhood for fireflies | In design |
| Storage | Bulletin Chain (parachain) | Censorship-resistant signal/chain storage | In design |
| Communication | The Triangle (E2E encrypted chat) | Private coordination between fireflies | In design |
| Payments | The Triangle (stablecoin wallet) | Bounty funding and compensation | In design |
| Verification | Custom parachain logic | Corroboration records, reputation scoring | In design |
| Dispute Resolution | Mob rule mechanics (from Mark3t) | Handling contested claims | In design |

### Current Phase

The web application is being built **ahead** of full on-chain integration. The initial build focuses on:

1. UI/UX foundation with proper architecture for future Web3 integration
2. Mock data layer that mirrors the eventual on-chain data structures
3. Type definitions that map 1:1 to future parachain storage types
4. Wallet connection patterns stubbed but not yet functional

This means: **build everything as if the blockchain backend already exists**, using interfaces and abstractions that will be swapped for real implementations later.

---

## Web3 Development Principles

### 1. Abstract the Data Layer

All data access must go through a service abstraction layer. Never import mock data directly into components.

```typescript
// Correct — service interface that can be swapped
// packages/types/src/services/signal-service.ts

export interface SignalService {
  getSignal(id: SignalId): Promise<Signal | null>;
  getChainSignals(chainId: ChainId): Promise<Signal[]>;
  illuminate(signal: NewSignal): Promise<SignalId>;
  corroborate(signalId: SignalId, corroboration: NewCorroboration): Promise<CorroborationId>;
}

// apps/web/src/lib/services/mock-signal-service.ts
export class MockSignalService implements SignalService { ... }

// Future: apps/web/src/lib/services/chain-signal-service.ts
// export class ChainSignalService implements SignalService { ... }
```

```typescript
// Wrong — directly importing mock data into components
import { mockSignals } from '@/data/mock-signals';
export function SignalList() {
  return mockSignals.map(s => <SignalCard signal={s} />);
}
```

### 2. Type Everything for the Chain

Domain types should reflect on-chain data structures. Use branded types for IDs that will correspond to on-chain identifiers.

```typescript
// packages/types/src/signal.ts

/** Branded type for signal identifiers (will map to on-chain storage key) */
export type SignalId = string & { readonly __brand: 'SignalId' };

/** Branded type for chain identifiers */
export type ChainId = string & { readonly __brand: 'ChainId' };

/** Branded type for DIM credentials */
export type DIMCredential = string & { readonly __brand: 'DIMCredential' };

/** A signal — the fundamental unit of information in the network */
export interface Signal {
  readonly id: SignalId;
  readonly content: SignalContent;
  readonly context: SignalContext;
  readonly dimSignature: DIMCredential;  // Proves a verified human created this
  readonly chainLinks: ChainId[];        // Story chains this signal belongs to
  readonly corroborations: CorroborationSummary;
  readonly createdAt: number;            // Unix timestamp (chain-friendly)
}

export interface SignalContent {
  readonly text: string;
  readonly media?: MediaAttachment[];    // Images, documents
  readonly links?: string[];             // External references
}

export interface SignalContext {
  readonly topics: string[];             // Topic tags
  readonly location?: GeoCoordinate;     // Optional geographic context
  readonly timeframe?: TimeRange;        // When the observed event occurred
}

export interface CorroborationSummary {
  readonly witnessCount: number;
  readonly evidenceCount: number;
  readonly expertiseCount: number;
  readonly challengeCount: number;
  readonly totalWeight: number;          // Reputation-weighted corroboration score
}
```

### 3. Wallet Connection Pattern

Even before real wallet integration, establish the connection pattern.

```typescript
// packages/types/src/wallet.ts

export interface WalletState {
  readonly status: 'disconnected' | 'connecting' | 'connected' | 'error';
  readonly credential: DIMCredential | null;
  readonly reputationScores: TopicReputation[];
  readonly error?: string;
}

export interface TopicReputation {
  readonly topic: string;
  readonly score: number;        // 0-1 normalized
  readonly signalCount: number;  // Signals contributed in this topic
  readonly corroborationCount: number;
}
```

```typescript
// apps/web/src/lib/hooks/use-wallet.ts

export function useWallet(): WalletState & WalletActions {
  // Phase 1: Returns mock connected state for development
  // Phase 2: Integrates with @polkadot/extension-dapp
  // Phase 3: Full DIM credential management
}
```

### 4. Polkadot Package Conventions

When adding Polkadot dependencies (future phase):

```bash
# Official Polkadot.js packages
pnpm add @polkadot/api @polkadot/extension-dapp @polkadot/util-crypto

# Always pin to specific versions — Polkadot packages update frequently
# and breaking changes between minor versions are common
```

- **Always use `@polkadot/util-crypto`** for cryptographic operations — never roll custom crypto
- **Use `@polkadot/api`** for chain interaction — never raw WebSocket
- **Use `@polkadot/extension-dapp`** for wallet integration — standard in the ecosystem
- **Pin versions** in package.json — Polkadot.js packages can break between minors

### 5. On-Chain Data Patterns

Design data structures to be chain-efficient:

- **Prefer small, reference-linked records** over large nested objects
- **Use content-addressing** (hashes) for signal content, store full content on Bulletin Chain
- **Timestamps as Unix numbers**, not Date objects or ISO strings
- **All IDs should be deterministic hashes**, not random UUIDs (enables verification)

```typescript
// On-chain: minimal record with hash references
interface OnChainSignal {
  id: SignalId;                    // Hash of content + DIM signature
  contentHash: string;             // Hash pointing to Bulletin Chain storage
  dimSignature: DIMCredential;
  chainLinks: ChainId[];
  timestamp: number;
}

// Off-chain (Bulletin Chain): full content
interface StoredSignalContent {
  text: string;
  media: MediaHash[];
  links: string[];
  context: SignalContext;
}
```

---

## Web3 Values in Code

### Decentralization Checklist

Before merging any feature, ask:
- [ ] Does this create a single point of failure?
- [ ] Could a single entity (including us) censor or block this?
- [ ] Does this require trusting a centralized service?
- [ ] If our servers went down, would this still work (eventually)?

### Privacy Checklist

- [ ] Does this collect any PII? (If yes, don't.)
- [ ] Could this data be used to identify a firefly? (If yes, redesign.)
- [ ] Does this create metadata that correlates activities? (Minimize.)
- [ ] Is this data encrypted at rest and in transit?

### User Sovereignty Checklist

- [ ] Can the user export their data?
- [ ] Can the user leave without losing their reputation?
- [ ] Does the user control their own keys/credentials?
- [ ] Is the user locked into our specific frontend?

---

## Polkadot Ecosystem Attribution

The Firefly Network proudly builds on Polkadot. Attribution should be:

- **Footer**: "Built on Polkadot" with the Polkadot logo (use official assets from polkadot.com/community/brand-hub)
- **About page**: Section on the Polkadot foundation explaining why we chose this ecosystem
- **Documentation**: Technical docs reference specific Polkadot primitives used
- **Color**: Polkadot Pink (#E6007A) used ONLY for the Polkadot attribution mark, nowhere else in our UI
- **Font**: Unbounded (Polkadot's open-source font) used for display/headings — this is both a design choice and an ecosystem signal

### Links to Include

- Polkadot: https://polkadot.com
- Polkadot Wiki: https://wiki.polkadot.network
- Unbounded Font: https://unbounded.polkadot.network
- Web3 Foundation: https://web3.foundation

---

## Future Integration Milestones

### Phase 1: Foundation (Current)
- UI shell with mock data
- Type system matching on-chain structures
- Service abstractions ready for chain integration
- Wallet connection UI (non-functional)

### Phase 2: Read-Only Chain Integration
- Connect to Polkadot testnet
- Read signals and chains from chain
- Display real verification trails
- Real-time chain event subscriptions

### Phase 3: Write Operations
- DIM proof-of-personhood onboarding
- Signal submission (illuminate)
- Corroboration submission
- Reputation display

### Phase 4: Full Network
- Bounty system
- Private communication (The Triangle)
- Stablecoin payments
- Dispute resolution mechanics
