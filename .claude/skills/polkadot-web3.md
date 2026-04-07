---
name: polkadot-web3
description: "Implement Polkadot ecosystem integration and Web3 patterns. Triggers: polkadot, web3, wallet, DIM, parachain, chain, crypto, signature, credential"
---

# Polkadot & Web3 Development Skill

## When to Activate

- Integrating with Polkadot ecosystem components
- Implementing wallet connection patterns
- Working with DIM credentials or identity
- Designing on-chain data structures
- Adding cryptographic operations
- Implementing Web3 value principles

---

## Global Invariants

| Rule | Enforcement | Status |
|------|-------------|--------|
| Abstract data layer | Service interfaces, not direct imports | MANDATORY |
| Branded types for IDs | SignalId, ChainId, DIMCredential | MANDATORY |
| Only @polkadot/* crypto | No custom cryptography | MANDATORY |
| Timestamps as Unix numbers | Not Date objects or ISO strings | MANDATORY |
| Deterministic IDs | Hashes, not random UUIDs | MANDATORY |
| Privacy by default | Zero PII collection | MANDATORY |

---

## Polkadot Ecosystem Components

| Component | Polkadot Primitive | Firefly Usage | Status |
|-----------|-------------------|---------------|--------|
| Identity | DIM (Decentralized Identity Mechanism) | Proof-of-personhood | In design |
| Storage | Bulletin Chain (parachain) | Signal/chain storage | In design |
| Communication | The Triangle (E2E encrypted) | Private coordination | In design |
| Payments | The Triangle (stablecoin) | Bounty compensation | In design |
| Verification | Custom parachain logic | Reputation scoring | In design |

---

## Data Abstraction Pattern

### Service Interface

✅ CORRECT:
```typescript
// packages/types/src/services/signal-service.ts
export interface SignalService {
  getSignal(id: SignalId): Promise<Signal | null>;
  getChainSignals(chainId: ChainId): Promise<Signal[]>;
  illuminate(signal: NewSignal): Promise<SignalId>;
  corroborate(signalId: SignalId, corroboration: NewCorroboration): Promise<CorroborationId>;
}

// apps/web/src/lib/services/mock-signal-service.ts
export class MockSignalService implements SignalService {
  // Mock implementation for development
}

// Future: apps/web/src/lib/services/chain-signal-service.ts
// export class ChainSignalService implements SignalService {
//   // Real chain implementation
// }
```

❌ FAIL:
```typescript
// Direct mock data import in components
import { mockSignals } from '@/data/mock-signals';

export function SignalList() {
  return mockSignals.map(s => <SignalCard signal={s} />);
}
```

---

## Type Definitions

### Branded Types

```typescript
// packages/types/src/signal.ts

/** Branded type for signal identifiers (maps to on-chain storage key) */
export type SignalId = string & { readonly __brand: 'SignalId' };

/** Branded type for chain identifiers */
export type ChainId = string & { readonly __brand: 'ChainId' };

/** Branded type for DIM credentials */
export type DIMCredential = string & { readonly __brand: 'DIMCredential' };
```

### Signal Type

```typescript
export interface Signal {
  readonly id: SignalId;
  readonly content: SignalContent;
  readonly context: SignalContext;
  readonly dimSignature: DIMCredential;  // Proves verified human
  readonly chainLinks: ChainId[];        // Story chains
  readonly corroborations: CorroborationSummary;
  readonly createdAt: number;            // Unix timestamp
}

export interface SignalContent {
  readonly text: string;
  readonly media?: MediaAttachment[];
  readonly links?: string[];
}

export interface SignalContext {
  readonly topics: string[];
  readonly location?: GeoCoordinate;
  readonly timeframe?: TimeRange;
}
```

---

## Wallet Connection Pattern

### State Type

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
  readonly signalCount: number;
  readonly corroborationCount: number;
}
```

### Hook Pattern

```typescript
// apps/web/src/lib/hooks/use-wallet.ts
export function useWallet(): WalletState & WalletActions {
  // Phase 1: Returns mock connected state for development
  // Phase 2: Integrates with @polkadot/extension-dapp
  // Phase 3: Full DIM credential management
}
```

---

## Polkadot Package Conventions

### Package Installation

```bash
# Official Polkadot.js packages ONLY
pnpm add @polkadot/api @polkadot/extension-dapp @polkadot/util-crypto

# ALWAYS pin to specific versions
```

### Package Rules

| Rule | Enforcement |
|------|-------------|
| Use `@polkadot/util-crypto` | ONLY crypto library |
| Use `@polkadot/api` | ONLY chain interaction |
| Use `@polkadot/extension-dapp` | Wallet integration |
| Pin versions | Polkadot packages break between minors |

---

## On-Chain Data Patterns

### Design Principles

| Principle | Implementation |
|-----------|----------------|
| Small records | Reference-linked, not nested |
| Content-addressing | Hashes for signal content |
| Unix timestamps | Not Date objects |
| Deterministic IDs | Hashes, not UUIDs |

### On-Chain vs Off-Chain

```typescript
// On-chain: minimal record with hash references
interface OnChainSignal {
  id: SignalId;                    // Hash of content + DIM signature
  contentHash: string;             // Points to Bulletin Chain storage
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

## Web3 Values Checklist

### Decentralization
- [ ] No single point of failure
- [ ] No single entity can censor
- [ ] No centralized service dependency
- [ ] Works if our servers go down

### Privacy
- [ ] No PII collected
- [ ] No data identifies a firefly
- [ ] No metadata correlates activities
- [ ] Data encrypted at rest and transit

### User Sovereignty
- [ ] User can export data
- [ ] User can leave without losing reputation
- [ ] User controls keys/credentials
- [ ] User not locked to our frontend

---

## Polkadot Attribution

### Required Elements

| Location | Content |
|----------|---------|
| Footer | "Built on Polkadot" with logo |
| About page | Section on Polkadot foundation |
| Documentation | Reference Polkadot primitives |

### Color Usage

- Polkadot Pink (#E6007A): ONLY for attribution mark
- Unbounded font: Ecosystem alignment

### Links to Include

- https://polkadot.com
- https://wiki.polkadot.network
- https://unbounded.polkadot.network
- https://web3.foundation

---

## Integration Milestones

| Phase | Status | Features |
|-------|--------|----------|
| 1: Foundation | Current | UI shell, mock data, type system |
| 2: Read-Only | Future | Testnet connection, real trails |
| 3: Write Ops | Future | DIM onboarding, illuminate, corroborate |
| 4: Full Network | Future | Bounties, Triangle, payments |

---

## Anti-Patterns

| Pattern | Status | Reason |
|---------|--------|--------|
| Custom cryptography | FORBIDDEN | Use @polkadot/util-crypto |
| Random UUIDs for IDs | FORBIDDEN | Use deterministic hashes |
| Date objects on-chain | FORBIDDEN | Use Unix timestamps |
| Direct mock imports | FORBIDDEN | Use service abstraction |
| Raw WebSocket | FORBIDDEN | Use @polkadot/api |
| Unpinned Polkadot deps | FORBIDDEN | Pin specific versions |
| Centralized auth | FORBIDDEN | DIM only |
| Third-party identity | FORBIDDEN | DIM only |
