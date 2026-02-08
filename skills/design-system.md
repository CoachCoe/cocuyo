# Firefly Network Design System Skill

## Overview

This skill defines the design system for the Firefly Network. The visual identity is rooted in the Polkadot ecosystem's black-and-white aesthetic, extended with a single warm accent color (firefly gold) that represents moments of illumination.

**Core design philosophy:** Minimal. High-contrast. Intentionally anti-social-media. The interface communicates purpose and substance, not engagement and personality.

---

## Visual Language

### The Firefly Metaphor in UI

The firefly metaphor should subtly inform visual decisions:

- **Illumination = emphasis.** Firefly gold (#E8B931) is reserved for moments where something "lights up" — the Illuminate button, active story chains, corroboration confirmations, newly contributed signals.
- **Darkness = canvas.** The dark background is not decorative — it represents the information void that fireflies illuminate. Content emerges from darkness.
- **Glow, not flash.** Animations should feel like a warm glow, not a strobe. Ease-in-out, 200-400ms transitions. No bouncing, no shaking, no confetti.
- **Constellation, not grid.** When displaying multiple signals or chains, prefer organic spatial layouts (map view, node graph) over rigid grids where possible.

### Color Usage Rules

| Color | Token | Usage | Never Use For |
|-------|-------|-------|--------------|
| Black (#000000) | `--color-bg-primary` | Page background, primary surfaces | Text on dark background |
| White (#FFFFFF) | `--color-text-primary` | Primary text, primary buttons | Backgrounds (except light mode toggle) |
| Firefly Gold (#E8B931) | `--color-accent` | Illuminate button, active indicators, key moments | Body text, large surfaces, borders |
| Green (#4ADE80) | `--color-corroborated` | Corroboration count, verified indicators | General success states unrelated to verification |
| Red (#F87171) | `--color-challenged` | Challenge indicators, disputed signals | Error states (use a muted approach for errors) |
| Gray (#A0A0A0) | `--color-text-secondary` | Secondary text, metadata, timestamps | Primary content |
| Polkadot Pink (#E6007A) | `--color-polkadot-pink` | "Built on Polkadot" badge ONLY | Anywhere else in the UI |

**The 90/8/2 rule:** ~90% black/white/gray, ~8% subtle grays for depth, ~2% accent color. If you're using gold on more than one or two elements per screen, you're overusing it.

### Typography Implementation

```css
/* Import from Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
```

**Unbounded** — Display/headings only. Weights 300-700. This is the Polkadot ecosystem's open-source font and anchors us visually in the ecosystem.

Usage:
- Page titles: Unbounded 700, `--text-3xl` to `--text-4xl`
- Section headings: Unbounded 600, `--text-xl` to `--text-2xl`
- Navigation items: Unbounded 500, `--text-sm`
- Wordmark: Unbounded 700

**Inter** — Body text, UI elements, everything else. Weights 300-700.

Usage:
- Body text: Inter 400, `--text-base`, line-height 1.6
- Signal content: Inter 400, `--text-base`
- Metadata/timestamps: Inter 400, `--text-xs` to `--text-sm`
- Button labels: Inter 500, `--text-sm`
- Form inputs: Inter 400, `--text-base`

**JetBrains Mono** — Verification trails, cryptographic hashes, technical data only.

Usage:
- DIM credential displays: JetBrains Mono 400, `--text-xs`
- Verification trail entries: JetBrains Mono 400, `--text-sm`
- Hash displays: JetBrains Mono 400, `--text-xs`, truncated with ellipsis

---

## Component Patterns

### Navbar

```
┌──────────────────────────────────────────────────────────┐
│  ✦ FIREFLY NETWORK          Explore   Bounties   About  │
│                                           [Illuminate ✦] │
└──────────────────────────────────────────────────────────┘
```

- Fixed position, top, full width
- Background: `--color-bg-primary` with subtle bottom border (`--color-border-default`)
- Wordmark: Unbounded 700, white, with small firefly symbol (✦) in gold
- Nav links: Inter 500, `--text-sm`, `--color-text-secondary`, hover → `--color-text-primary`
- Active link: `--color-text-primary` with gold underline accent (2px)
- "Illuminate" CTA: Gold accent button, right-aligned. This is the ONLY gold-accented element in the nav.
- Mobile: Hamburger menu, slide-in panel from right, dark background
- Height: 64px desktop, 56px mobile
- z-index: 50

### Footer

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  ✦ FIREFLY NETWORK                                      │
│  Lights in the dark.                                     │
│                                                          │
│  Network          Resources        Community             │
│  Explore          Documentation    GitHub                 │
│  Bounties         About            Polkadot               │
│  Story Chains     Contributing     Web3 Foundation        │
│                                                          │
│  ─────────────────────────────────────────────────────── │
│  Built on Polkadot [●] │ Open Source │ © 2026            │
└──────────────────────────────────────────────────────────┘
```

- Background: `--color-bg-primary`
- Top border: `--color-border-default`
- Wordmark: Unbounded 600, white
- Tagline: Inter 400, `--color-text-secondary`, italic
- Column headings: Unbounded 500, `--text-sm`, `--color-text-primary`
- Links: Inter 400, `--text-sm`, `--color-text-secondary`, hover → `--color-text-primary`
- "Built on Polkadot" badge: Uses `--color-polkadot-pink` for the Polkadot dot symbol ONLY
- Generous vertical padding (80px top, 40px bottom)

### Signal Card

The signal card is the primary content element. It must feel substantial without being heavy.

```
┌──────────────────────────────────────────────────────┐
│  Environmental · Concord, NH · 2h ago                │
│                                                      │
│  Chemical smell near the river, started three days   │
│  ago. Strongest in the morning hours near the old    │
│  mill site.                                          │
│                                                      │
│  ◉ 7 corroborations  ⚡ 2 evidence  △ 1 challenge   │
│  ──────────────────────────────────────────────────  │
│  Part of: Water Quality — Concord River Basin ──→    │
└──────────────────────────────────────────────────────┘
```

- Background: `--color-bg-tertiary`
- Border: 1px `--color-border-default`, hover → `--color-border-emphasis`
- Context tags: `--text-xs`, `--color-text-tertiary`, separated by middot
- Content: Inter 400, `--text-base`, `--color-text-primary`, line-height 1.6
- Corroboration count: `--color-corroborated` for the number, rest in `--color-text-secondary`
- Chain link: `--text-sm`, `--color-text-secondary`, hover → `--color-accent`
- No author attribution visible (anonymous by design)
- Padding: 24px
- Border-radius: 8px

### Illuminate Button

The single most important interactive element. It should feel like lighting a signal fire.

- Default: Gold border (#E8B931), gold text, transparent background
- Hover: Gold background, black text, subtle glow (`box-shadow: 0 0 20px rgba(232, 185, 49, 0.3)`)
- Active/pressed: Slightly brighter gold, glow intensifies
- Disabled: Gray border, gray text, no glow
- Icon: Small firefly symbol (✦) to the left of text
- Text: "Illuminate" in Inter 500
- Transition: 200ms ease-in-out on all properties
- This is the ONLY button in the app that uses the gold accent

### Corroboration Interface

When a firefly corroborates a signal, the interaction should feel weighty — this is a reputation-staked act.

- Corroboration types displayed as distinct options: Witness, Evidence, Expertise, Challenge
- Each type has a brief description of what the corroboration means
- Confirmation step required: "You are staking your reputation on this corroboration"
- On confirmation: Brief gold pulse animation on the corroboration count
- Challenge option visually distinct (uses `--color-challenged` accent)

---

## Animation Guidelines

- **Default duration:** 200ms for micro-interactions, 300-400ms for transitions
- **Easing:** `ease-in-out` for most, `ease-out` for entrances, `ease-in` for exits
- **Glow effects:** Use `box-shadow` with rgba gold, never `filter: blur`
- **No layout shift animations** — content should not jump around
- **Respect `prefers-reduced-motion`** — disable all non-essential animations

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Responsive Breakpoints

```css
--breakpoint-sm: 640px;    /* Mobile landscape */
--breakpoint-md: 768px;    /* Tablet */
--breakpoint-lg: 1024px;   /* Desktop */
--breakpoint-xl: 1280px;   /* Wide desktop */
```

- Mobile-first approach — base styles are mobile
- Navbar collapses to hamburger at `--breakpoint-md`
- Signal cards: single column on mobile, max-width 720px on desktop (readability)
- Footer: stacked columns on mobile, horizontal on desktop

---

## Anti-Patterns (DO NOT)

- No infinite scroll — use pagination or "Load more" with intentional action
- No notification badges/counts — no red dots, no unread counts
- No user avatars or profile images — fireflies are anonymous
- No like/heart/reaction buttons — corroboration is the only interaction
- No share/retweet mechanics — information spreads through corroboration, not amplification
- No follower/following counts — impossible by design
- No algorithmic feed — display by recency, corroboration weight, or geography
- No engagement metrics visible to users — no view counts, no "trending"
- No bright colors for non-semantic purposes — the palette is deliberate
- No stock photography or illustrations — use the firefly symbol and typographic hierarchy
- No cookie consent banners — we don't use cookies. Display nothing.
- No third-party embeds (YouTube, Twitter, etc.) — no external tracking
