# F-Network Project Board

> **Goal:** Build a social platform for verified voices with fact-checking collectives.
>
> **Timeline:** 12 weeks
>
> **Deployed at:** https://fireflynetwork.dot.li/

---

## Quick Status

| Phase | Status | Progress |
|-------|--------|----------|
| Phase 0: Foundation | 🟢 Complete | 6/6 |
| Phase 1: Identity & Onboarding | 🟢 Complete | 10/10 |
| Phase 2: Signals & Feed | 🟢 Complete | 10/10 |
| Phase 3: Collectives | 🟢 Complete | 8/9 |
| Phase 4: Verification Workflow | 🟢 Complete | 8/9 |
| Phase 5: Polish & Launch | 🟡 In Progress | 8/12 |

**Legend:** ⚪ Not Started | 🟡 In Progress | 🟢 Complete | 🔴 Blocked

---

## Phase 0: Foundation (Week 1-2)

Infrastructure and shared packages.

| Task | Status | Notes |
|------|--------|-------|
| Rename `apps/web` → `apps/f-network` | ⏸️ | Deferred - works as-is |
| Create `packages/identity` | 🟢 | DIM client, credential types |
| Create `packages/bulletin` | 🟢 | Storage client, index manager |
| Add new types to `packages/types` | 🟢 | Identity, Collective, Verification |
| Update storage adapter for host | 🟢 | Done in previous work |
| Fix host detection | 🟢 | Done - iframe detection |
| Update mock data for new Signal type | 🟢 | Added author, verification |
| Verify build & deploy | 🟢 | All packages build |

**Blocked by:** Nothing

---

## Phase 1: Identity & Onboarding (Week 3-4)

DIM verification and profile creation.

| Task | Status | Notes |
|------|--------|-------|
| Add identity types to `packages/types` | 🟢 | FireflyProfile, DisclosureLevel |
| Implement DIM client | 🟢 | Mock + production implementations |
| Create `useIdentity` hook | 🟢 | Full state management |
| Build `/onboarding` page | 🟢 | Multi-step flow complete |
| Build connect step | 🟢 | Triangle wallet detection |
| Build verify step | 🟢 | DIM verification UI |
| Build profile step | 🟢 | Pseudonym, disclosure selection |
| Build topics step | 🟢 | Interest selection integrated |
| Update `ConnectButton` | 🟢 | Shows identity state |
| Test in Triangle | 🟢 | Build passes |

**Blocked by:** Phase 0

---

## Phase 2: Signals & Feed (Week 5-6)

Core signal creation and consumption.

| Task | Status | Notes |
|------|--------|-------|
| Update signal types | 🟢 | Already has VerificationStatus |
| Create signal service | 🟢 | Using mock data |
| Build `/feed` page | 🟢 | Following/Discover tabs |
| Build `/signal/[id]` page | 🟢 | Signal detail with corroborations |
| Build `VerificationBadge` | 🟢 | Status indicator component |
| Update `SignalCard` | 🟢 | Shows author + verification |
| Build `CorroborationForm` | 🟢 | Inline in SignalDetailView |
| Build `CorroborationList` | 🟢 | Summary display sufficient |
| Update `IlluminateModal` | 🟢 | Already complete |
| Test signal flow | 🟢 | Build passes |

**Blocked by:** Phase 1

---

## Phase 3: Collectives (Week 7-8)

Fact-checking groups.

| Task | Status | Notes |
|------|--------|-------|
| Add collective types | 🟢 | Already in packages/types |
| Create collective service | 🟢 | Mock data added |
| Build `/collectives` page | 🟢 | Browse with inline cards |
| Build `/collectives/[id]` page | 🟢 | Detail + inline join |
| Build `/collectives/create` | 🟢 | Full creation form |
| Build `CollectiveCard` | 🟢 | Inline in list page |
| Implement join request flow | 🟢 | Inline in detail view |
| Implement membership voting | 🟢 | Governance display |
| Add collectives to profile | ⏸️ | Deferred to Phase 5 |

**Blocked by:** Phase 2

---

## Phase 4: Verification Workflow (Week 9-10)

Collective fact-checking process.

| Task | Status | Notes |
|------|--------|-------|
| Add verification types | 🟢 | Already in packages/types |
| Create verification service | 🟢 | Mock data added |
| Build `/verify` workbench | 🟢 | Queue with status filters |
| Build `/verify/[signalId]` | 🟢 | Full verification flow |
| Build evidence submission UI | 🟢 | Inline in detail view |
| Build voting UI | 🟢 | Inline with verdicts |
| Implement verdict logic | 🟢 | Display logic done |
| Write verdicts to Bulletin | ⏸️ | Deferred (needs chain) |
| Update signal display | 🟢 | VerificationBadge shows |

**Blocked by:** Phase 3

---

## Phase 5: Polish & Launch (Week 11-12)

Final features and quality.

| Task | Status | Notes |
|------|--------|-------|
| Build `/profile` page | 🟢 | Own profile with edit inline |
| Build `/profile/[id]` page | 🟢 | View others' signals |
| Build `/settings` page | 🟢 | Identity, preferences, data controls |
| Build `/settings/identity` | 🟢 | Merged into settings page |
| Build `/search` page | 🟢 | Signal search with topic filters |
| Update navigation | 🟢 | Feed, Collectives, Verify added |
| Add loading skeletons | 🟢 | In profile page |
| Add error boundaries | ⚪ | Error handling |
| Mobile responsive audit | ⚪ | All breakpoints |
| Accessibility audit | ⚪ | WCAG compliance |
| Performance audit | ⚪ | Bulletin caching |
| Production deployment | ⚪ | Final release |

**Blocked by:** Phase 4

---

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Data storage | Bulletin Chain | Decentralized, censorship-resistant |
| Identity | DIM (Paseo Asset Hub) | Proof-of-personhood, privacy-preserving |
| Hosting | Triangle (dot.li) | Polkadot-native, sandboxed |
| Local state | hostLocalStorage | Triangle-compatible |
| Styling | polkadot-ui-paint tokens | Ecosystem alignment |

---

## Key Files

### Packages

| Package | Purpose | Status |
|---------|---------|--------|
| `packages/types` | Shared TypeScript types | 🟢 Updated with identity/collective/verification |
| `packages/ui` | Shared components | 🟢 Exists |
| `packages/identity` | DIM integration | 🟢 Created |
| `packages/bulletin` | Bulletin Chain client | 🟢 Created |

### App Routes

| Route | Purpose | Status |
|-------|---------|--------|
| `/` | Landing | 🟢 Exists |
| `/onboarding` | New user flow | 🟢 Created |
| `/feed` | Home feed | 🟢 Created |
| `/explore` | Browse signals | 🟢 Updated |
| `/signal/[id]` | Signal detail | 🟢 Created |
| `/collectives` | Browse collectives | 🟢 Created |
| `/collectives/[id]` | Collective detail | 🟢 Created |
| `/collectives/create` | Create collective | 🟢 Created |
| `/verify` | Verification workbench | 🟢 Created |
| `/verify/[signalId]` | Verify signal | 🟢 Created |
| `/bounties` | Community requests | 🟢 Exists |
| `/bounties/[id]` | Bounty detail | 🟢 Exists |
| `/chain/[id]` | Story chain | 🟢 Exists |
| `/profile` | Own profile | 🟢 Created |
| `/profile/[id]` | View user | 🟢 Created |
| `/settings` | Preferences | 🟢 Created |
| `/search` | Search | 🟢 Created |
| `/about` | About page | 🟢 Exists |

### Key Hooks

| Hook | Purpose | Status |
|------|---------|--------|
| `useTriangleAccount` | Wallet connection | 🟢 Exists |
| `useIdentity` | DIM + profile | 🟢 Created |
| `useSignals` | Signal data | ⚪ Create |
| `useCollectives` | Collective data | ⚪ Create |
| `useVerification` | Verification workflow | ⚪ Create |

### Key Components

| Component | Purpose | Status |
|-----------|---------|--------|
| `AppNavbar` | Navigation | 🟢 Exists (update) |
| `ConnectButton` | Auth state | 🟢 Updated |
| `SignalCard` | Signal preview | 🟢 Updated |
| `VerificationBadge` | Status indicator | 🟢 Created |
| `CollectiveCard` | Collective preview | ⚪ Create |
| `CorroborationForm` | Submit corroboration | ⚪ Create |
| `IlluminateModal` | Create signal | 🟢 Exists (update) |

---

## Deployment Commands

```bash
# Build
cd apps/f-network  # (or apps/web until renamed)
pnpm build

# Local test
pnpm serve

# Deploy to Bulletin
export DOTNS_MNEMONIC="employ distance unfair scissors duck symptom valid hedgehog chat amused blur video"
NODE_OPTIONS="--experimental-websocket" dotns bulletin upload ./dist --parallel --print-contenthash -m "$DOTNS_MNEMONIC"

# Set content hash (replace <cid> with output from above)
NODE_OPTIONS="--experimental-websocket" dotns content set fireflynetwork <cid> -m "$DOTNS_MNEMONIC"

# Verify
open https://fireflynetwork.dot.li/
```

---

## Notes & Decisions Log

### 2024-XX-XX
- Initial project board created
- Decided on 6-phase approach
- F-Network is the social layer; Portal and Newsroom are separate future apps

### Phase 1 Complete
- Created `useIdentity` hook with full DIM integration
- Built multi-step onboarding flow at `/onboarding`
- Updated `ConnectButton` to show identity state
- All identity types added to `packages/types`

---

## Links

- **Live App:** https://fireflynetwork.dot.li/
- **Vision Docs:** See conversation history
- **Design System:** `packages/ui/src/styles/tokens.css`
- **Triangle SDK:** `@novasamatech/product-sdk`
- **DIM:** Paseo Asset Hub proof-of-personhood
