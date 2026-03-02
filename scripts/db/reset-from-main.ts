#!/usr/bin/env tsx
/**
 * Migration Testing with Anonymized Production Data
 *
 * Usage:
 *   pnpm test:migration
 *
 * This script:
 * 1. Runs the anonymize pipeline (dump prod, restore, prune, anonymize)
 * 2. Runs current branch's migrations (the real test - against actual data)
 * 3. Seeds system data (agents, exercises)
 * 4. Regenerates TypeScript types
 * 5. Runs build to verify
 *
 * Requires READONLY_PROD_DB_URL and DATABASE_URL in environment.
 */

import { execSync } from 'child_process';
import { exit } from 'process';
import { readFileSync } from 'fs';
import { join } from 'path';

// ---------------------------------------------------------------------------
// Env loading
// ---------------------------------------------------------------------------

const envPath = join(process.cwd(), '.env.local');
try {
  const envFile = readFileSync(envPath, 'utf-8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      process.env[key] = value;
    }
  });
} catch {
  console.error('Could not load .env.local file');
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function run(command: string, description: string) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${description}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`> ${command}\n`);

  try {
    execSync(command, {
      stdio: 'inherit',
      cwd: process.cwd(),
      env: process.env,
    });
  } catch {
    console.error(`\nFailed: ${description}`);
    exit(1);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('\n  MIGRATION TEST WITH ANONYMIZED PRODUCTION DATA\n');

  const currentBranch = execSync('git branch --show-current', {
    encoding: 'utf-8',
  }).trim();
  console.log(`Branch: ${currentBranch}`);

  const startTime = Date.now();

  // Step 1: Run the anonymize pipeline (dump, restore, prune, anonymize)
  run('tsx scripts/db/anonymize.ts', 'Anonymize production data');

  // Step 2: Run branch migrations (the real test!)
  run('pnpm migrate:latest', `Run ${currentBranch} migrations`);

  // Step 3: Seed system data
  run('pnpm seed --all', 'Seed database');

  // Step 4: Regenerate TypeScript types
  run('pnpm db:codegen', 'Regenerate TypeScript types');

  // Step 5: Build
  run('pnpm build', 'Verify build passes');

  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  console.log(`\nMigration test complete in ${elapsed}m`);
  console.log(`Branch: ${currentBranch}`);
  console.log('\nVerification:');
  console.log('  SELECT name, phone_number, email FROM users LIMIT 5;');
  console.log('  SELECT phone_from, phone_to FROM messages LIMIT 5;');
}

main().catch(error => {
  console.error('Error:', error);
  exit(1);
});
