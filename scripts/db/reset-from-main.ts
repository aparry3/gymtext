#!/usr/bin/env tsx
/**
 * Reset database to main schema, then apply current branch migrations and seed
 * 
 * Usage:
 *   pnpm db:reset-from-main
 * 
 * This script:
 * 1. Drops and recreates the local database
 * 2. Checks out main branch and runs its migrations
 * 3. Returns to original branch and runs its migrations
 * 4. Seeds the database with --all
 */

import { execSync } from 'child_process';
import { exit } from 'process';

const DB_NAME = process.env.DATABASE_URL?.split('/').pop()?.split('?')[0] || 'gymtext_local';

// Helper to run commands and print output
function run(command: string, description: string) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📌 ${description}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`> ${command}\n`);
  
  try {
    execSync(command, { stdio: 'inherit', cwd: process.cwd() });
  } catch (error) {
    console.error(`\n❌ Failed: ${description}`);
    exit(1);
  }
}

async function main() {
  console.log('\n🔄 DATABASE RESET FROM MAIN\n');

  // Get current branch
  const currentBranch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
  console.log(`Current branch: ${currentBranch}`);

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable not set');
    console.error('Run: source .env.local');
    exit(1);
  }

  // Step 1: Drop and recreate database
  run(`dropdb ${DB_NAME} || true`, 'Drop existing database (if exists)');
  run(`createdb ${DB_NAME}`, 'Create fresh database');

  // Step 2: Checkout main and run migrations
  run('git checkout main', 'Checkout main branch');
  run('pnpm migrate:latest', 'Run main branch migrations');

  // Step 3: Return to original branch and run its migrations
  if (currentBranch !== 'main') {
    run(`git checkout ${currentBranch}`, `Return to ${currentBranch} branch`);
    run('pnpm migrate:latest', `Run ${currentBranch} migrations`);
  }

  // Step 4: Seed database
  run('pnpm seed --all', 'Seed database with agents and exercises');

  // Step 5: Regenerate TypeScript types from new schema
  run('pnpm db:codegen', 'Regenerate TypeScript types from schema');

  console.log('\n✅ Database reset complete!');
  console.log(`\nDatabase: ${DB_NAME}`);
  console.log(`Branch: ${currentBranch}`);
  console.log('\nNext steps:');
  console.log('  pnpm build');
  console.log('  pnpm dev\n');
}

main().catch((error) => {
  console.error('❌ Error:', error);
  exit(1);
});
