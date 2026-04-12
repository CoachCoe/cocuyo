---
name: bulletin-chain
description: 'Implement Bulletin Chain integration for decentralized signal storage. Triggers: bulletin, storage, IPFS, chain, content, hash, CID'
---

# Bulletin Chain Skill

## When to Activate

- Implementing signal content storage
- Working with verification trails
- Integrating IPFS/content addressing
- Building data persistence layer
- Designing on-chain vs off-chain split

---

## Global Invariants

| Rule                      | Enforcement                  | Status    |
| ------------------------- | ---------------------------- | --------- |
| Content-addressed storage | Hash-based references        | MANDATORY |
| On-chain = minimal        | Hashes + metadata only       | MANDATORY |
| Off-chain = full content  | Bulletin chain storage       | MANDATORY |
| 2-week retention minimum  | Configure node appropriately | MANDATORY |
| IPFS via litep2p          | Network backend requirement  | MANDATORY |

---

## Storage Split Pattern

### On-Chain (Polkadot Asset Hub)

```solidity
// Minimal record with hash references
struct OnChainSignal {
    bytes32 id;             // Hash of content + DIM signature
    bytes32 contentHash;    // Points to Bulletin chain
    address dimCredential;  // Firefly identity
    bytes32[] chainLinks;   // Story chain references
    uint256 timestamp;      // Unix timestamp
}
```

### Off-Chain (Bulletin Chain)

```typescript
// Full content stored on Bulletin chain
interface BulletinSignalContent {
  readonly text: string;
  readonly media: ContentHash[]; // IPFS CIDs
  readonly links: string[];
  readonly context: SignalContext;
  readonly signature: string; // DIM signature
}

interface ContentHash {
  readonly cid: string; // IPFS CID
  readonly mimeType: string;
  readonly size: number;
}
```

---

## Content Addressing

### Hash Generation

```typescript
import { keccak256, toBytes } from 'viem';

// Deterministic content hash
function computeContentHash(content: BulletinSignalContent): string {
  const normalized = JSON.stringify(content, Object.keys(content).sort());
  return keccak256(toBytes(normalized));
}

// Signal ID = hash of content + signature
function computeSignalId(content: BulletinSignalContent): SignalId {
  const contentHash = computeContentHash(content);
  const combined = `${contentHash}:${content.signature}`;
  return keccak256(toBytes(combined)) as SignalId;
}
```

### CID Generation (IPFS)

```typescript
import { CID } from 'multiformats/cid';
import { sha256 } from 'multiformats/hashes/sha2';
import * as dagCBOR from '@ipld/dag-cbor';

async function generateCID(content: unknown): Promise<string> {
  const bytes = dagCBOR.encode(content);
  const hash = await sha256.digest(bytes);
  const cid = CID.create(1, dagCBOR.code, hash);
  return cid.toString();
}
```

---

## Node Configuration

### Bulletin Chain Node Requirements

```bash
# Required flags for IPFS support
--ipfs-server
--network-backend=litep2p

# Storage estimate: ~1.6-2TB for 2-week retention at full capacity
# Block time: 6 seconds
```

### Network Configuration

| Network | Chain             | Storage Endpoint                   |
| ------- | ----------------- | ---------------------------------- |
| Testnet | Paseo Bulletin    | `wss://paseo-bulletin.polkadot.io` |
| Mainnet | Polkadot Bulletin | `wss://bulletin.polkadot.io`       |

---

## Storage Flow

### Store Signal Content

```typescript
async function storeSignalContent(
  content: BulletinSignalContent
): Promise<{ contentHash: string; cid: string }> {
  // 1. Generate deterministic hashes
  const contentHash = computeContentHash(content);

  // 2. Store on Bulletin chain (IPFS-backed)
  const cid = await bulletinClient.store(content);

  // 3. Return both references
  return { contentHash, cid };
}
```

### Retrieve Signal Content

```typescript
async function retrieveSignalContent(contentHash: string): Promise<BulletinSignalContent | null> {
  // 1. Query on-chain for CID reference
  const onChainRecord = await signalContract.getSignal(contentHash);
  if (!onChainRecord) return null;

  // 2. Fetch from Bulletin chain via IPFS
  const content = await bulletinClient.fetch(onChainRecord.cid);

  // 3. Verify content hash matches
  const computedHash = computeContentHash(content);
  if (computedHash !== contentHash) {
    throw new Error('Content hash mismatch - data integrity failure');
  }

  return content;
}
```

---

## Verification Trail Storage

### Trail Structure

```typescript
interface VerificationTrail {
  readonly signalId: SignalId;
  readonly entries: VerificationEntry[];
}

interface VerificationEntry {
  readonly type: 'illuminate' | 'corroborate' | 'challenge';
  readonly actor: DIMCredential;
  readonly timestamp: number;
  readonly proof: string; // Cryptographic proof
  readonly contentHash: string; // Points to details on Bulletin chain
}
```

### Storage Pattern

```typescript
// On-chain: trail root hash only
struct OnChainTrail {
    bytes32 signalId;
    bytes32 trailRootHash;  // Merkle root of all entries
    uint256 entryCount;
    uint256 lastUpdated;
}

// Off-chain: full trail entries
// Stored as append-only log on Bulletin chain
```

---

## Contrastive Exemplars

### Content Storage

✅ CORRECT:

```typescript
// Hash-first, then store
async function illuminate(signal: NewSignal): Promise<SignalId> {
  // 1. Compute content hash BEFORE storage
  const contentHash = computeContentHash(signal);
  const signalId = computeSignalId(signal);

  // 2. Store full content on Bulletin chain
  const cid = await bulletinClient.store(signal);

  // 3. Store minimal record on-chain
  await signalContract.register(signalId, contentHash, cid);

  return signalId;
}
```

❌ FAIL:

```typescript
// Storing everything on-chain
async function illuminate(signal: NewSignal) {
  // WRONG: Full content on-chain (expensive, no privacy)
  await signalContract.register(signal.text, signal.media, signal.context);
}

// No hash verification
async function getSignal(id: SignalId) {
  const content = await bulletinClient.fetch(id);
  // WRONG: No hash verification
  return content; // Could be tampered
}
```

### Data Integrity

✅ CORRECT:

```typescript
// Always verify content hash
async function verifySignal(signalId: SignalId): Promise<boolean> {
  const onChainRecord = await signalContract.getSignal(signalId);
  const bulletinContent = await bulletinClient.fetch(onChainRecord.cid);

  const computedHash = computeContentHash(bulletinContent);
  return computedHash === onChainRecord.contentHash;
}
```

❌ FAIL:

```typescript
// Trusting off-chain content without verification
async function getSignal(id: SignalId) {
  return await bulletinClient.fetch(id); // WRONG: No verification
}
```

---

## Media Storage

### Image/Document Handling

```typescript
async function storeMedia(file: File): Promise<ContentHash> {
  // 1. Validate file type
  const mimeType = await detectMimeType(file);
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new Error('Unsupported media type');
  }

  // 2. Size limit
  if (file.size > MAX_MEDIA_SIZE) {
    throw new Error('Media file too large');
  }

  // 3. Store on IPFS via Bulletin chain
  const cid = await bulletinClient.storeBlob(await file.arrayBuffer());

  return {
    cid,
    mimeType,
    size: file.size,
  };
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

const MAX_MEDIA_SIZE = 10 * 1024 * 1024; // 10MB
```

---

## Retention Policy

### Data Lifecycle

| Data Type           | Retention       | Location             |
| ------------------- | --------------- | -------------------- |
| Signal metadata     | Permanent       | On-chain             |
| Content hashes      | Permanent       | On-chain             |
| Full signal content | 2 weeks minimum | Bulletin chain       |
| Media files         | 2 weeks minimum | IPFS via Bulletin    |
| Verification trails | Permanent       | Merkle root on-chain |

### Pinning for Permanence

```typescript
// Important signals can be pinned for permanent storage
async function pinSignal(signalId: SignalId): Promise<void> {
  const content = await retrieveSignalContent(signalId);

  // Pin to ensure permanence beyond 2-week window
  await bulletinClient.pin(content.cid);

  // Also pin any media
  for (const media of content.media) {
    await bulletinClient.pin(media.cid);
  }
}
```

---

## Performance Considerations

| Operation            | Latency     | Notes                |
| -------------------- | ----------- | -------------------- |
| Block time           | 6 seconds   | Faster than Ethereum |
| IPFS fetch (cached)  | ~100ms      | Local node cache     |
| IPFS fetch (network) | 1-5 seconds | DHT lookup           |
| On-chain query       | ~500ms      | RPC dependent        |

### Caching Strategy

```typescript
// Cache frequently accessed signals
const signalCache = new LRUCache<SignalId, BulletinSignalContent>({
  max: 1000,
  ttl: 1000 * 60 * 5, // 5 minutes
});

async function getSignalCached(id: SignalId): Promise<BulletinSignalContent> {
  const cached = signalCache.get(id);
  if (cached) return cached;

  const content = await retrieveSignalContent(id);
  if (content) signalCache.set(id, content);

  return content;
}
```

---

## Anti-Patterns

| Pattern                       | Status    | Reason                  |
| ----------------------------- | --------- | ----------------------- |
| Full content on-chain         | FORBIDDEN | Expensive, no privacy   |
| Skip hash verification        | FORBIDDEN | Data integrity risk     |
| Random IDs (not hashes)       | FORBIDDEN | Not content-addressed   |
| Trust off-chain without proof | FORBIDDEN | Tamper risk             |
| Store PII on Bulletin chain   | FORBIDDEN | Surveillance resistance |
| Skip CID validation           | FORBIDDEN | Content integrity       |
| Ignore retention policy       | FORBIDDEN | Data availability       |
