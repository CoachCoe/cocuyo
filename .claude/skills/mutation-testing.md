---
name: mutation-testing
description: 'Implement mutation testing with Stryker for test quality validation. Triggers: mutation, stryker, test quality, coverage, killed, survived'
---

# Mutation Testing Skill — Stryker

## When to Activate

- Setting up test infrastructure
- Evaluating test quality
- Finding gaps in test coverage
- Improving test assertions
- Validating security-critical test coverage

---

## Global Invariants

| Rule                              | Enforcement               | Status    |
| --------------------------------- | ------------------------- | --------- |
| 80%+ mutation score               | CI gate for critical code | MANDATORY |
| 100% for security code            | Cryptographic, auth paths | MANDATORY |
| No survived mutants in core logic | Fix or document           | MANDATORY |
| Run before release                | Part of release checklist | MANDATORY |

---

## What is Mutation Testing?

Traditional coverage measures which lines execute. Mutation testing measures whether tests would **detect bugs**.

### How It Works

1. **Mutate**: Stryker creates small changes (mutants) in your code
2. **Test**: Run tests against each mutant
3. **Analyze**: Count how many mutants were "killed" (detected by tests)

### Mutation Examples

| Original      | Mutant         | Test Should               |
| ------------- | -------------- | ------------------------- |
| `if (a > b)`  | `if (a >= b)`  | Fail for edge case        |
| `return true` | `return false` | Fail for return value     |
| `a + b`       | `a - b`        | Fail for arithmetic       |
| `arr.length`  | `0`            | Fail for array operations |

---

## Setup

### Installation

```bash
# For TypeScript/JavaScript projects
pnpm add -D @stryker-mutator/core @stryker-mutator/typescript-checker @stryker-mutator/vitest-runner
```

### Configuration

```javascript
// stryker.config.mjs
export default {
  packageManager: 'pnpm',
  reporters: ['html', 'progress', 'dashboard'],
  testRunner: 'vitest',
  checkers: ['typescript'],
  tsconfigFile: 'tsconfig.json',
  mutate: ['src/**/*.ts', '!src/**/*.test.ts', '!src/**/*.d.ts'],
  timeoutMS: 10000,
  concurrency: 4,
  // Thresholds
  thresholds: {
    high: 80,
    low: 60,
    break: 50, // Fail build below this
  },
};
```

### Package.json Scripts

```json
{
  "scripts": {
    "test:mutation": "stryker run",
    "test:mutation:incremental": "stryker run --incremental"
  }
}
```

---

## Mutation Score Targets

| Code Type              | Minimum Score | Target Score |
| ---------------------- | ------------- | ------------ |
| General application    | 60%           | 80%          |
| Business logic         | 80%           | 90%          |
| Security-critical      | 100%          | 100%         |
| Cryptographic          | 100%          | 100%         |
| Financial calculations | 100%          | 100%         |

---

## Contrastive Exemplars

### Weak Tests (Mutants Survive)

❌ Before: Low mutation score

```typescript
// Test only checks that function doesn't throw
it('calculates reputation weight', () => {
  const result = calculateWeight([{ weight: 10 }, { weight: 20 }]);
  expect(result).toBeDefined(); // WEAK: Mutant survives
});
```

✅ After: High mutation score

```typescript
// Test verifies specific output
it('calculates reputation weight as sum', () => {
  const result = calculateWeight([{ weight: 10 }, { weight: 20 }]);
  expect(result).toBe(30); // STRONG: Kills arithmetic mutants
});

it('returns 0 for empty array', () => {
  expect(calculateWeight([])).toBe(0); // STRONG: Kills length mutants
});

it('handles negative weights', () => {
  const result = calculateWeight([{ weight: -5 }, { weight: 15 }]);
  expect(result).toBe(10); // STRONG: Kills sign mutants
});
```

### Boundary Conditions

❌ Before: Missing boundary test

```typescript
it('validates signal length', () => {
  expect(() => validateSignal({ text: 'short' })).toThrow();
});
```

✅ After: Boundary coverage

```typescript
it('rejects signals under 10 characters', () => {
  expect(() => validateSignal({ text: '9 chars!' })).toThrow();
});

it('accepts signals with exactly 10 characters', () => {
  expect(() => validateSignal({ text: '10 chars!!' })).not.toThrow();
});

it('accepts signals with 11+ characters', () => {
  expect(() => validateSignal({ text: '11 chars!!!' })).not.toThrow();
});
```

### Boolean Logic

❌ Before: Incomplete boolean coverage

```typescript
it('checks verification status', () => {
  const lite = { status: ProofOfPersonhoodStatus.Lite };
  expect(canIlluminate(lite)).toBe(true);
});
```

✅ After: All branches covered

```typescript
it('allows Lite status to illuminate', () => {
  expect(canIlluminate({ status: ProofOfPersonhoodStatus.Lite })).toBe(true);
});

it('allows Full status to illuminate', () => {
  expect(canIlluminate({ status: ProofOfPersonhoodStatus.Full })).toBe(true);
});

it('denies NoStatus to illuminate', () => {
  expect(canIlluminate({ status: ProofOfPersonhoodStatus.NoStatus })).toBe(false);
});
```

---

## Common Mutant Types

### Arithmetic Mutants

| Original | Mutants                   |
| -------- | ------------------------- |
| `a + b`  | `a - b`, `a * b`, `a / b` |
| `a++`    | `a--`                     |
| `a * 2`  | `a / 2`                   |

**Kill by**: Testing specific numeric outputs

### Conditional Mutants

| Original  | Mutants                     |
| --------- | --------------------------- | --- | ------------------- |
| `a > b`   | `a >= b`, `a < b`, `a <= b` |
| `a === b` | `a !== b`                   |
| `a && b`  | `a                          |     | b`, `true`, `false` |

**Kill by**: Testing boundary values and boolean combinations

### Return Value Mutants

| Original      | Mutants                   |
| ------------- | ------------------------- |
| `return true` | `return false`            |
| `return x`    | `return 0`, `return null` |
| `return arr`  | `return []`               |

**Kill by**: Asserting specific return values

### String Mutants

| Original     | Mutants |
| ------------ | ------- |
| `"hello"`    | `""`    |
| `str.length` | `0`     |
| `str.trim()` | `str`   |

**Kill by**: Testing string content and length

---

## Analyzing Survivors

### Reading Stryker Report

```
Mutant survived in src/lib/reputation.ts:42
Original: weight > 0
Mutant:   weight >= 0
```

### Fix Strategy

1. **Understand the mutant**: What bug would this represent?
2. **Write failing test**: Create test that would catch this bug
3. **Verify kill**: Re-run mutation testing

### Example Fix

```typescript
// Survivor: weight > 0 → weight >= 0

// Add test for zero weight
it('excludes corroborations with zero weight', () => {
  const corroborations = [
    { weight: 0 }, // Should be excluded
    { weight: 10 },
  ];
  expect(calculateTotalWeight(corroborations)).toBe(10);
});
```

---

## CI Integration

### GitHub Actions

```yaml
# .github/workflows/mutation.yml
name: Mutation Testing

on:
  pull_request:
    branches: [main]

jobs:
  mutation:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm test:mutation
        env:
          STRYKER_DASHBOARD_API_KEY: ${{ secrets.STRYKER_DASHBOARD_API_KEY }}

      - name: Check Mutation Score
        run: |
          SCORE=$(cat reports/mutation/mutation.json | jq '.score')
          if (( $(echo "$SCORE < 80" | bc -l) )); then
            echo "Mutation score $SCORE is below 80%"
            exit 1
          fi
```

### Incremental Testing

For faster CI, use incremental mode:

```bash
# Only test changed files
pnpm test:mutation:incremental
```

---

## Security-Critical Code

### Mandatory 100% Score

Files that MUST have 100% mutation score:

- `**/auth/**/*.ts`
- `**/crypto/**/*.ts`
- `**/validation/**/*.ts`
- `**/security/**/*.ts`

### Stryker Config for Security

```javascript
// Focus mutation testing on security code
export default {
  // ...
  mutate: ['src/**/auth/**/*.ts', 'src/**/crypto/**/*.ts', 'src/**/validation/**/*.ts'],
  thresholds: {
    high: 100,
    low: 100,
    break: 100, // Zero tolerance
  },
};
```

---

## Best Practices

### Test Design for Killability

1. **Assert specific values**, not just truthiness
2. **Test boundaries**, not just valid ranges
3. **Test negative cases**, not just happy paths
4. **Test all boolean combinations**
5. **Test empty/null/zero edge cases**

### When Survivors Are Acceptable

| Scenario                   | Action                |
| -------------------------- | --------------------- |
| Dead code (never executed) | Delete the code       |
| Logging statements         | Exclude from mutation |
| Equivalent mutants         | Document why          |
| Test timeout issues        | Increase timeout      |

### Excluding Code

```typescript
// Stryker disable next-line: logging not tested
logger.debug('Processing signal', { id: signal.id });
```

---

## Anti-Patterns

| Pattern                        | Status    | Reason                          |
| ------------------------------ | --------- | ------------------------------- |
| Test without assertions        | FORBIDDEN | 0% mutation kill rate           |
| `expect(x).toBeDefined()` only | FORBIDDEN | Misses value mutants            |
| Skip mutation testing          | FORBIDDEN | False confidence in coverage    |
| Accept <60% in business logic  | FORBIDDEN | Untested code paths             |
| Accept <100% in security code  | FORBIDDEN | Security critical               |
| Disable for "complex" code     | FORBIDDEN | Complex code needs most testing |
