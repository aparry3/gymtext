#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
echo "Cleaning $ROOT ..."

# Remove all node_modules directories
echo "→ Removing node_modules..."
find "$ROOT" -name node_modules -type d -prune -exec rm -rf {} +

# Remove build outputs
echo "→ Removing build artifacts (.next, dist, .turbo)..."
find "$ROOT" -name .next -type d -prune -exec rm -rf {} +
find "$ROOT" -name dist -type d -prune -exec rm -rf {} +
find "$ROOT" -name .turbo -type d -prune -exec rm -rf {} +

# Remove TypeScript build caches
echo "→ Removing tsbuildinfo files..."
find "$ROOT" -name '*.tsbuildinfo' -type f -delete

# Remove pnpm store link cache
echo "→ Removing pnpm lock metadata..."
rm -rf "$ROOT/node_modules/.pnpm"

# Remove misc caches
echo "→ Removing .cache and .eslintcache..."
find "$ROOT" -name .cache -type d -prune -exec rm -rf {} +
find "$ROOT" -name .eslintcache -type f -delete

echo ""
echo "Done! Run 'pnpm install' to reinstall dependencies."
