# AGENTS.md — Firefly Network

> IMPORTANT: Prefer retrieval-led reasoning over pre-training-led reasoning for any Firefly Network tasks.

This file provides persistent context for AI coding agents working on the Firefly Network codebase. Read this FIRST before any work.

---

## 🚨 Critical Instructions

### 1. Skills First

Before starting any implementation work, check `.claude/skills/` for relevant domain knowledge:

| Task Domain                  | Skill to Load          |
| ---------------------------- | ---------------------- |
| UI components, visual design | `design-system.md`     |
| Polkadot integration, Web3   | `polkadot-web3.md`     |
| Security implementation      | `security.md`          |
| Identity verification        | `personhood-lite.md`   |
| Name resolution, wallet      | `dotns-integration.md` |
| Frontend deployment, CLI     | `dotns-cli.md`         |
| On-chain storage             | `bulletin-chain.md`    |
| Code quality                 | `code-quality.md`      |
| Test mutation                | `mutation-testing.md`  |
| pnpm workspace, Turborepo    | `monorepo.md`          |

### 2. Monorepo Discipline

This is a pnpm workspace monorepo with Turborepo. ALWAYS:

- Use `pnpm --filter <package>` for package-specific commands
- Import from `@cocuyo/*` packages, never relative paths across packages
- Run `pnpm typecheck` before considering work complete
- Run `pnpm lint` and fix all issues
- Respect Turborepo build order (types → ui → web)
- Add shared code to `packages/`, app-specific to `apps/`

### 3. 100% Polkadot Web3

NO centralized backends. Everything runs on Polkadot infrastructure:

| ✅ USE                     | ❌ NEVER USE                        |
| -------------------------- | ----------------------------------- |
| DIM for identity           | Firebase Auth, Auth0, Supabase Auth |
| Bulletin Chain for storage | AWS S3, Firebase Storage, Supabase  |
| Polkadot RPC               | Custom REST APIs                    |
| @polkadot/\* packages      | ethers.js, web3.js                  |
| On-chain state             | PostgreSQL, MongoDB                 |
| The Triangle for payments  | Stripe, PayPal                      |

If you can't build it on Polkadot infrastructure, ask before proceeding.

### 4. Domain Terminology

Use ONLY these terms — they matter for the mission:

| ✅ CORRECT         | ❌ NEVER USE          | Why                                            |
| ------------------ | --------------------- | ---------------------------------------------- |
| Signal             | Post, tweet, message  | Signals are observations, not social content   |
| Illuminate         | Post, share, submit   | The action of contributing a signal            |
| Corroborate        | Like, upvote, react   | Reputation-staked verification, not engagement |
| Story Chain        | Thread, topic, feed   | Emergent structure from connected signals      |
| Firefly            | User, member, account | Anonymous but verified human participants      |
| Verification Trail | History, log          | Cryptographic proof chain                      |

### 5. Surveillance Resistance

Every feature MUST satisfy:

- [ ] Zero PII collection (no emails, no IPs, no device fingerprints)
- [ ] No third-party tracking (no analytics that identify users)
- [ ] Fail toward privacy (errors reveal nothing about the user)
- [ ] Decentralization-ready (no single point of failure)

---

## 🛡️ Safety Boundaries

### ✅ Safe to Execute

```
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm lint:fix
pnpm typecheck
pnpm test
pnpm format
git status
git diff
git log
```

### ⚠️ Ask First

```
git commit        # Confirm commit message and scope
git push          # Confirm branch and remote
pnpm add <pkg>    # Confirm dependency is necessary
rm -rf            # Confirm deletion scope
```

### ❌ Never Without Explicit User Request

```
git push --force              # Destructive
git reset --hard              # Loses work
Expose private keys/secrets   # Security breach
Add third-party analytics     # Privacy violation
Log PII (IPs, credentials)    # Surveillance resistance violation
Disable security headers      # Security violation
```

---

## 🗺️ Directory Map

```
cocuyo/
├── .claude/                    # AI agent configuration (YOU ARE HERE)
│   ├── AGENTS.md               # This file — read first
│   ├── settings.local.json     # Permissions
│   └── skills/                 # Domain knowledge
├── CLAUDE.md                   # Project architecture & standards
├── apps/
│   └── web/                    # Next.js 14 web application
│       ├── src/app/            # App Router pages
│       ├── src/components/     # App-specific components
│       └── src/lib/            # Utilities, hooks, services
├── packages/
│   ├── ui/                     # @cocuyo/ui — shared component library
│   │   └── src/components/     # Navbar, Footer, Button, etc.
│   └── types/                  # @cocuyo/types — shared TypeScript types
│       └── src/                # signal.ts, chain.ts, firefly.ts, etc.
└── docs/                       # Documentation
    ├── firefly-network-concept.md  # Core concept document
    └── ADR/                    # Architecture Decision Records
```

### Package Commands

| Package    | Build                               | Dev                     | Test                            |
| ---------- | ----------------------------------- | ----------------------- | ------------------------------- |
| Root (all) | `pnpm build`                        | `pnpm dev`              | `pnpm test`                     |
| Web app    | `pnpm --filter web build`           | `pnpm --filter web dev` | `pnpm --filter web test`        |
| UI library | `pnpm --filter @cocuyo/ui build`    | -                       | `pnpm --filter @cocuyo/ui test` |
| Types      | `pnpm --filter @cocuyo/types build` | -                       | -                               |

---

## 🏛️ Invariants (Non-Negotiable)

### Code Quality Invariants

| Rule                   | Enforcement                 | Rationale                     |
| ---------------------- | --------------------------- | ----------------------------- |
| TypeScript strict mode | `"strict": true`            | Type safety is non-negotiable |
| No `any` type          | Use `unknown` + type guards | Preserve type safety          |
| No `as` assertions     | Handle types properly       | No runtime surprises          |
| No `!` non-null        | Handle null explicitly      | No null pointer exceptions    |
| Branded types for IDs  | `SignalId`, `ChainId`       | Domain safety                 |
| Explicit return types  | On all exports              | API contracts                 |

### Minimal Code Philosophy

| Principle                           | Implementation                             |
| ----------------------------------- | ------------------------------------------ |
| No over-engineering                 | Only build what's requested                |
| No premature abstraction            | Three similar lines > one premature helper |
| No speculative features             | YAGNI (You Aren't Gonna Need It)           |
| No code bloat                       | Delete unused code, don't comment it out   |
| No unnecessary comments             | Code should be self-documenting            |
| No feature flags for simple changes | Just change the code                       |

### Dependency Minimalism

| Rule                                  | Enforcement                              |
| ------------------------------------- | ---------------------------------------- |
| Justify every dependency              | Document why standard library won't work |
| Prefer @polkadot/\* official packages | No alternative crypto/chain libraries    |
| Pin all versions                      | Polkadot packages break between minors   |
| Zero critical/high vulnerabilities    | `pnpm audit` must pass                   |
| Bundle size matters                   | Consider alternatives if >50KB           |
| Check maintenance                     | No packages abandoned >6 months          |

### Testing Requirements

| Rule                            | Enforcement                                  | Status    |
| ------------------------------- | -------------------------------------------- | --------- |
| 80% line coverage minimum       | CI gate                                      | MANDATORY |
| 100% for security/crypto code   | Release blocker                              | MANDATORY |
| Co-located test files           | `Component.test.tsx` next to `Component.tsx` | MANDATORY |
| Mutation testing for core logic | Stryker with 80%+ kill rate                  | MANDATORY |
| Descriptive test names          | `it('should X when Y')`                      | MANDATORY |

### Security Invariants

| Rule                       | Status    |
| -------------------------- | --------- |
| No PII in logs             | MANDATORY |
| No third-party tracking    | MANDATORY |
| CSP headers enforced       | MANDATORY |
| HTTPS only                 | MANDATORY |
| No cookies                 | MANDATORY |
| No `eval()` or `innerHTML` | MANDATORY |
| Input validation with Zod  | MANDATORY |

### Design System Invariants

| Rule                               | Enforcement                          |
| ---------------------------------- | ------------------------------------ |
| 90/8/2 color rule                  | 90% black/white, 8% grays, 2% accent |
| Firefly gold for "Illuminate" only | `--color-accent` is reserved         |
| Polkadot pink for attribution only | `--color-polkadot-pink` is reserved  |
| No infinite scroll                 | Use pagination or "Load more"        |
| No engagement metrics              | No likes, no follower counts         |
| No user avatars                    | Fireflies are anonymous              |

---

## ✅ Verification Matrix

Before considering any task complete, verify:

### Code Quality

```bash
pnpm typecheck     # Must pass with zero errors
pnpm lint          # Must pass with zero warnings
pnpm test          # Must pass all tests
pnpm format:check  # Must be properly formatted
```

### Test Coverage (for new code)

- [ ] Tests co-located with implementation
- [ ] Happy path tested
- [ ] Error cases tested
- [ ] Edge cases tested (empty, null, boundary values)
- [ ] 80%+ line coverage (100% for security code)

### Security (for any user-facing changes)

- [ ] No PII logged (grep for: ip, email, credential, userAgent)
- [ ] No `dangerouslySetInnerHTML` without sanitization
- [ ] All user input validated
- [ ] No hardcoded secrets

### Accessibility (for any UI changes)

- [ ] Keyboard navigable
- [ ] Screen reader tested (check ARIA labels)
- [ ] Color contrast WCAG AA+
- [ ] Touch targets 44x44px minimum

### Domain Language

- [ ] "Signal" not "post"
- [ ] "Illuminate" not "share"
- [ ] "Corroborate" not "like"
- [ ] "Story Chain" not "thread"
- [ ] "Firefly" not "user"

---

## 🚀 Operational Strategy

### For Simple Tasks (single file, clear scope)

1. Read the relevant file
2. Make the change
3. Run verification matrix
4. Done

### For Complex Tasks (multiple files, architectural impact)

1. **Explore** — Use skills to understand the domain
2. **Plan** — Think through the approach before coding
3. **Implement** — Make minimal, focused changes
4. **Verify** — Run full verification matrix
5. **Review** — Ensure no over-engineering crept in

### When Uncertain

- Check CLAUDE.md for architecture guidance
- Load relevant skill from `.claude/skills/`
- Ask for clarification rather than guessing

---

## 📚 Quick Reference

### Import Patterns

```typescript
// ✅ Correct — cross-package imports
import { Signal, SignalId } from '@cocuyo/types';
import { Button } from '@cocuyo/ui';

// ❌ Wrong — relative paths across packages
import { Signal } from '../../../packages/types/src/signal';
```

### Component Structure

```
ComponentName/
├── ComponentName.tsx      # Implementation
├── ComponentName.test.tsx # Tests
├── ComponentName.types.ts # Types (if complex)
└── index.ts               # Re-export
```

### Git Commit Format

```
<type>: <description>

Types: feat, fix, docs, test, refactor, chore
Example: feat: Add corroboration weight display to SignalCard
```

---

## ❌ Anti-Patterns (FORBIDDEN)

### Code Quality

| Pattern                      | Why Forbidden       | Instead                      |
| ---------------------------- | ------------------- | ---------------------------- |
| `console.log` in production  | No debugging noise  | Use structured logger        |
| `any` type                   | Defeats type safety | Use `unknown` + guards       |
| `// TODO` without issue      | Forgotten tasks     | Create actual issue          |
| Commented-out code           | Code archaeology    | Delete it (git has history)  |
| `@ts-ignore`                 | Hidden type errors  | Fix the actual type          |
| Barrel exports in large dirs | Slow imports        | Import specific files        |
| Inline styles                | Inconsistent design | Use Tailwind + tokens        |
| Third-party CDN without SRI  | Supply chain risk   | Add integrity hash           |
| Mixed async patterns         | Confusing code      | Use async/await consistently |

### Web2 Backends (100% Polkadot)

| Pattern            | Why Forbidden                | Instead                 |
| ------------------ | ---------------------------- | ----------------------- |
| Firebase/Supabase  | Centralized, surveillance    | Bulletin Chain          |
| REST API backends  | Centralized point of failure | @polkadot/api           |
| AWS/GCP services   | Centralized, extractive      | Polkadot infrastructure |
| PostgreSQL/MongoDB | Centralized database         | On-chain storage        |
| Stripe/PayPal      | Centralized payments         | The Triangle            |
| Auth0/Okta         | Centralized identity         | DIM proof-of-personhood |
| ethers.js/web3.js  | Wrong ecosystem              | @polkadot/\* packages   |

### Dependencies

| Pattern               | Why Forbidden    | Instead                    |
| --------------------- | ---------------- | -------------------------- |
| Unpinned versions     | Breaking changes | Pin exact versions         |
| Unaudited crypto      | Security risk    | @polkadot/util-crypto only |
| >50KB for simple task | Bundle bloat     | Find lighter alternative   |
| Abandoned packages    | Security risk    | Actively maintained only   |

---

## 🔗 Cross-References

- **Architecture & Standards**: See `CLAUDE.md` in project root
- **Domain Knowledge**: See `.claude/skills/` directory
- **Core Concept**: See `docs/firefly-network-concept.md`
- **ADRs**: See `docs/ADR/` for architectural decisions
