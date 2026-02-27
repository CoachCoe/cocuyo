---
name: design-system
description: "Implement Firefly Network visual identity and UI components. Triggers: design, UI, component, styling, color, typography, animation, dark mode, theme"
---

# Design System Skill

## When to Activate

- Creating or modifying UI components
- Implementing visual styles or theming
- Working with colors, typography, or spacing
- Adding animations or transitions
- Implementing responsive layouts
- Reviewing UI for design consistency

---

## Global Invariants

| Rule | Enforcement | Status |
|------|-------------|--------|
| 90/8/2 color ratio | 90% black/white, 8% gray, 2% accent | MANDATORY |
| Firefly gold reserved | Only for "Illuminate" action | MANDATORY |
| Polkadot pink reserved | Only for ecosystem attribution | MANDATORY |
| No engagement metrics UI | No likes, no follower counts | MANDATORY |
| No user avatars | Fireflies are anonymous | MANDATORY |
| Unbounded for headings | Display/headings only | MANDATORY |
| Inter for body | Body text, UI elements | MANDATORY |
| JetBrains Mono for code | Verification trails, hashes | MANDATORY |

---

## Color Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg-primary` | #000000 | Page background |
| `--color-bg-secondary` | #0A0A0A | Slightly lifted surfaces |
| `--color-bg-tertiary` | #141414 | Card backgrounds |
| `--color-bg-elevated` | #1A1A1A | Elevated surfaces |
| `--color-text-primary` | #FFFFFF | Primary text |
| `--color-text-secondary` | #A0A0A0 | Secondary/muted text |
| `--color-text-tertiary` | #666666 | Disabled text |
| `--color-accent` | #E8B931 | Firefly gold (ILLUMINATE ONLY) |
| `--color-corroborated` | #4ADE80 | Corroboration indicators |
| `--color-challenged` | #F87171 | Challenge indicators |
| `--color-polkadot-pink` | #E6007A | Polkadot attribution ONLY |

---

## Typography Scale

| Token | Size | Usage |
|-------|------|-------|
| `--text-xs` | 0.75rem (12px) | Metadata, timestamps |
| `--text-sm` | 0.875rem (14px) | Secondary text, nav |
| `--text-base` | 1rem (16px) | Body text |
| `--text-lg` | 1.125rem (18px) | Emphasis |
| `--text-xl` | 1.25rem (20px) | Section headers |
| `--text-2xl` | 1.5rem (24px) | Page headers |
| `--text-3xl` | 2rem (32px) | Hero text |
| `--text-4xl` | 2.5rem (40px) | Landing hero |

---

## Contrastive Exemplars

### Color Usage

✅ CORRECT:
```tsx
// Illuminate button — ONLY place for gold accent
<button className="border-accent text-accent hover:bg-accent hover:text-black">
  Illuminate
</button>
```

❌ FAIL:
```tsx
// Using gold accent for non-illuminate elements
<Card className="border-accent">  // WRONG: gold for a card
  <Badge className="bg-accent">New</Badge>  // WRONG: gold for a badge
</Card>
```

### Typography

✅ CORRECT:
```tsx
// Unbounded for headings, Inter for body
<h1 className="font-display text-3xl">Story Chain</h1>
<p className="font-body text-base">Signal content here...</p>
```

❌ FAIL:
```tsx
// Unbounded for body text
<p className="font-display text-base">Signal content...</p>  // WRONG
```

### Component Patterns

✅ CORRECT:
```tsx
// SignalCard with proper structure
<article className="bg-tertiary border border-default rounded-lg p-6">
  <div className="text-xs text-tertiary">Environmental · Concord, NH · 2h ago</div>
  <p className="text-base text-primary mt-2">Chemical smell near the river...</p>
  <div className="text-sm text-secondary mt-4">
    <span className="text-corroborated">7</span> corroborations
  </div>
</article>
```

❌ FAIL:
```tsx
// Card with social media patterns
<article>
  <img src={user.avatar} />  // WRONG: no avatars
  <LikeButton />  // WRONG: no likes
  <ShareButton />  // WRONG: no shares
  <span>1.2K views</span>  // WRONG: no engagement metrics
</article>
```

---

## Animation Guidelines

| Property | Duration | Easing |
|----------|----------|--------|
| Micro-interactions | 200ms | ease-in-out |
| Transitions | 300-400ms | ease-in-out |
| Entrances | 300ms | ease-out |
| Exits | 200ms | ease-in |

### Glow Effects

✅ CORRECT:
```css
box-shadow: 0 0 20px rgba(232, 185, 49, 0.3);
```

❌ FAIL:
```css
filter: blur(10px);  /* WRONG: use box-shadow for glow */
```

### Reduced Motion

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

| Breakpoint | Size | Usage |
|------------|------|-------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Wide desktop |

Mobile-first approach — base styles are mobile.

---

## Anti-Patterns

| Pattern | Status | Reason |
|---------|--------|--------|
| Infinite scroll | FORBIDDEN | Use pagination or "Load more" |
| Notification badges | FORBIDDEN | No red dots, no unread counts |
| User avatars | FORBIDDEN | Fireflies are anonymous |
| Like/heart buttons | FORBIDDEN | Corroboration is the only interaction |
| Share/retweet buttons | FORBIDDEN | No amplification mechanics |
| Follower counts | FORBIDDEN | Impossible by design |
| View counts | FORBIDDEN | No engagement metrics |
| Bright non-semantic colors | FORBIDDEN | Palette is deliberate |
| Cookie consent banners | FORBIDDEN | We don't use cookies |
| Third-party embeds | FORBIDDEN | No external tracking |

---

## Component Quick Reference

### Navbar
- Fixed top, black background
- Height: 64px desktop, 56px mobile
- Wordmark: Unbounded 700, white, with gold firefly symbol
- "Illuminate" CTA: gold accent (ONLY gold element)
- z-index: 50

### Footer
- Black background, top border
- "Built on Polkadot" with pink dot (ONLY pink element)
- Generous vertical padding (80px top, 40px bottom)

### SignalCard
- Background: `--color-bg-tertiary`
- Border: 1px `--color-border-default`
- No author attribution (anonymous)
- Padding: 24px
- Border-radius: 8px

### Illuminate Button
- Default: gold border, gold text, transparent bg
- Hover: gold bg, black text, subtle glow
- ONLY button that uses gold accent
