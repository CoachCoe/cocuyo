---
name: personhood-lite
description: 'Implement DIM proof-of-personhood verification for firefly identity. Triggers: DIM, personhood, identity, verification, credential, proof, lite, full'
---

# Personhood Lite Skill — DIM Integration

## When to Activate

- Implementing firefly identity verification
- Working with DIM credentials
- Designing proof-of-personhood flows
- Implementing verification status checks
- Building keystore or credential management

---

## Global Invariants

| Rule                                   | Enforcement                              | Status    |
| -------------------------------------- | ---------------------------------------- | --------- |
| DIM is the ONLY identity source        | No email, no OAuth, no SSO               | MANDATORY |
| Never store credentials in plaintext   | Memory-only or encrypted keystore        | MANDATORY |
| Verification status affects reputation | Lite vs Full determines weight           | MANDATORY |
| Anonymous but human                    | Identity proves personhood, not identity | MANDATORY |

---

## Proof-of-Personhood Status

```typescript
enum ProofOfPersonhoodStatus {
  NoStatus = 0, // Unverified (restricted access)
  ProofOfPersonhoodLite = 1, // Lighter verification (partial access)
  ProofOfPersonhoodFull = 2, // Full verification (full access)
  Reserved = 3, // Governance-controlled
}
```

### Status Implications

| Status   | Network Access           | Reputation Weight | Use Case           |
| -------- | ------------------------ | ----------------- | ------------------ |
| NoStatus | View only                | None              | Anonymous browsing |
| Lite     | Illuminate + Corroborate | 0.5x multiplier   | Quick onboarding   |
| Full     | Full access + Bounties   | 1.0x multiplier   | Full participation |
| Reserved | Governance only          | N/A               | System accounts    |

---

## Credential Type System

```typescript
// packages/types/src/firefly.ts

/** Branded type for DIM credentials */
export type DIMCredential = string & { readonly __brand: 'DIMCredential' };

/** Firefly identity state */
export interface FireflyIdentity {
  readonly credential: DIMCredential;
  readonly status: ProofOfPersonhoodStatus;
  readonly verifiedAt: number; // Unix timestamp
  readonly expiresAt: number; // Credentials may have TTL
}

/** Verification result from DIM oracle */
export interface VerificationResult {
  readonly valid: boolean;
  readonly status: ProofOfPersonhoodStatus;
  readonly error?: string;
}
```

---

## Keystore Pattern

### Encrypted Storage

```typescript
// Based on dotns-sdk patterns
interface KeystoreV1 {
  version: 1;
  accountIndex: number;
  accounts: Record<string, EncryptedAccount>;
  defaultAccount?: string;
  createdAt: number;
  updatedAt: number;
}

interface EncryptedAccount {
  alias: string;
  encrypted: {
    ciphertext: string; // Base64
    nonce: string; // Base64
    salt: string; // Base64
  };
  address: string; // SS58 format
  status: ProofOfPersonhoodStatus;
}
```

### Encryption Requirements

| Component      | Algorithm       | Rationale                   |
| -------------- | --------------- | --------------------------- |
| Key derivation | scrypt          | Memory-hard, password-based |
| Encryption     | AES-256-GCM     | Authenticated encryption    |
| Nonce          | 12 bytes random | GCM standard                |
| Salt           | 16 bytes random | Per-account unique          |

---

## Contrastive Exemplars

### Credential Handling

✅ CORRECT:

```typescript
// Credential lives in memory only
function verifyAndUseCredential(password: string): DIMCredential {
  const keystore = loadKeystore(); // From encrypted file
  const decrypted = decryptWithScrypt(keystore.encrypted, password);
  // Use decrypted credential...
  // Clear from memory when done
  return decrypted.credential;
}
```

❌ FAIL:

```typescript
// Storing credential in plaintext
localStorage.setItem('dimCredential', credential); // FORBIDDEN

// Storing in session storage
sessionStorage.setItem('cred', JSON.stringify(cred)); // FORBIDDEN

// Logging credentials
console.log('Credential:', credential); // FORBIDDEN
```

### Verification Flow

✅ CORRECT:

```typescript
// Check status before privileged actions
async function illuminate(signal: NewSignal): Promise<SignalId> {
  const identity = await getFireflyIdentity();

  if (identity.status < ProofOfPersonhoodStatus.Lite) {
    throw new Error('Proof-of-personhood required to illuminate');
  }

  // Lite users can illuminate, Full users get higher weight
  const reputationMultiplier = identity.status === ProofOfPersonhoodStatus.Full ? 1.0 : 0.5;

  return submitSignal(signal, identity.credential, reputationMultiplier);
}
```

❌ FAIL:

```typescript
// Skipping verification status check
async function illuminate(signal: NewSignal): Promise<SignalId> {
  const credential = getCredential();
  // WRONG: No status check - unverified users can submit
  return submitSignal(signal, credential);
}
```

---

## Authentication Paths

Support multiple authentication methods (from dotns patterns):

| Method    | Source                    | Use Case            |
| --------- | ------------------------- | ------------------- |
| Keystore  | Encrypted file + password | Persistent identity |
| Mnemonic  | 12/24 word phrase         | Recovery            |
| Key URI   | SURI string               | Development/testing |
| Extension | Polkadot.js extension     | Browser wallet      |

### Keystore Loading

```typescript
type AuthSource =
  | { type: 'keystore'; path: string; password: string }
  | { type: 'mnemonic'; phrase: string }
  | { type: 'suri'; uri: string }
  | { type: 'extension'; accountIndex: number };

async function authenticate(source: AuthSource): Promise<FireflyIdentity> {
  switch (source.type) {
    case 'keystore':
      return loadFromKeystore(source.path, source.password);
    case 'mnemonic':
      return deriveFromMnemonic(source.phrase);
    case 'suri':
      return deriveFromSURI(source.uri);
    case 'extension':
      return connectExtension(source.accountIndex);
  }
}
```

---

## Validation Rules

### Address Validation

```typescript
// Validate Substrate addresses (SS58 or hex)
function isValidSubstrateAddress(address: string): boolean {
  // SS58 format check
  if (/^[1-9A-HJ-NP-Za-km-z]{47,48}$/.test(address)) {
    return true;
  }
  // Hex format check (0x + 64 chars)
  if (/^0x[a-fA-F0-9]{64}$/.test(address)) {
    return true;
  }
  return false;
}
```

### Credential Validation

```typescript
function validateCredential(credential: unknown): credential is DIMCredential {
  if (typeof credential !== 'string') return false;
  if (credential.length < 32) return false;
  if (!isValidSubstrateAddress(credential)) return false;
  return true;
}
```

---

## Oracle Integration

### Verification Request

```typescript
interface VerificationRequest {
  readonly credential: DIMCredential;
  readonly challengeNonce: string;
  readonly signature: string; // Proves ownership
  readonly requestedStatus: ProofOfPersonhoodStatus;
}

interface OracleResponse {
  readonly verified: boolean;
  readonly status: ProofOfPersonhoodStatus;
  readonly expiresAt: number;
  readonly oracleSignature: string; // For on-chain verification
}
```

### Flow

1. User requests verification with signed challenge
2. Oracle validates DIM proof
3. Oracle returns signed attestation
4. Attestation stored on-chain or in app

---

## UI Patterns

### Status Display

```tsx
// Never expose full credential
function FireflyStatus({ identity }: { identity: FireflyIdentity }) {
  const statusLabel = {
    [ProofOfPersonhoodStatus.NoStatus]: 'Unverified',
    [ProofOfPersonhoodStatus.Lite]: 'Verified (Lite)',
    [ProofOfPersonhoodStatus.Full]: 'Verified (Full)',
  }[identity.status];

  return (
    <div className="text-secondary text-sm">
      <span className="text-corroborated">{statusLabel}</span>
      {/* NEVER show credential in UI */}
    </div>
  );
}
```

### Verification CTA

```tsx
function VerificationPrompt({ currentStatus }: { currentStatus: ProofOfPersonhoodStatus }) {
  if (currentStatus === ProofOfPersonhoodStatus.Full) return null;

  return (
    <div className="border-accent/30 rounded border p-4">
      {currentStatus === ProofOfPersonhoodStatus.NoStatus && (
        <p>Verify your humanity to participate in the network.</p>
      )}
      {currentStatus === ProofOfPersonhoodStatus.Lite && (
        <p>Upgrade to full verification for increased reputation weight.</p>
      )}
      <Button>Begin Verification</Button>
    </div>
  );
}
```

---

## Security Checklist

- [ ] Credentials never in localStorage/sessionStorage
- [ ] Credentials never logged
- [ ] Password validated with strong KDF (scrypt)
- [ ] Nonces are unique per operation
- [ ] Challenge-response for oracle verification
- [ ] Signatures validate credential ownership
- [ ] Expiration checked before use
- [ ] Status downgrade handled gracefully

---

## Anti-Patterns

| Pattern                              | Status    | Reason                 |
| ------------------------------------ | --------- | ---------------------- |
| Store credential in browser storage  | FORBIDDEN | XSS accessible         |
| Log credentials                      | FORBIDDEN | Security breach        |
| Use weak KDF (PBKDF2 low iterations) | FORBIDDEN | Brute-force vulnerable |
| Skip status check before actions     | FORBIDDEN | Privilege escalation   |
| Display full credential in UI        | FORBIDDEN | Information leak       |
| Hardcode oracle URLs                 | FORBIDDEN | Use configuration      |
| Trust client-side status             | FORBIDDEN | Verify on server       |
