---
name: dotns-integration
description: 'Integrate dotns name resolution and wallet permissions for the Firefly Network. Triggers: dotns, name, domain, wallet, permission, resolve, namehash'
---

# dotns Integration Skill

## When to Activate

- Implementing name resolution for fireflies
- Working with wallet permissions
- Integrating domain-based identity
- Building name registration flows
- Resolving human-readable names

---

## Global Invariants

| Rule                                 | Enforcement                | Status    |
| ------------------------------------ | -------------------------- | --------- |
| Names are optional identity layer    | DIM credential is primary  | MANDATORY |
| Wallet permissions require signature | EIP-712 or equivalent      | MANDATORY |
| Name validation follows dotns rules  | See validation matrix      | MANDATORY |
| Pure functions for name handling     | No side effects in parsing | MANDATORY |

---

## Domain Label Validation

### Length Requirements

| Length               | Status Required       | Example        |
| -------------------- | --------------------- | -------------- |
| ≤5 chars             | Reserved (governance) | `fire`         |
| 6-8 chars            | PoP Full required     | `firefly`      |
| 6-8 chars + 2 digits | PoP Lite allowed      | `firefly01`    |
| 9+ chars + 2 digits  | No verification       | `fireflynet99` |

### Character Rules

```typescript
function validateDomainLabel(label: string): boolean {
  // Lowercase letters, digits, hyphens only
  if (!/^[a-z0-9-]+$/.test(label)) return false;

  // Minimum 3 characters
  if (label.length < 3) return false;

  // Maximum 2 trailing digits
  const digits = label.match(/\d+$/);
  if (digits && digits[0].length > 2) return false;

  // Cannot start or end with hyphen
  if (label.startsWith('-') || label.endsWith('-')) return false;

  return true;
}
```

---

## Type System

```typescript
// packages/types/src/dotns.ts

/** Branded type for dotns names */
export type DotnsName = string & { readonly __brand: 'DotnsName' };

/** Namehash result (32 bytes) */
export type Namehash = string & { readonly __brand: 'Namehash' };

/** Domain registration state */
export interface DomainRegistration {
  readonly name: DotnsName;
  readonly owner: DIMCredential;
  readonly registeredAt: number;
  readonly expiresAt: number;
  readonly resolvedAddress?: string; // Optional on-chain address
}

/** Wallet permission state */
export interface WalletPermission {
  readonly grantedBy: DIMCredential;
  readonly grantedTo: string; // Address
  readonly scope: PermissionScope[];
  readonly expiresAt: number;
  readonly nonce: number; // Replay protection
}

type PermissionScope =
  | 'illuminate' // Can create signals
  | 'corroborate' // Can corroborate
  | 'bounty_claim' // Can claim bounties
  | 'reputation_delegate'; // Can delegate reputation weight
```

---

## Name Resolution Pattern

### Pure Functions for Parsing

```typescript
// Pure function - no side effects
function parseDotnsName(input: string): { label: string; tld: string } | null {
  const parts = input.toLowerCase().split('.');
  if (parts.length !== 2) return null;

  const [label, tld] = parts;
  if (tld !== 'dot') return null; // Only .dot TLD for now

  if (!validateDomainLabel(label)) return null;

  return { label, tld };
}

// Pure function - deterministic output
function normalizeName(name: string): DotnsName {
  return name.toLowerCase().trim() as DotnsName;
}

// Pure function - deterministic hash
function computeNamehash(name: DotnsName): Namehash {
  // ENS-compatible namehash algorithm
  const labels = name.split('.').reverse();
  let node = new Uint8Array(32);

  for (const label of labels) {
    const labelHash = keccak256(label);
    node = keccak256(concat([node, labelHash]));
  }

  return bytesToHex(node) as Namehash;
}
```

---

## Wallet Permission Pattern

### Permission Grant Flow

```typescript
// EIP-712 typed data for permission signing
const permissionTypes = {
  WalletPermission: [
    { name: 'grantedTo', type: 'address' },
    { name: 'scope', type: 'string[]' },
    { name: 'expiresAt', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
  ],
};

async function grantPermission(
  params: {
    grantedTo: string;
    scope: PermissionScope[];
    expiresAt: number;
  },
  signer: Signer
): Promise<SignedPermission> {
  const nonce = await getNextNonce(signer.address);

  const signature = await signer.signTypedData(domain, permissionTypes, { ...params, nonce });

  return {
    ...params,
    nonce,
    signature,
    grantedBy: signer.address as DIMCredential,
  };
}
```

### Permission Verification

```typescript
function verifyPermission(permission: SignedPermission, requiredScope: PermissionScope): boolean {
  // Check expiration
  if (Date.now() / 1000 > permission.expiresAt) {
    return false;
  }

  // Check scope
  if (!permission.scope.includes(requiredScope)) {
    return false;
  }

  // Verify signature
  const recovered = recoverTypedDataSigner(permission);
  if (recovered !== permission.grantedBy) {
    return false;
  }

  // Check nonce (prevent replay)
  if (!isValidNonce(permission.grantedBy, permission.nonce)) {
    return false;
  }

  return true;
}
```

---

## Contrastive Exemplars

### Name Resolution

✅ CORRECT:

```typescript
// Pure function approach
async function resolveFireflyName(name: string): Promise<DIMCredential | null> {
  const parsed = parseDotnsName(name);
  if (!parsed) return null;

  const normalized = normalizeName(name);
  const hash = computeNamehash(normalized);

  // Contract call with deterministic hash
  const registration = await dotnsContract.resolve(hash);
  return registration?.owner ?? null;
}
```

❌ FAIL:

```typescript
// Side effects in parsing
function resolveFireflyName(name: string) {
  // WRONG: logging in pure function
  console.log('Resolving:', name);

  // WRONG: network call in parsing
  const isValid = await checkNetworkStatus(name);

  // WRONG: mutating external state
  lastResolvedName = name;
}
```

### Wallet Permissions

✅ CORRECT:

```typescript
// Signature-based permission with nonce
async function delegateIlluminate(delegateTo: string): Promise<SignedPermission> {
  const permission = await grantPermission(
    {
      grantedTo: delegateTo,
      scope: ['illuminate'],
      expiresAt: Math.floor(Date.now() / 1000) + 86400, // 24 hours
    },
    signer
  );

  // Store permission for later verification
  await storePermission(permission);
  return permission;
}
```

❌ FAIL:

```typescript
// Permission without signature
function delegateIlluminate(delegateTo: string) {
  // WRONG: No cryptographic proof
  permissions[delegateTo] = ['illuminate'];

  // WRONG: No expiration
  // WRONG: No replay protection (nonce)
}
```

---

## Integration with Firefly Network

### Name as Optional Display

```tsx
// Names are optional - credential is primary identity
function FireflyDisplay({ credential, name }: { credential: DIMCredential; name?: DotnsName }) {
  // Show name if available, otherwise show truncated credential
  const displayName = name ?? truncateCredential(credential);

  return <span className="font-mono text-sm">{displayName}</span>;
}
```

### Permission-Gated Actions

```typescript
async function illuminateWithDelegation(
  signal: NewSignal,
  delegatedPermission?: SignedPermission
): Promise<SignalId> {
  const identity = await getFireflyIdentity();

  if (delegatedPermission) {
    // Using delegated permission
    if (!verifyPermission(delegatedPermission, 'illuminate')) {
      throw new Error('Invalid or expired delegation');
    }

    return submitSignal(signal, delegatedPermission.grantedBy);
  }

  // Using own credential
  return submitSignal(signal, identity.credential);
}
```

---

## Network Configuration

| Network            | Chain ID  | RPC                                              |
| ------------------ | --------- | ------------------------------------------------ |
| Paseo (testnet)    | 420420421 | `https://paseo-asset-hub-eth-rpc.polkadot.io`    |
| Polkadot (mainnet) | 420420420 | `https://polkadot-asset-hub-eth-rpc.polkadot.io` |

### Contract Addresses

```typescript
// Use configuration, not hardcoded
interface DotnsConfig {
  registryAddress: string;
  resolverAddress: string;
  rpcUrl: string;
  chainId: number;
}

function getDotnsConfig(network: 'paseo' | 'polkadot'): DotnsConfig {
  return DOTNS_CONFIGS[network];
}
```

---

## Quality Requirements

| Principle              | Implementation                     |
| ---------------------- | ---------------------------------- |
| Deterministic behavior | Pure functions for parsing/hashing |
| Explicit inputs        | No environment magic               |
| Small modules          | Separate parse, validate, resolve  |
| Invariant tests        | Test parsing/hashing exhaustively  |

---

## Anti-Patterns

| Pattern                            | Status    | Reason                    |
| ---------------------------------- | --------- | ------------------------- |
| Side effects in name parsing       | FORBIDDEN | Must be pure              |
| Permission without signature       | FORBIDDEN | No cryptographic proof    |
| Skip nonce in permission           | FORBIDDEN | Replay attacks            |
| Hardcode contract addresses        | FORBIDDEN | Use configuration         |
| Environment magic for network      | FORBIDDEN | Explicit parameters       |
| Name as primary identity           | FORBIDDEN | DIM credential is primary |
| Store permissions client-side only | FORBIDDEN | Verify on-chain/server    |
