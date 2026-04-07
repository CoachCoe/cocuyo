# Cocuyo — The Firefly Network

> Lights in the Dark — A surveillance-resistant network for collective intelligence.

**Anonymous but Human. Verified but Private. Distributed but Connected.**

## What is This?

The Firefly Network (codenamed Cocuyo, after the Caribbean bioluminescent beetle) is a decentralized platform where verified humans share, corroborate, and build collective understanding — without exposing their identities.

This is **not** a social media platform. It is a collective intelligence network built on Polkadot infrastructure where:

- **Fireflies** are verified human participants (via DIM proof-of-personhood)
- **Signals** are observations, evidence, or data points — not "posts"
- **Story Chains** emerge when signals connect around topics or events
- **Corroboration** is the core interaction — a reputation-staked act of verification, not a "like"
- **Bounties** are community-funded requests for specific information

## Demo

**GitHub Pages**: [coachcoe.github.io/cocuyo](https://coachcoe.github.io/cocuyo/)

The demo supports English and Latin American Spanish (es).

## Features

### Core Features
- **Signals** — Illuminate observations with photos (up to 3), topics, and location
- **Story Chains** — Emergent structures formed when signals connect around topics
- **Corroboration** — Reputation-staked verification (witness, evidence, expertise, challenge)
- **Information Bounties** — Community-funded requests for information with rewards

### Content & Verification
- **Posts** — Longer-form analysis and investigations from the network
- **Claims** — Verifiable truth targets extracted from posts with evidence bundles
- **Verification Workbench** — Review queue for collective fact-checking (requires membership)
- **Collectives** — Fact-checking groups that verify signals collaboratively

### User Experience
- **Explore View** — Browse signals and story chains in list or map view
- **Illuminate Modal** — Universal signal creation with smart chain/bounty suggestions
- **Profile Dashboard** — Private view of your topic-weighted reputation
- **Wallet Connection** — Connect via Triangle SDK for identity verification
- **Light/Dark Theme** — Toggle between light and dark modes
- **Localization** — English and Latin American Spanish (next-intl)
- **Responsive Design** — Works on desktop and mobile

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
│   ├── bulletin/         # Bulletin chain client
│   ├── contracts/        # Solidity smart contracts (Hardhat)
│   ├── identity/         # DIM identity integration
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
| Wallet | Triangle SDK (Nova Wallet) |
| Blockchain | Polkadot API, polkadot-api |
| Smart Contracts | Solidity, Hardhat, OpenZeppelin |
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

The app exports as static HTML (`output: 'export'`) and can be deployed to Triangle for decentralized hosting.

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
- **Polkadot parachains** — Verification and reputation logic

[Learn more about Polkadot](https://polkadot.com)

## License

Open source. All code is transparent. All verification trails are auditable.

---

*Millions of tiny sparks can illuminate an entire nation.*
