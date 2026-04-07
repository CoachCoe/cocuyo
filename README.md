# Cocuyo — The Firefly Network

> Lights in the Dark — A surveillance-resistant network for collective intelligence.

**Anonymous but Human. Verified but Private. Distributed but Connected.**

## What is This?

The Firefly Network (codenamed Cocuyo, after the Caribbean bioluminescent beetle) is a decentralized platform where verified humans share, corroborate, and build collective understanding — without exposing their identities.

This is **not** a social media platform. It is a collective intelligence network built on Polkadot infrastructure where:

- **Fireflies** are verified human participants (via DIM proof-of-personhood)
- **Posts** are observations, evidence, or data points shared by fireflies
- **Story Chains** emerge when posts connect around topics or events
- **Corroboration** is the core interaction — a reputation-staked act of verification, not a "like"
- **Bounties** are community-funded requests for specific information

## Demo

**GitHub Pages**: [coachcoe.github.io/cocuyo](https://coachcoe.github.io/cocuyo/)

The demo supports English and Latin American Spanish (es).

## Features

### Core Features
- **Posts** — Illuminate observations with photos (up to 3), topics, and location
- **Story Chains** — Emergent structures formed when posts connect around topics
- **Corroboration** — Reputation-staked verification with evidence (witness, expertise, challenge)
- **Information Bounties** — Community-funded requests for information with rewards

### Content & Verification
- **Claims** — Verifiable truth targets extracted from posts with evidence bundles
- **Verdicts** — Collective decisions on claim veracity (confirmed, disputed, false, synthetic, inconclusive)
- **Trust Drawer** — View all evidence, corroborations, and verdicts for a post
- **Collectives** — Fact-checking groups that verify posts collaboratively

### User Experience
- **Explore View** — Browse posts and story chains in list or map view
- **Illuminate Modal** — Universal post creation with smart chain/bounty suggestions
- **Profile Dashboard** — Private view of your topic-weighted reputation
- **Wallet Connection** — Connect via Triangle SDK or browser extensions
- **Light/Dark Theme** — Toggle between light and dark modes
- **Localization** — English and Latin American Spanish (next-intl)
- **Responsive Design** — Works on desktop and mobile

## Web3 Integration

### Bulletin Chain (Content Storage)
Posts are stored on the Bulletin Chain via `@polkadot-apps/bulletin`:
- **Host mode** (Triangle): Uses preimageManager API for signing
- **Standalone**: Uses dev signer (//Alice) for development

Content is fetchable via IPFS gateways:
- `https://ipfs.dotspark.app/ipfs/{cid}`
- `https://dweb.link/ipfs/{cid}`
- `https://ipfs.io/ipfs/{cid}`

### Smart Contracts (Paseo Testnet)
| Contract | Address |
|----------|---------|
| BountyEscrow | `0xAA3Db3F2BD6E5D0c7C44e8BFc51Ba79A6d65773A` |
| FireflyReputation | `0xb630cB019b94b48aB27A2f61A31Ee5E220994047` |

Contracts are UUPS upgradeable and deployed to Paseo Asset Hub (chain ID: 420420417).

### Wallet Support
- **Triangle SDK** — Auto-connects via Spektr extension in Host mode
- **Browser extensions** — Polkadot.js, Talisman, SubWallet, etc.

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build all packages
pnpm build

# Run all checks (lint, typecheck, test)
pnpm check
```

## Project Structure

```
cocuyo/
├── apps/
│   └── web/              # Next.js 15+ web application
│       ├── src/app/[locale]/  # Locale-based routing (en, es)
│       └── i18n/         # Internationalization config
├── packages/
│   ├── bulletin/         # Bulletin chain client (CID calculation)
│   ├── contracts/        # Solidity smart contracts (Hardhat)
│   ├── identity/         # DIM identity integration (mocked)
│   ├── types/            # Shared TypeScript types
│   └── ui/               # Shared UI component library
├── .claude/              # AI agent configuration
│   ├── AGENTS.md         # Agent constraints & instructions
│   └── skills/           # Domain knowledge skills
└── docs/                 # Documentation
```

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15+ (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS + CSS custom properties |
| Fonts | Unbounded (Polkadot ecosystem) + Inter |
| Maps | Leaflet + D3 + TopoJSON |
| Localization | next-intl |
| Wallet | @polkadot-apps/signer + Triangle SDK |
| Blockchain | @polkadot-apps/bulletin, polkadot-api |
| Smart Contracts | Solidity 0.8.28, Hardhat, OpenZeppelin |
| Monorepo | pnpm workspaces + Turborepo |
| Testing | Vitest + React Testing Library |
| CI/CD | GitHub Actions → GitHub Pages |

## Localization

The app supports multiple locales via next-intl:

- **English** (`/en/`) — Default
- **Spanish** (`/es/`) — Latin American Spanish

Translation files are in `apps/web/i18n/messages/`.

## Deployment

### GitHub Pages (Demo)

Pushes to `main` automatically deploy to GitHub Pages via the workflow in `.github/workflows/deploy-pages.yml`.

### Triangle (Production)

The app exports as static HTML (`output: 'export'`) and can be deployed to Triangle for decentralized hosting:
- Auto-detects Host environment via `@polkadot-apps/signer`
- Requests permissions for map tiles (OpenStreetMap, CARTO) and geocoding (Nominatim)
- Bulletin uploads route through preimageManager

## Design System

The visual identity is rooted in the Polkadot ecosystem's black-and-white aesthetic with a single warm accent — **firefly gold (#E8B931)** — used sparingly for moments of illumination.

Key principles:
- Minimal, high-contrast, anti-social-media
- No infinite scroll, no notification badges, no engagement metrics
- The primary action is "Illuminate" — not "post" or "share"

## Development

See [CLAUDE.md](./CLAUDE.md) for comprehensive development guidelines, coding standards, and architecture documentation.

## Built on Polkadot

The Firefly Network is built on and for the Polkadot ecosystem, leveraging:
- **DIM** — Decentralized identity for proof-of-personhood
- **Bulletin Chain** — Censorship-resistant storage
- **Paseo Asset Hub** — Smart contracts for bounties and reputation

[Learn more about Polkadot](https://polkadot.com)

## License

Open source. All code is transparent. All verification trails are auditable.

---

*Millions of tiny sparks can illuminate an entire nation.*
