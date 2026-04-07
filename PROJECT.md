# F-Network Project Board

> **Goal:** Build a surveillance-resistant platform for collective intelligence.
>
> **Deployed at:** https://fireflynetwork.dot.li/ (Triangle) | https://coachcoe.github.io/cocuyo/ (GitHub Pages)

---

## Quick Status

| Phase | Status | Progress |
|-------|--------|----------|
| Phase 0: Foundation | 🟢 Complete | 6/6 |
| Phase 1: Identity & Onboarding | 🟢 Complete | 10/10 |
| Phase 2: Posts & Feed | 🟢 Complete | 10/10 |
| Phase 3: Collectives | 🟢 Complete | 8/9 |
| Phase 4: Verification Workflow | 🟢 Complete | 8/9 |
| Phase 5: Polish & Launch | 🟡 In Progress | 10/12 |
| Phase 6: Web3 Integration | 🟢 Complete | 5/5 |

**Legend:** ⚪ Not Started | 🟡 In Progress | 🟢 Complete | 🔴 Blocked

---

## Phase 6: Web3 Integration (Complete)

Real blockchain integration.

| Task | Status | Notes |
|------|--------|-------|
| Wire Bulletin Chain uploads | 🟢 | Via @polkadot-apps/bulletin (auto-resolved signer) |
| Wire signer to services | 🟢 | SignerContext + useSignalService integration |
| Deploy contracts to Paseo | 🟢 | BountyEscrow + FireflyReputation |
| Update contract config | 🟢 | Paseo addresses in config.ts |
| Add Host API permissions | 🟢 | CARTO + Nominatim |

**Smart Contract Addresses (Paseo):**
| Contract | Address |
|----------|---------|
| BountyEscrow | `0xAA3Db3F2BD6E5D0c7C44e8BFc51Ba79A6d65773A` |
| FireflyReputation | `0xb630cB019b94b48aB27A2f61A31Ee5E220994047` |

---

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Data storage | Bulletin Chain | Decentralized, censorship-resistant |
| Identity | DIM (mocked for demo) | Proof-of-personhood, privacy-preserving |
| Hosting | Triangle (dot.li) | Polkadot-native, sandboxed |
| Wallet | @polkadot-apps/signer | Auto-detects Host vs extensions |
| Local state | hostLocalStorage | Triangle-compatible |
| Smart Contracts | Paseo Asset Hub | Revive EVM compatibility |

---

## Key Packages

| Package | Purpose | Status |
|---------|---------|--------|
| `packages/types` | Shared TypeScript types | 🟢 Post, Bounty, Corroboration, etc. |
| `packages/ui` | Shared components | 🟢 PostCard, BountyCard, etc. |
| `packages/identity` | DIM integration | 🟢 Mocked for demo |
| `packages/bulletin` | CID calculation | 🟢 Uses @noble/hashes |
| `packages/contracts` | Solidity contracts | 🟢 Deployed to Paseo |

---

## App Routes

| Route | Purpose | Status |
|-------|---------|--------|
| `/` | Landing | 🟢 |
| `/explore` | Browse posts + story chains | 🟢 |
| `/post/[id]` | Post detail | 🟢 |
| `/posts` | All posts | 🟢 |
| `/chain/[id]` | Story chain detail | 🟢 |
| `/bounties` | Browse bounties | 🟢 |
| `/bounty/[id]` | Bounty detail | 🟢 |
| `/claim/[id]` | Claim detail | 🟢 |
| `/workbench` | Verification workbench | 🟢 |
| `/profile` | Own profile | 🟢 |
| `/about` | About page | 🟢 |

---

## Key Hooks

| Hook | Purpose | Location |
|------|---------|----------|
| `useSigner` | Wallet connection | `@/lib/context/SignerContext` |
| `useIdentity` | DIM + profile | `@/hooks/useIdentity` |
| `useSignalService` | Post operations | `@/lib/services/hooks/useSignalService` |
| `useBountyService` | Bounty operations | `@/lib/services/hooks/useBountyService` |
| `useCorroborationService` | Corroboration ops | `@/lib/services/hooks/useCorroborationService` |
| `useClaimService` | Claim operations | `@/lib/services/hooks/useClaimService` |

---

## Development Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build all packages
pnpm build

# Run all checks (lint, typecheck, test)
pnpm check

# Deploy contracts to Paseo
cd packages/contracts
pnpm hardhat run scripts/deploy.ts --network paseo
```

---

## What's Mocked vs Real

### Real
- Bulletin Chain uploads (via @polkadot-apps/bulletin)
- Wallet connection (via @polkadot-apps/signer)
- Smart contracts on Paseo (BountyEscrow, FireflyReputation)
- Host API permissions (CARTO, Nominatim)

### Mocked (Demo)
- DIM identity verification
- Claim extraction from posts
- Full indexing/queries (session cache only)

---

## Links

- **Live App:** https://fireflynetwork.dot.li/
- **GitHub Pages:** https://coachcoe.github.io/cocuyo/
- **Design System:** `packages/ui/src/styles/tokens.css`
- **Triangle SDK:** `@novasamatech/product-sdk`
- **Bulletin Client:** `@polkadot-apps/bulletin`
- **Signer Manager:** `@polkadot-apps/signer`
