#!/bin/bash
#
# Deploy Firefly Network to dot.li via DotNS Bulletin
#
# Usage: ./deploy.sh [domain]
#   domain: The .dot.li domain to deploy to (default: fireflynetwork)
#
# Prerequisites:
#   - dotns CLI installed and configured
#   - DOTNS_MNEMONIC environment variable set
#   - Domain registered with DotNS
#
# One-time setup:
#   dotns pop set lite -m "$DOTNS_MNEMONIC"
#   dotns bulletin authorize <address> -m "$DOTNS_MNEMONIC"
#   dotns register domain --name fireflynetwork -m "$DOTNS_MNEMONIC"
#

set -e

DOMAIN=${1:-fireflynetwork}

echo "Building application..."
pnpm build

echo "Uploading to Bulletin..."
CID=$(dotns bulletin upload ./dist --parallel --print-contenthash -m "$DOTNS_MNEMONIC" | tail -1)

echo "Setting content hash for $DOMAIN..."
dotns content set "$DOMAIN" "$CID" -m "$DOTNS_MNEMONIC"

echo ""
echo "Deployed successfully!"
echo "Access at: https://$DOMAIN.dot.li/"
