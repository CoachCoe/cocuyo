---
name: monorepo
description: 'Implement pnpm workspace and Turborepo patterns. Triggers: monorepo, workspace, turborepo, package, pnpm, filter, dependency'
---

# Monorepo Skill — pnpm + Turborepo

## When to Activate

- Adding new packages
- Managing dependencies across packages
- Configuring build pipelines
- Troubleshooting workspace issues
- Setting up shared code

---

## Global Invariants

| Rule                     | Enforcement                    | Status    |
| ------------------------ | ------------------------------ | --------- |
| pnpm workspaces only     | No npm/yarn                    | MANDATORY |
| Turborepo for builds     | Cacheable, parallel            | MANDATORY |
| Shared code in packages/ | Not duplicated                 | MANDATORY |
| App code in apps/        | Not imported by packages       | MANDATORY |
| @cocuyo/\* imports       | Never relative across packages | MANDATORY |

---

## Directory Structure

```
cocuyo/
├── pnpm-workspace.yaml      # Workspace definition
├── turbo.json               # Turborepo pipeline
├── package.json             # Root scripts, devDependencies
├── tsconfig.base.json       # Shared TS config
├── packages/                # Shared packages (imported by apps)
│   ├── types/               # @cocuyo/types
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   └── ui/                  # @cocuyo/ui
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
└── apps/                    # Applications (not imported)
    └── web/                 # @cocuyo/web
        ├── package.json
        ├── tsconfig.json
        └── src/
```

---

## Workspace Configuration

### pnpm-workspace.yaml

```yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

### Package Naming

| Package | Name            | Location         |
| ------- | --------------- | ---------------- |
| Types   | `@cocuyo/types` | `packages/types` |
| UI      | `@cocuyo/ui`    | `packages/ui`    |
| Web     | `@cocuyo/web`   | `apps/web`       |

---

## Turborepo Pipeline

### turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "lint": {},
    "test": {
      "dependsOn": ["^build"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### Build Order (Automatic)

```
@cocuyo/types  →  @cocuyo/ui  →  @cocuyo/web
     ↑               ↑              ↑
   (builds)      (depends on     (depends on
                  types)          types + ui)
```

---

## Package Commands

### Root Commands (All Packages)

```bash
pnpm build         # Build all packages in order
pnpm dev           # Run all dev servers
pnpm typecheck     # Type check all packages
pnpm lint          # Lint all packages
pnpm test          # Test all packages
```

### Filtered Commands (Single Package)

```bash
# By package name
pnpm --filter @cocuyo/web dev
pnpm --filter @cocuyo/ui build
pnpm --filter @cocuyo/types build

# By directory
pnpm --filter ./apps/web dev
pnpm --filter ./packages/* build
```

---

## Contrastive Exemplars

### Cross-Package Imports

✅ CORRECT:

```typescript
// apps/web/src/components/SignalCard.tsx
import { Signal, SignalId } from '@cocuyo/types';
import { Button, Card } from '@cocuyo/ui';
```

❌ FAIL:

```typescript
// WRONG: Relative paths across packages
import { Signal } from '../../../packages/types/src/signal';
import { Button } from '../../packages/ui/src/components/Button';

// WRONG: Importing app code into package
// packages/ui/src/components/Header.tsx
import { useWallet } from '@cocuyo/web/hooks'; // FORBIDDEN
```

### Adding Dependencies

✅ CORRECT:

```bash
# Add to specific package
pnpm --filter @cocuyo/web add react-query

# Add to root (dev tools)
pnpm add -D -w typescript prettier

# Add workspace dependency
pnpm --filter @cocuyo/ui add @cocuyo/types --workspace
```

❌ FAIL:

```bash
# WRONG: Adding to wrong scope
cd apps/web && pnpm add react-query  # Use --filter instead

# WRONG: Adding runtime dep to root
pnpm add react  # Should be in specific package
```

### Package.json Setup

✅ CORRECT:

```json
// packages/types/package.json
{
  "name": "@cocuyo/types",
  "version": "0.0.0",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "typecheck": "tsc --noEmit"
  }
}
```

❌ FAIL:

```json
// WRONG: Missing types field
{
  "name": "@cocuyo/types",
  "main": "./dist/index.js"
  // Missing "types" - other packages can't find types
}

// WRONG: Non-private workspace package
{
  "name": "@cocuyo/types",
  "version": "1.0.0"  // Should be private during development
}
```

---

## Adding a New Package

### 1. Create Directory Structure

```bash
mkdir -p packages/new-package/src
```

### 2. Create package.json

```json
{
  "name": "@cocuyo/new-package",
  "version": "0.0.0",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src --ext .ts,.tsx",
    "test": "vitest"
  },
  "devDependencies": {
    "typescript": "workspace:*"
  }
}
```

### 3. Create tsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

### 4. Create src/index.ts

```typescript
// Export public API
export * from './types';
export * from './utils';
```

### 5. Install Dependencies

```bash
pnpm install
```

---

## Dependency Management

### Workspace Protocol

```json
// Use workspace:* for internal dependencies
{
  "dependencies": {
    "@cocuyo/types": "workspace:*"
  }
}
```

### Shared Dev Dependencies

Put in root package.json:

- TypeScript
- ESLint
- Prettier
- Testing tools

### Package-Specific Dependencies

Put in package's package.json:

- Runtime dependencies
- Package-specific dev tools

---

## Troubleshooting

### "Module not found"

1. Check package is built: `pnpm --filter @cocuyo/types build`
2. Check main/types fields in package.json
3. Check tsconfig paths

### "Version mismatch"

1. Use `workspace:*` for internal deps
2. Run `pnpm install` to sync lockfile

### "Circular dependency"

1. Never import apps into packages
2. Extract shared code to new package
3. Check build order in turbo.json

---

## Anti-Patterns

| Pattern                        | Status    | Reason                 |
| ------------------------------ | --------- | ---------------------- |
| Relative cross-package imports | FORBIDDEN | Breaks build           |
| cd into package + pnpm add     | FORBIDDEN | Use --filter           |
| Import app code into package   | FORBIDDEN | Circular dependency    |
| Skip build before typecheck    | FORBIDDEN | Types not generated    |
| Duplicate dependencies         | FORBIDDEN | Use workspace protocol |
| Non-private workspace packages | FORBIDDEN | Not publishing         |
