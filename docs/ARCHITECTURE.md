# Architecture Documentation

This document describes the technical architecture of the Firefly Network codebase.

## Overview

The Firefly Network is built as a pnpm monorepo with Turborepo for task orchestration. The architecture follows a clean separation between the web application and shared packages.

```
cocuyo/
├── apps/
│   └── web/                 # Next.js web application
├── packages/
│   ├── bulletin/            # Bulletin Chain client
│   ├── identity/            # DIM identity integration
│   ├── types/               # Shared TypeScript types
│   └── ui/                  # Shared UI component library
└── docs/                    # Documentation
```

## Packages

### @cocuyo/types

Shared TypeScript type definitions and branded type utilities.

**Key exports:**

- `Signal`, `StoryChain`, `ChainPreview` — Core data structures
- `FireflyProfile`, `FireflyAuthor` — Identity types
- `Corroboration`, `VerificationRequest` — Verification system types
- `Bounty`, `BountyPreview` — Bounty system types
- `Collective`, `CollectivePreview` — Collective types
- Brand creators: `createSignalId()`, `createChainId()`, etc.

**Design decisions:**

- Uses branded types (nominal typing) for IDs to prevent mixing
- All timestamps are Unix timestamps in seconds
- Optional fields use explicit `undefined` rather than `null`

### @cocuyo/ui

Shared React component library with Firefly Network design system.

**Components:**

- `Button` — Primary, secondary, and illuminate variants
- `Navbar` — Site header with navigation and illuminate CTA
- `Footer` — Site footer with links and attribution
- `SignalCard` — Signal display component
- `VerificationBadge` — Status indicator for verification state
- `FireflySymbol` — The ✦ symbol used throughout the UI

**Design system:**

- CSS custom properties for theming (light/dark)
- Tailwind CSS for utility styling
- Unbounded font for headings (Polkadot ecosystem)
- Inter font for body text
- Firefly gold (#E8B931) as primary accent

### @cocuyo/identity

DIM (Decentralized Identity Module) integration for proof-of-personhood.

**Current state:** Mock implementation for development

**Key exports:**

- `createDIMClient()` — Factory for DIM client
- `generatePseudonym()` — Deterministic pseudonym from credential
- `DIMClient` interface — Status checking and verification

**Future integration:**

- Real DIM pallet interaction via polkadot-api
- Zero-knowledge credential verification
- Pseudonym derivation from on-chain data

### @cocuyo/bulletin

Bulletin Chain client for decentralized content storage.

**Key exports:**

- `calculateCID()` — Compute content identifier for data
- `BulletinClient` — Upload and retrieve content
- `ContentIndex` — Index structure for content discovery

**CID calculation:**

- Uses SHA-256 hashing
- Multihash encoding for compatibility
- Deterministic: same content always produces same CID

## Web Application

### Routing

Uses Next.js 15+ App Router with locale-based routing:

```
src/app/
├── [locale]/
│   ├── page.tsx              # Landing page
│   ├── about/page.tsx        # About page
│   ├── explore/page.tsx      # Explore signals/chains
│   ├── feed/page.tsx         # Personal feed
│   ├── chain/[id]/page.tsx   # Story chain detail
│   ├── signal/[id]/page.tsx  # Signal detail
│   ├── bounties/page.tsx     # Bounty listing
│   ├── collectives/page.tsx  # Collective listing
│   ├── verify/page.tsx       # Verification queue
│   └── settings/page.tsx     # User settings
├── layout.tsx
└── not-found.tsx
```

### Internationalization

Uses next-intl for localization:

- English (`en`) — Default
- Spanish (`es`) — Latin American Spanish

Messages stored in `i18n/messages/{locale}.json`.

### State Management

Minimal state management approach:

- **URL state** for navigation and filters
- **React Context** for global concerns (theme, illuminate modal)
- **Hooks** for feature-specific state (useIdentity, useBulletin)

No external state library (Redux, Zustand) is used.

### Service Layer

All data access goes through service abstractions:

```
src/lib/services/
├── index.ts                   # Service exports
├── mock-signal-service.ts     # Signal operations
├── mock-chain-service.ts      # Chain operations
├── mock-data.ts               # Mock data for development
└── mock-data-bounties.ts      # Mock bounty data
```

**Current state:** Mock services with in-memory data

**Future state:** Services will swap to chain-backed implementations when DIM and Bulletin Chain integration is complete.

### Host Integration

Triangle SDK integration for wallet connection:

```
src/lib/host/
├── detect.ts     # Host environment detection
├── storage.ts    # HostAPI-compliant storage
└── wallet.ts     # Wallet connection utilities
```

The app can run in two modes:

1. **Standalone** — Direct browser access, localStorage
2. **Hosted** — Running inside Triangle, uses HostAPI

## Data Flow

### Signal Creation (Illuminate)

```
User Input
    ↓
IlluminateForm validates
    ↓
useIlluminate.submit()
    ↓
signalService.illuminate()
    ↓
calculateCID() for content
    ↓
[Future: Write to Bulletin Chain]
    ↓
Return Signal with CID
```

### Identity Verification

```
User connects wallet
    ↓
useTriangleAccount detects connection
    ↓
useIdentity initializes
    ↓
createDIMClient()
    ↓
client.getStatus()
    ↓
[Future: Verify against DIM pallet]
    ↓
client.getCredential()
    ↓
User creates profile (pseudonym, disclosure level)
    ↓
saveProfile() to storage
```

## Security Architecture

### Threat Model

Primary threats:

1. **Identity exposure** — Revealing firefly's real identity
2. **Censorship** — Removing or suppressing signals
3. **Manipulation** — Fake signals, sybil attacks
4. **Surveillance** — Tracking user activity

### Mitigations

1. **DIM proof-of-personhood** — Proves humanity without revealing identity
2. **Bulletin Chain** — Censorship-resistant storage
3. **Reputation staking** — Economic cost to manipulation
4. **Minimal data collection** — No PII stored anywhere

### Content Security Policy

Strict CSP enforced:

- No inline scripts
- No eval()
- HTTPS only
- SRI for external resources

## Build and Deploy

### Development

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server
pnpm build            # Build all packages
pnpm check            # Run all checks
```

### Production Build

```bash
pnpm build            # Build packages then app
# Output: apps/web/dist/
```

Static export (`output: 'export'`) for deployment to:

- GitHub Pages (demo)
- Triangle/Bulletin (production)
- Any static host

### CI/CD

GitHub Actions workflows:

- `deploy-pages.yml` — Deploy to GitHub Pages on push to main
- `deploy-bulletin.yml` — Deploy to Bulletin Chain

## Future Architecture

### Phase 2: DIM Integration

- Replace mock DIM client with real pallet interaction
- Implement credential verification flow
- Add pseudonym derivation from on-chain data

### Phase 3: Bulletin Chain

- Replace mock services with chain-backed services
- Implement signal storage and retrieval
- Add content indexing

### Phase 4: Full System

- Corroboration logic on-chain
- Reputation calculation
- Collective governance
- Bounty escrow and fulfillment
