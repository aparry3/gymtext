#!/usr/bin/env tsx
/**
 * Create Anonymized Dump
 *
 * Produces a pg_dump file with anonymized production data, without ever
 * putting real PII into your local dev database.
 *
 * Flow:
 *   1. Create a temporary database (gymtext_anon_tmp)
 *   2. Point DATABASE_URL at it and run the full anonymize pipeline
 *   3. pg_dump the anonymized result to backups/
 *   4. Drop the temp database
 *
 * Usage:
 *   source .env.local && pnpm db:anonymize:dump
 *   source .env.local && pnpm db:anonymize:dump --keep 5
 *
 * Requires:
 *   READONLY_PROD_DB_URL — read-only prod connection (source)
 *   DATABASE_URL         — only used to derive the Postgres server connection
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { Client } from 'pg';

const TEMP_DB = 'gymtext_anon_tmp';

// ---------------------------------------------------------------------------
// Derive postgres connection from DATABASE_URL (to create/drop temp DB)
// ---------------------------------------------------------------------------

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable not set');
  process.exit(1);
}

if (!process.env.READONLY_PROD_DB_URL) {
  console.error('READONLY_PROD_DB_URL environment variable not set');
  process.exit(1);
}

const url = new URL(DATABASE_URL);
const POSTGRES_URL = `postgresql://${url.username}:${url.password}@${url.host}/postgres${url.search}`;
const TEMP_DB_URL = `postgresql://${url.username}:${url.password}@${url.host}/${TEMP_DB}${url.search}`;

// Pass-through flags (--keep N, --dry-run, etc.)
const passthroughArgs = process.argv.slice(2).join(' ');

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('\n  CREATE ANONYMIZED DUMP\n');
  console.log(`Temp database: ${TEMP_DB}`);
  console.log(`Server: ${url.host}\n`);

  const client = new Client({ connectionString: POSTGRES_URL });

  try {
    await client.connect();

    // 1. Create temp database
    console.log(`Creating temp database ${TEMP_DB}...`);
    await client.query(`DROP DATABASE IF EXISTS "${TEMP_DB}"`);
    await client.query(`CREATE DATABASE "${TEMP_DB}"`);
    await client.end();

    // 2. Run anonymize pipeline against the temp DB
    console.log('\nRunning anonymize pipeline against temp DB...\n');
    execSync(
      `tsx scripts/db/anonymize.ts ${passthroughArgs}`,
      {
        stdio: 'inherit',
        cwd: process.cwd(),
        env: { ...process.env, DATABASE_URL: TEMP_DB_URL },
      },
    );

    // 3. Dump the anonymized result
    const backupsDir = join(process.cwd(), 'backups');
    if (!existsSync(backupsDir)) {
      mkdirSync(backupsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const outputPath = join(backupsDir, `anonymized_${timestamp}.pgdump`);

    console.log(`\nDumping anonymized data to ${outputPath}...`);
    execSync(
      `pg_dump "${TEMP_DB_URL}" --format=custom --compress=9 --file="${outputPath}"`,
      { stdio: 'inherit' },
    );

    console.log(`\nAnonymized dump created: ${outputPath}`);
    console.log('\nTo restore to staging:');
    console.log(`  source .env.staging && pg_restore --dbname="$DATABASE_URL" --jobs=4 --no-owner --no-privileges "${outputPath}"`);
    console.log('\nTo restore locally:');
    console.log(`  source .env.local && pg_restore --dbname="$DATABASE_URL" --jobs=4 --no-owner --no-privileges --clean --if-exists "${outputPath}"`);
  } finally {
    // 4. Drop temp database
    console.log(`\nCleaning up temp database ${TEMP_DB}...`);
    const cleanup = new Client({ connectionString: POSTGRES_URL });
    try {
      await cleanup.connect();
      await cleanup.query(`DROP DATABASE IF EXISTS "${TEMP_DB}"`);
      console.log('Temp database dropped');
    } finally {
      await cleanup.end();
    }
  }
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
