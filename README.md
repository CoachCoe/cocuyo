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

## Features

- **Explore View** — Browse signals and story chains in list or map view
- **Interactive Map** — Visualize signals (gold markers) and story chains (green rings) geographically using Leaflet
- **Illuminate Modal** — Universal signal creation flow with smart suggestions for linking to chains and bounties
- **Information Bounties** — Fund requests for specific information; contributors earn rewards
- **Wallet Connection** — Connect via Web3Modal for identity verification
- **Light/Dark Theme** — Toggle between light and dark modes
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
│   └── web/              # Next.js 14+ web application
├── packages/
│   ├── types/            # Shared TypeScript types
│   └── ui/               # Shared UI component library
├── skills/               # Claude Code skill files
│   ├── design-system.md
│   ├── security.md
│   └── polkadot-web3.md
└── docs/                 # Documentation
```

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS + CSS custom properties |
| Fonts | Unbounded (Polkadot ecosystem) + Inter |
| Maps | Leaflet + React-Leaflet |
| Web3 | Web3Modal + Ethers.js |
| Monorepo | pnpm workspaces + Turborepo |
| Testing | Vitest + React Testing Library + Playwright |

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
