---
name: dotns-cli
description: 'Deploy frontends and manage domains using dotns CLI. Triggers: deploy, dotns, bulletin, upload, domain, register, frontend, CLI'
---

# dotns CLI Deployment Skill

## When to Activate

- Deploying frontend to Bulletin chain
- Registering .dot domains
- Uploading content to decentralized storage
- Setting up PoP (proof-of-personhood) status
- Managing domain content hashes

---

## Global Invariants

| Rule                           | Enforcement               | Status    |
| ------------------------------ | ------------------------- | --------- |
| Use Bun for CLI                | Node 22+ WebSocket issues | MANDATORY |
| PoP status before registration | Required for domain names | MANDATORY |
| Bulletin auth before upload    | Authorization required    | MANDATORY |
| Upload before content set      | CID needed first          | MANDATORY |
| No .dot suffix in CLI          | Just the label            | MANDATORY |

---

## CLI Invocation

```bash
# From dotns-sdk directory
cd /path/to/dotns-sdk/packages/cli
bun run src/cli/index.ts <command> [options]

# Or if installed globally
dotns <command> [options]
```

---

## Authentication Options

All commands accept these auth flags:

| Flag                | Description            | Example                  |
| ------------------- | ---------------------- | ------------------------ |
| `--mnemonic` / `-m` | 12-word seed phrase    | `-m "word1 word2..."`    |
| `--key-uri`         | SURI format (dev only) | `--key-uri "//Alice"`    |
| `--account`         | Named keystore account | `--account main`         |
| `--rpc`             | Custom RPC endpoint    | `--rpc wss://custom.rpc` |

### Environment Variables

```bash
export DOTNS_MNEMONIC="your 12-word seed phrase"
export DOTNS_RPC="wss://asset-hub-paseo-rpc.n.dwellir.com"
export DOTNS_KEYSTORE_PATH="~/.dotns/keystore"
export DOTNS_KEYSTORE_PASSWORD="your-password"
```

---

## Complete Deployment Workflow

### Frontend Deployment to Bulletin + dotns

```bash
# 0. Set environment
export DOTNS_MNEMONIC="your 12-word seed phrase"
CLI="bun run src/cli/index.ts"

# 1. One-time: Set PoP Lite status (required for domain registration)
$CLI pop set lite -m "$DOTNS_MNEMONIC"

# 2. One-time: Authorize for Bulletin storage
$CLI bulletin authorize <your-substrate-address> -m "$DOTNS_MNEMONIC"

# 3. Build your frontend
cd /path/to/your/project
pnpm build  # Output: dist/ or out/

# 4. Check domain availability
cd /path/to/dotns-sdk/packages/cli
$CLI lookup name <your-domain-label>

# 5. Register domain (if needed)
$CLI register domain --name <your-domain-label> -m "$DOTNS_MNEMONIC"

# 6. Upload to Bulletin (returns CID)
$CLI bulletin upload /path/to/dist \
  --parallel \
  --concurrency 5 \
  --print-contenthash \
  -m "$DOTNS_MNEMONIC"

# 7. Set content hash on domain
$CLI content set <your-domain-label> <cid> -m "$DOTNS_MNEMONIC"

# 8. Verify
$CLI content view <your-domain-label>
```

### Access Your Deployment

| Gateway       | URL Pattern                    |
| ------------- | ------------------------------ |
| Paseo Gateway | `https://<domain>.paseo.li/`   |
| IPFS Gateway  | `https://ipfs.io/ipfs/<cid>`   |
| dweb.link     | `https://dweb.link/ipfs/<cid>` |

---

## Command Reference

### Proof of Personhood (`pop`)

```bash
# Set PoP status
pop set <status> -m "$MNEMONIC"
# status: none | lite | full

# View current status
pop info -m "$MNEMONIC"
```

### Domain Registration (`register`)

```bash
# Register base domain
register domain \
  --name <label> \
  --status <none|lite|full> \
  --reverse \
  -m "$MNEMONIC"

# Register subdomain
register subname \
  --name <subdomain> \
  --parent <parent-domain> \
  -m "$MNEMONIC"
```

### Domain Lookup (`lookup`)

```bash
# Check availability
lookup name <label>

# Get domain owner
lookup owner-of <domain>
```

### Content Management (`content`)

```bash
# View current content hash
content view <domain-label>

# Set content hash (after uploading)
content set <domain-label> <cid> -m "$MNEMONIC"
```

### Bulletin Storage (`bulletin`)

```bash
# Authorize for storage (one-time)
bulletin authorize <address> \
  --bulletin-rpc wss://bulletin.dotspark.app \
  -m "$MNEMONIC"

# Upload file or directory
bulletin upload <path> \
  --parallel \
  --concurrency 5 \
  --print-contenthash \
  --chunk-size 1048576 \
  -m "$MNEMONIC"

# View upload history
bulletin history

# Remove from history
bulletin history:remove <cid>

# Clear all history
bulletin history:clear
```

### Auth Management (`auth`)

```bash
# Set up account
auth set --mnemonic "your seed phrase"
```

---

## Network Configuration

### RPC Endpoints

| Network            | RPC URL                                    |
| ------------------ | ------------------------------------------ |
| Asset Hub Paseo    | `wss://asset-hub-paseo-rpc.n.dwellir.com`  |
| Bulletin Paseo     | `wss://bulletin.dotspark.app`              |
| Asset Hub Polkadot | `wss://polkadot-asset-hub-rpc.polkadot.io` |

### Contract Addresses (Paseo)

```
DOTNS_REGISTRAR: 0x329aAA5b6bEa94E750b2dacBa74Bf41291E6c2BD
DOTNS_REGISTRY: 0x4Da0d37aBe96C06ab19963F31ca2DC0412057a6f
DOTNS_RESOLVER: 0x95645C7fD0fF38790647FE13F87Eb11c1DCc8514
DOTNS_CONTENT_RESOLVER: 0x7756DF72CBc7f062e7403cD59e45fBc78bed1cD7
```

---

## Contrastive Exemplars

### Correct Deployment Order

✅ CORRECT:

```bash
# 1. PoP first
pop set lite -m "$MNEMONIC"

# 2. Authorize bulletin
bulletin authorize $ADDRESS -m "$MNEMONIC"

# 3. Register domain
register domain --name myapp -m "$MNEMONIC"

# 4. Build
pnpm build

# 5. Upload (get CID)
CID=$(bulletin upload ./dist --print-contenthash -m "$MNEMONIC" | grep CID | awk '{print $2}')

# 6. Set content AFTER upload
content set myapp $CID -m "$MNEMONIC"
```

❌ FAIL:

```bash
# WRONG: Trying to set content before upload
content set myapp <some-cid> -m "$MNEMONIC"
bulletin upload ./dist ...  # Too late!

# WRONG: Registering without PoP
register domain --name myapp -m "$MNEMONIC"
# Error: "Requires Personhood Lite"

# WRONG: Uploading without authorization
bulletin upload ./dist -m "$MNEMONIC"
# Error: "Account is not authorized"
```

### Domain Name Format

✅ CORRECT:

```bash
# Just the label, no TLD
register domain --name myapp -m "$MNEMONIC"
lookup name myapp
content set myapp $CID -m "$MNEMONIC"
```

❌ FAIL:

```bash
# WRONG: Including .dot suffix
register domain --name myapp.dot -m "$MNEMONIC"
```

---

## Common Errors & Fixes

| Error                         | Cause                | Fix                                |
| ----------------------------- | -------------------- | ---------------------------------- |
| "Requires Personhood Lite"    | No PoP status        | `pop set lite -m ...`              |
| "Account is not authorized"   | No bulletin auth     | `bulletin authorize <addr> -m ...` |
| "WebSocket connection failed" | Using Node (not Bun) | Use `bun run` instead              |
| "Insufficient balance"        | Low PAS balance      | Fund account with testnet PAS      |
| "Domain already registered"   | Name taken           | Choose different name              |

---

## Automation Script

```bash
#!/bin/bash
# deploy-frontend.sh

set -e

DOTNS_CLI_DIR="/path/to/dotns-sdk/packages/cli"
BUILD_DIR="./dist"
DOMAIN_NAME="${1:-myapp}"

cd "$DOTNS_CLI_DIR"
CLI="bun run src/cli/index.ts"

echo "Building frontend..."
cd - && pnpm build

echo "Uploading to Bulletin..."
cd "$DOTNS_CLI_DIR"
UPLOAD_OUTPUT=$($CLI bulletin upload "$BUILD_DIR" --parallel --print-contenthash -m "$DOTNS_MNEMONIC")
CID=$(echo "$UPLOAD_OUTPUT" | grep -oP 'CID: \K[^\s]+')

echo "Setting content hash..."
$CLI content set "$DOMAIN_NAME" "$CID" -m "$DOTNS_MNEMONIC"

echo "Deployed! Access at: https://${DOMAIN_NAME}.paseo.li/"
```

---

## Anti-Patterns

| Pattern                      | Status    | Reason             |
| ---------------------------- | --------- | ------------------ |
| Use Node instead of Bun      | FORBIDDEN | WebSocket issues   |
| Mix --mnemonic and --key-uri | FORBIDDEN | Explicit error     |
| Include .dot in domain name  | FORBIDDEN | Just use label     |
| Skip PoP setup               | FORBIDDEN | Registration fails |
| Skip bulletin authorization  | FORBIDDEN | Upload fails       |
| Set content before upload    | FORBIDDEN | No CID available   |
| Use HTTP for RPC             | FORBIDDEN | Needs WebSocket    |
