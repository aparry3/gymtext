#!/usr/bin/env bash
# Wrapper for kysely-codegen that gracefully skips if DATABASE_URL is not set
# This allows Vercel preview builds to succeed without database access

if [ -z "$DATABASE_URL" ]; then
  echo "⚠️  DATABASE_URL not set - skipping db:codegen"
  echo "   Using existing type definitions from previous run"
  echo "   (This is expected in Vercel preview deployments)"
  exit 0
fi

echo "✓ DATABASE_URL found - running db:codegen"
exec kysely-codegen --dialect postgres --camel-case --out-file ./src/server/models/_types/index.ts --exclude-pattern '^kysely_' --log-level info --type-only-imports
