#!/usr/bin/env tsx
/**
 * Reset database to main schema, then apply current branch migrations and seed
 * 
 * Usage:
 *   pnpm test:migration
 * 
 * This script:
 * 1. Drops and recreates the local database
 * 2. Checks out main branch and runs its migrations
 * 3. Returns to original branch and runs its migrations
 * 4. Seeds the database with --all
 * 5. Regenerates TypeScript types
 */

import { execSync } from 'child_process';
import { exit } from 'process';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Client } from 'pg';

// Load .env.local file
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
} catch (error) {
  console.error('⚠️  Could not load .env.local file');
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable not set');
  console.error('Make sure .env.local exists with DATABASE_URL');
  exit(1);
}

const DB_NAME = DATABASE_URL.split('/').pop()?.split('?')[0] || 'gymtext_local';

// Parse DATABASE_URL to get postgres connection without database
const url = new URL(DATABASE_URL);
const POSTGRES_URL = `postgresql://${url.host}/postgres`;

// Helper to run commands and print output
function run(command: string, description: string) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📌 ${description}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`> ${command}\n`);
  
  try {
    execSync(command, { 
      stdio: 'inherit', 
      cwd: process.cwd(),
      env: process.env
    });
  } catch (error) {
    console.error(`\n❌ Failed: ${description}`);
    exit(1);
  }
}

async function recreateDatabase() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📌 Drop and recreate database: ${DB_NAME}`);
  console.log(`${'='.repeat(60)}\n`);

  // Connect to postgres database
  const client = new Client({ connectionString: POSTGRES_URL });
  
  try {
    await client.connect();
    
    // Terminate existing connections
    console.log('Terminating existing connections...');
    await client.query(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = '${DB_NAME}'
        AND pid <> pg_backend_pid()
    `);
    
    // Drop database if exists
    console.log(`Dropping database ${DB_NAME}...`);
    await client.query(`DROP DATABASE IF EXISTS ${DB_NAME}`);
    
    // Create fresh database
    console.log(`Creating database ${DB_NAME}...`);
    await client.query(`CREATE DATABASE ${DB_NAME}`);
    
    console.log('✅ Database recreated successfully');
  } catch (error) {
    console.error('❌ Database recreation failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

async function main() {
  console.log('\n🔄 DATABASE RESET FROM MAIN\n');

  // Get current branch
  const currentBranch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
  console.log(`Current branch: ${currentBranch}`);

  // Step 1: Drop and recreate database
  await recreateDatabase();

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
