#!/bin/bash
# skill-sync.sh - Check reference repositories for skill updates
#
# Usage: ./scripts/skill-sync.sh
#
# Checks your reference repositories for updates and highlights
# skill file changes that may need to be incorporated.

set -e

# Reference repositories for Firefly Network / cocuyo
REFERENCE_REPOS=(
  "/Users/shawncoe/Documents/dev/product-infrastructure"
  "/Users/shawncoe/Documents/dev/dotns-sd"
  "/Users/shawncoe/Documents/dev/identity-backend"
  "/Users/shawncoe/Documents/dev/erc8004"
  "/Users/shawncoe/Documents/dev/polkadot-bulletin-chain"
  "/Users/shawncoe/Documents/dev/Agent-Skills-for-Context-Engineering"
)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🔄 Firefly Network Skill Sync"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

UPDATES_FOUND=0
SKILL_UPDATES=0

for repo in "${REFERENCE_REPOS[@]}"; do
  if [ ! -d "$repo" ]; then
    echo "${RED}✗ $(basename "$repo") - directory not found${NC}"
    continue
  fi

  repo_name=$(basename "$repo")
  cd "$repo"

  # Fetch without output
  git fetch origin -q 2>/dev/null || true

  # Get current and remote HEAD
  LOCAL=$(git rev-parse HEAD 2>/dev/null)
  REMOTE=$(git rev-parse origin/main 2>/dev/null || git rev-parse origin/master 2>/dev/null || echo "")

  if [ -z "$REMOTE" ]; then
    echo "${YELLOW}⚠️  $repo_name - no remote found${NC}"
    cd - > /dev/null
    continue
  fi

  if [ "$LOCAL" != "$REMOTE" ]; then
    echo "${YELLOW}⚠️  $repo_name has updates${NC}"

    # Count commits behind
    BEHIND=$(git rev-list HEAD..origin/main --count 2>/dev/null || \
             git rev-list HEAD..origin/master --count 2>/dev/null || echo "?")
    echo "   ${BLUE}$BEHIND commits behind${NC}"

    # Check for skill changes specifically
    SKILL_CHANGES=$(git diff --name-only HEAD..origin/main -- '.claude/skills/' 2>/dev/null || \
                   git diff --name-only HEAD..origin/master -- '.claude/skills/' 2>/dev/null || echo "")

    if [ -n "$SKILL_CHANGES" ]; then
      echo "   ${YELLOW}Skills changed:${NC}"
      echo "$SKILL_CHANGES" | sed 's/^/   📄 /'
      SKILL_UPDATES=1
    fi

    # Check for CLI changes in dotns-sd
    if [ "$repo_name" == "dotns-sd" ]; then
      CLI_CHANGES=$(git diff --name-only HEAD..origin/main -- 'packages/cli/src/cli/commands/' 2>/dev/null || \
                   git diff --name-only HEAD..origin/master -- 'packages/cli/src/cli/commands/' 2>/dev/null || echo "")
      if [ -n "$CLI_CHANGES" ]; then
        echo "   ${YELLOW}CLI commands changed:${NC}"
        echo "$CLI_CHANGES" | sed 's/^/   🔧 /'
        SKILL_UPDATES=1
      fi
    fi

    echo ""
    UPDATES_FOUND=1
  else
    echo "${GREEN}✓ $repo_name${NC}"
  fi

  cd - > /dev/null
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $UPDATES_FOUND -eq 1 ]; then
  echo "${YELLOW}Updates available in reference repos.${NC}"
  echo ""
  echo "To pull all updates:"
  echo ""
  echo "  for repo in ${REFERENCE_REPOS[*]}; do"
  echo '    cd "$repo" && git pull && cd -'
  echo "  done"
  echo ""

  if [ $SKILL_UPDATES -eq 1 ]; then
    echo "${YELLOW}⚡ Skill files have changed! Review and update:${NC}"
    echo "   .claude/skills/"
    echo ""
    echo "Skills to potentially update:"
    echo "   - dotns-cli.md       (from dotns-sd CLI changes)"
    echo "   - polkadot-web3.md   (from product-infrastructure)"
    echo "   - bulletin-chain.md  (from polkadot-bulletin-chain)"
  fi
else
  echo "${GREEN}All reference repositories are up to date.${NC}"
fi
