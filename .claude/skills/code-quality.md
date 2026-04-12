---
name: code-quality
description: 'Enforce minimal code philosophy and exceptional code quality. Triggers: quality, refactor, clean, minimal, bloat, simplify, YAGNI, over-engineering'
---

# Code Quality Skill — Minimal Code Philosophy

## When to Activate

- Writing new code
- Reviewing code changes
- Refactoring existing code
- Evaluating architecture decisions
- Responding to "improve" or "optimize" requests

---

## Global Invariants

| Rule                                | Enforcement                    | Status    |
| ----------------------------------- | ------------------------------ | --------- |
| Build only what's requested         | No speculative features        | MANDATORY |
| Delete unused code                  | Don't comment out              | MANDATORY |
| Three lines > premature abstraction | Keep it simple                 | MANDATORY |
| No backwards-compatibility hacks    | Just change the code           | MANDATORY |
| Self-documenting code               | Comments explain WHY, not WHAT | MANDATORY |

---

## Core Principles

### 1. YAGNI — You Aren't Gonna Need It

Only build what's explicitly requested or clearly necessary.

| ✅ DO                           | ❌ DON'T                        |
| ------------------------------- | ------------------------------- |
| Implement the requested feature | Add "configurable" options      |
| Solve the specific problem      | Design for hypothetical futures |
| Write minimal working code      | Build "extensible" frameworks   |

### 2. The Right Amount of Complexity

The minimum complexity needed for the current task.

| ✅ DO                       | ❌ DON'T                      |
| --------------------------- | ----------------------------- |
| Three similar lines of code | Premature helper function     |
| Direct implementation       | Factory pattern for one class |
| Inline logic where clear    | Utility function used once    |

### 3. Delete, Don't Comment

If code is unused, remove it. Git has history.

| ✅ DO                   | ❌ DON'T                          |
| ----------------------- | --------------------------------- |
| `git rm unused-file.ts` | `// TODO: remove later`           |
| Remove unused imports   | `_unusedVariable` renaming        |
| Delete dead branches    | `// OLD: previous implementation` |

---

## Contrastive Exemplars

### Feature Scope

✅ CORRECT:

```typescript
// User asked: "Add a loading state to the button"
function Button({ loading, children }: { loading?: boolean; children: React.ReactNode }) {
  return (
    <button disabled={loading}>
      {loading ? 'Loading...' : children}
    </button>
  );
}
```

❌ FAIL:

```typescript
// User asked: "Add a loading state to the button"
// OVER-ENGINEERED: Added size, variant, icon, animation options
function Button({
  loading,
  size = 'medium',
  variant = 'primary',
  icon,
  iconPosition = 'left',
  animationType = 'spin',
  loadingText,
  children,
}: ButtonProps) {
  // 50 lines of configuration nobody asked for
}
```

### Abstraction Timing

✅ CORRECT:

```typescript
// First occurrence - just write it
const formattedDate1 = new Date(signal1.createdAt).toLocaleDateString();

// Second occurrence - still fine to duplicate
const formattedDate2 = new Date(signal2.createdAt).toLocaleDateString();

// Third occurrence - NOW consider extraction if pattern is stable
function formatSignalDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString();
}
```

❌ FAIL:

```typescript
// First occurrence - premature abstraction
const DateFormatter = {
  format: (timestamp: number, options?: DateFormatOptions) => {
    // 30 lines of configurability for a single use case
  },
};
```

### Error Handling

✅ CORRECT:

```typescript
// Handle errors at system boundaries
async function fetchSignal(id: SignalId): Promise<Signal | null> {
  try {
    return await signalService.get(id);
  } catch (error) {
    logger.error('Failed to fetch signal', { signalId: id, error });
    return null;
  }
}
```

❌ FAIL:

```typescript
// Over-defensive internal code
function processSignal(signal: Signal) {
  // WRONG: These checks are unnecessary for internal code
  if (!signal) throw new Error('Signal required');
  if (typeof signal.id !== 'string') throw new Error('Invalid signal id');
  if (!signal.content) throw new Error('Signal content required');
  // The type system already guarantees these
}
```

### Comments

✅ CORRECT:

```typescript
// Explain WHY, not WHAT
// Using 2-second debounce because the DIM oracle has rate limiting
const debouncedVerify = debounce(verifyCredential, 2000);
```

❌ FAIL:

```typescript
// WRONG: Explains what the code obviously does
// Increment counter by 1
counter++;

// WRONG: Redundant with function name
// This function fetches a signal by ID
function fetchSignalById(id: SignalId) { ... }
```

---

## Code Organization

### File Size Limits

| File Type        | Target Lines | Max Lines |
| ---------------- | ------------ | --------- |
| Component        | 50-150       | 300       |
| Utility          | 20-50        | 100       |
| Service          | 100-200      | 400       |
| Type definitions | 20-100       | 200       |

### When to Split

Split when:

- File exceeds max lines
- Multiple unrelated concerns
- Natural module boundary exists

Don't split:

- Just to reduce line count
- When it increases complexity
- For single-use helpers

---

## TypeScript Quality

### Type Precision

✅ CORRECT:

```typescript
// Precise types
function getSignal(id: SignalId): Promise<Signal | null> { ... }

// Branded types for domain safety
type SignalId = string & { readonly __brand: 'SignalId' };
```

❌ FAIL:

```typescript
// WRONG: Too loose
function getSignal(id: any): any { ... }

// WRONG: Hiding problems
function getSignal(id: string): Signal { ... }  // What if not found?
```

### Explicit Over Implicit

✅ CORRECT:

```typescript
// Explicit return types on exports
export function calculateReputationWeight(corroborations: Corroboration[]): number {
  return corroborations.reduce((sum, c) => sum + c.weight, 0);
}
```

❌ FAIL:

```typescript
// WRONG: Implicit return type
export function calculateReputationWeight(corroborations: Corroboration[]) {
  return corroborations.reduce((sum, c) => sum + c.weight, 0);
}
```

---

## React Quality

### Component Simplicity

✅ CORRECT:

```tsx
// Single responsibility, minimal props
function SignalCard({ signal }: { signal: Signal }) {
  return (
    <article className="bg-tertiary border-default rounded-lg border p-6">
      <SignalMeta signal={signal} />
      <SignalContent content={signal.content} />
      <CorroborationSummary counts={signal.corroborations} />
    </article>
  );
}
```

❌ FAIL:

```tsx
// WRONG: Kitchen sink component
function SignalCard({
  signal,
  showMeta = true,
  showContent = true,
  showCorroborations = true,
  onCorroborate,
  onChallenge,
  onReport,
  compact = false,
  highlighted = false,
  showTrail = false,
  ...rest
}: SignalCardProps) {
  // 200 lines of conditional rendering
}
```

### Hook Simplicity

✅ CORRECT:

```typescript
// Simple, single-purpose hook
function useSignal(id: SignalId) {
  return useQuery(['signal', id], () => signalService.get(id));
}
```

❌ FAIL:

```typescript
// WRONG: Over-abstracted
function useSignal(id: SignalId, options?: UseSignalOptions) {
  const { enabled, refetchInterval, onSuccess, onError, transform } = options ?? {};
  // 50 lines re-implementing react-query features
}
```

---

## Refactoring Guidelines

### When to Refactor

| Refactor When                | Don't Refactor When       |
| ---------------------------- | ------------------------- |
| Bug fix requires it          | Just to "clean up"        |
| Feature blocked by structure | Surrounding code works    |
| Repeated pattern (3+ times)  | Pattern occurs twice      |
| Explicit user request        | Anticipating future needs |

### Refactoring Scope

| ✅ DO                  | ❌ DON'T                      |
| ---------------------- | ----------------------------- |
| Fix the specific issue | "While I'm here" improvements |
| Minimal changes needed | Rewrite entire file           |
| Keep PR focused        | Mix refactoring with features |

---

## Performance Pragmatism

### Optimize When

| Optimize            | Don't Optimize        |
| ------------------- | --------------------- |
| Measured bottleneck | Hypothetical slowness |
| User-facing latency | Internal tooling      |
| Data shows problem  | Premature concern     |

### Premature Optimization Examples

❌ DON'T:

```typescript
// Premature memoization
const memoizedFormat = useMemo(() => formatDate(date), [date]);

// Premature caching
const signalCache = new Map(); // Before knowing if needed
```

✅ DO:

```typescript
// Just call the function
const formatted = formatDate(date);

// Add caching when measurement shows it's needed
```

---

## Deletion Checklist

Before considering code complete, verify:

- [ ] No `// TODO` without linked issue
- [ ] No commented-out code
- [ ] No unused imports
- [ ] No unused variables (`_prefix` hack)
- [ ] No dead code paths
- [ ] No `// OLD:` or `// REMOVED:` markers
- [ ] No backwards-compatibility shims for removed features

---

## Anti-Patterns

| Pattern                         | Status    | Instead                          |
| ------------------------------- | --------- | -------------------------------- |
| Speculative features            | FORBIDDEN | Build what's requested           |
| Commented-out code              | FORBIDDEN | Delete it (git has history)      |
| `_unusedVar` naming             | FORBIDDEN | Remove the variable              |
| Premature abstraction           | FORBIDDEN | Duplicate until pattern is clear |
| Feature flags for dead code     | FORBIDDEN | Delete dead code                 |
| "Extensible" one-time code      | FORBIDDEN | Write simple code                |
| `// TODO: refactor later`       | FORBIDDEN | Either do it or create issue     |
| Docs for obvious code           | FORBIDDEN | Self-documenting code            |
| Wrapper functions with no logic | FORBIDDEN | Call directly                    |
| Configuration for single value  | FORBIDDEN | Hardcode it                      |
