---
description: Sync skills from reference repositories to check for updates
---

# Skill Sync Command

This command checks reference repositories for skill updates and suggests improvements.

## Reference Repositories

| Repo | Path | Skills to Watch |
|------|------|-----------------|
| product-infrastructure | `/Users/shawncoe/Documents/dev/product-infrastructure` | Polkadot patterns, skill structure |
| dotns-sdk | `/Users/shawncoe/Documents/dev/dotns-sd` | CLI commands, deployment |
| identity-backend | `/Users/shawncoe/Documents/dev/identity-backend` | Skill-creator, commands |
| erc8004 | `/Users/shawncoe/Documents/dev/erc8004` | Deployment, contracts |
| polkadot-bulletin-chain | `/Users/shawncoe/Documents/dev/polkadot-bulletin-chain` | Storage patterns |
| Agent-Skills-Context-Engineering | `/Users/shawncoe/Documents/dev/Agent-Skills-for-Context-Engineering` | Skill architecture |

## Sync Workflow

### Step 1: Pull Latest from Remotes

```bash
# Pull all reference repos
for repo in product-infrastructure dotns-sd identity-backend erc8004 polkadot-bulletin-chain Agent-Skills-for-Context-Engineering; do
  cd /Users/shawncoe/Documents/dev/$repo
  git fetch origin && git pull origin main 2>/dev/null || git pull origin master 2>/dev/null
  cd -
done
```

### Step 2: Compare Skills

Check these files for updates:

| Reference File | Local Skill | Check For |
|----------------|-------------|-----------|
| `erc8004/.claude/skills/deploy-frontend/SKILL.md` | `dotns-cli.md` | New CLI commands |
| `erc8004/.claude/skills/deploy-contracts/SKILL.md` | `polkadot-web3.md` | Deployment patterns |
| `identity-backend/.claude/skills/skill-creator/SKILL.md` | (skill structure) | New patterns |
| `product-infrastructure/.claude/skills/` | All skills | Architecture updates |
| `dotns-sd/packages/cli/src/cli/commands/` | `dotns-cli.md` | New CLI commands |

### Step 3: Generate Diff Report

For each reference, compare:
1. **New commands/patterns** not in local skills
2. **Changed invariants** that need updating
3. **New anti-patterns** to add
4. **Deprecated patterns** to remove

### Step 4: Update Skills

If updates found:
1. Read the updated reference file
2. Identify delta (what's new/changed)
3. Update local skill with new patterns
4. Add changelog entry at bottom of skill

## Changelog Format

Add to bottom of each skill when updated:

```markdown
---

## Changelog

| Date | Change | Source |
|------|--------|--------|
| 2024-XX-XX | Added new CLI command X | dotns-sdk v1.2.0 |
| 2024-XX-XX | Updated deployment workflow | erc8004 deploy-frontend |
```

## Automation

Run this check:
- Before starting major work
- Weekly during active development
- After reference repo announces updates

## Quick Check Script

```bash
#!/bin/bash
# skill-sync-check.sh

echo "Checking reference repos for updates..."

REPOS=(
  "product-infrastructure"
  "dotns-sd"
  "identity-backend"
  "erc8004"
  "polkadot-bulletin-chain"
)

for repo in "${REPOS[@]}"; do
  cd "/Users/shawncoe/Documents/dev/$repo"
  LOCAL=$(git rev-parse HEAD)
  git fetch origin -q
  REMOTE=$(git rev-parse origin/main 2>/dev/null || git rev-parse origin/master 2>/dev/null)

  if [ "$LOCAL" != "$REMOTE" ]; then
    echo "⚠️  $repo has updates available"
    git log --oneline HEAD..origin/main 2>/dev/null || git log --oneline HEAD..origin/master 2>/dev/null
  else
    echo "✓ $repo is up to date"
  fi
  cd - > /dev/null
done
```
