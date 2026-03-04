#!/usr/bin/env tsx
/**
 * Restore Anonymized Dump to Staging
 *
 * Restores an already-anonymized .pgdump file to the target database (typically staging).
 * The dump should have been created by `pnpm db:anonymize:dump`.
 *
 * Usage:
 *   source .env.staging && pnpm db:restore:staging                     # latest dump
 *   source .env.staging && pnpm db:restore:staging backups/anonymized_2026-03-01.pgdump
 *   source .env.staging && pnpm db:restore:staging --dry-run
 *
 * Env vars:
 *   DATABASE_URL — target database to restore into
 */

import { execSync } from 'child_process';
import { exit } from 'process';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { Client } from 'pg';
import * as readline from 'readline';

// ---------------------------------------------------------------------------
// CLI flags
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);

function getFlag(name: string): boolean {
  return args.includes(`--${name}`);
}

const DRY_RUN = getFlag('dry-run');

// Positional arg: dump file path (skip flags)
const positionalArgs = args.filter((a) => !a.startsWith('--'));
const dumpFileArg = positionalArgs[0] ?? null;

// ---------------------------------------------------------------------------
// Env validation
// ---------------------------------------------------------------------------

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable not set');
  console.error('Did you forget to `source .env.staging`?');
  exit(1);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function banner(description: string) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${description}`);
  console.log(`${'='.repeat(60)}`);
}

function getDbHost(): string {
  try {
    const url = new URL(DATABASE_URL!);
    return url.host;
  } catch {
    return DATABASE_URL!.substring(0, 60) + '...';
  }
}

/**
 * Find the most recent anonymized dump file in /backups/
 */
function findLatestDump(): string | null {
  const backupsDir = join(process.cwd(), 'backups');

  if (!existsSync(backupsDir)) return null;

  const files = readdirSync(backupsDir)
    .filter((f) => f.startsWith('anonymized_') && f.endsWith('.pgdump'))
    .sort()
    .reverse();

  if (files.length === 0) return null;

  return join(backupsDir, files[0]);
}

/**
 * Confirm with user before proceeding
 */
async function confirmRestore(dumpFile: string, dbHost: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    console.log('\n  WARNING: This will wipe and restore the target database.');
    console.log(`\n  Target DB host:  ${dbHost}`);
    console.log(`  Dump file:       ${dumpFile}`);
    console.log('');

    rl.question('Type "yes" to proceed: ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes');
    });
  });
}

// ---------------------------------------------------------------------------
// Clean target (drop all objects in public schema — Neon-compatible)
// ---------------------------------------------------------------------------

async function cleanTarget() {
  banner('Clean target: drop all objects in public schema');

  if (DRY_RUN) {
    console.log('[dry-run] Would drop all objects in public schema');
    return;
  }

  const client = new Client({ connectionString: DATABASE_URL });

  try {
    await client.connect();

    // Drop all objects in public schema without dropping the schema itself.
    // This preserves schema ownership and privileges (required for Neon).
    await client.query(`
      DO $$ DECLARE r RECORD;
      BEGIN
        -- tables (includes sequences owned by columns via CASCADE)
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
          EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
        -- standalone sequences
        FOR r IN (SELECT sequencename FROM pg_sequences WHERE schemaname = 'public') LOOP
          EXECUTE 'DROP SEQUENCE IF EXISTS public.' || quote_ident(r.sequencename) || ' CASCADE';
        END LOOP;
        -- views
        FOR r IN (SELECT viewname FROM pg_views WHERE schemaname = 'public') LOOP
          EXECUTE 'DROP VIEW IF EXISTS public.' || quote_ident(r.viewname) || ' CASCADE';
        END LOOP;
        -- functions (skip extension-owned)
        FOR r IN (
          SELECT p.oid::regprocedure AS sig
          FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid
          WHERE n.nspname = 'public'
            AND NOT EXISTS (
              SELECT 1 FROM pg_depend d
              WHERE d.objid = p.oid AND d.deptype = 'e'
            )
        ) LOOP
          EXECUTE 'DROP FUNCTION IF EXISTS ' || r.sig || ' CASCADE';
        END LOOP;
        -- custom types / enums
        FOR r IN (
          SELECT t.typname
          FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid
          WHERE n.nspname = 'public' AND t.typtype IN ('e', 'c')
        ) LOOP
          EXECUTE 'DROP TYPE IF EXISTS public.' || quote_ident(r.typname) || ' CASCADE';
        END LOOP;
      END $$;
    `);
    console.log('All objects in public schema dropped');
  } finally {
    await client.end();
  }
}

// ---------------------------------------------------------------------------
// Restore
// ---------------------------------------------------------------------------

async function restoreFromDump(dumpFile: string) {
  banner('Restore from anonymized dump');

  if (DRY_RUN) {
    console.log(`[dry-run] Would run pg_restore from ${dumpFile}`);
    return;
  }

  console.log('Running pg_restore...');
  try {
    execSync(
      `pg_restore --dbname="${DATABASE_URL}" --jobs=4 --no-owner --no-privileges "${dumpFile}"`,
      { stdio: 'inherit' },
    );
  } catch (err: any) {
    // pg_restore exits 1 for non-fatal warnings (e.g. "extension already exists").
    // Only swallow exit-code 1; anything else is a real failure.
    if (err.status !== 1) throw err;
    console.log('pg_restore exited with warnings (exit code 1) — continuing');
  }

  console.log('pg_restore complete');
}

// ---------------------------------------------------------------------------
// Ensure Kysely migration tables exist
// ---------------------------------------------------------------------------

async function ensureMigrationTables() {
  banner('Ensure Kysely migration tables');

  if (DRY_RUN) {
    console.log('[dry-run] Would ensure kysely_migration and kysely_migration_lock tables exist');
    return;
  }

  const client = new Client({ connectionString: DATABASE_URL });
  try {
    await client.connect();

    // Neon's pooler may not default to public schema
    await client.query('SET search_path TO public');

    // Always create tables with IF NOT EXISTS — avoids check-then-act race
    // conditions and Neon pooler quirks where pg_tables may disagree with
    // actual table accessibility.
    await client.query(`
      CREATE TABLE IF NOT EXISTS kysely_migration (
        name varchar(255) NOT NULL PRIMARY KEY,
        timestamp varchar(255) NOT NULL
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS kysely_migration_lock (
        id varchar(255) NOT NULL PRIMARY KEY,
        is_locked integer NOT NULL DEFAULT 0
      )
    `);

    await client.query(`
      INSERT INTO kysely_migration_lock (id, is_locked)
      VALUES ('migration_lock', 0)
      ON CONFLICT (id) DO NOTHING
    `);

    // Check if migrations were already recorded (from the dump)
    const existing = await client.query(`SELECT count(*)::int AS n FROM kysely_migration`);
    if (existing.rows[0].n > 0) {
      console.log(`Migration tables ready (${existing.rows[0].n} migrations already recorded)`);
      return;
    }

    // Scan the migrations directory and mark all as applied, since the dump
    // already contains the schema at the point when the dump was created.
    console.log('Recording existing migrations as applied...');
    const migrationsDir = join(process.cwd(), 'migrations');
    const migrationFiles = readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.ts') || f.endsWith('.js'))
      .sort();

    const now = new Date().toISOString();
    for (const file of migrationFiles) {
      const name = file.replace(/\.(ts|js)$/, '');
      await client.query(
        `INSERT INTO kysely_migration (name, timestamp) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING`,
        [name, now],
      );
    }

    console.log(`Recorded ${migrationFiles.length} migrations as applied`);
  } finally {
    await client.end();
  }
}

// ---------------------------------------------------------------------------
// Verify
// ---------------------------------------------------------------------------

async function verifyRestore() {
  banner('Verify restore');

  if (DRY_RUN) {
    console.log('[dry-run] Would verify table count');
    return;
  }

  const client = new Client({ connectionString: DATABASE_URL });
  try {
    await client.connect();
    await client.query('SET search_path TO public');
    const res = await client.query(
      `SELECT count(*)::int AS n FROM pg_tables WHERE schemaname = 'public'`,
    );
    const tableCount = res.rows[0]?.n ?? 0;
    console.log(`Tables in public schema: ${tableCount}`);

    if (tableCount === 0) {
      throw new Error(
        'pg_restore produced 0 tables — check DATABASE_URL and pg_restore output above',
      );
    }

    // Show a few table row counts for confidence
    const sampleTables = ['users', 'messages', 'workout_instances', 'fitness_plans'];
    for (const table of sampleTables) {
      try {
        const countRes = await client.query(
          `SELECT count(*)::int AS n FROM ${table}`,
        );
        console.log(`  ${table}: ${countRes.rows[0]?.n ?? 0} rows`);
      } catch {
        // Table may not exist in older dumps
      }
    }
  } finally {
    await client.end();
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('\n  RESTORE ANONYMIZED DUMP\n');
  if (DRY_RUN) console.log('  [DRY RUN MODE]\n');

  const dbHost = getDbHost();

  // Resolve dump file
  let dumpFile: string;
  if (dumpFileArg) {
    dumpFile = dumpFileArg;
  } else {
    const latest = findLatestDump();
    if (!latest) {
      console.error('No dump file specified and no anonymized_*.pgdump found in /backups/');
      console.error('Usage: pnpm db:restore:staging [path/to/anonymized_*.pgdump]');
      exit(1);
    }
    dumpFile = latest;
    console.log(`Using latest dump: ${dumpFile}`);
  }

  // Validate dump file exists
  if (!existsSync(dumpFile)) {
    console.error(`Dump file not found: ${dumpFile}`);
    exit(1);
  }

  console.log(`Target DB:  ${dbHost}`);
  console.log(`Dump file:  ${dumpFile}`);

  // Confirm
  if (!DRY_RUN) {
    const confirmed = await confirmRestore(dumpFile, dbHost);
    if (!confirmed) {
      console.log('Restore cancelled.');
      exit(0);
    }
  }

  const startTime = Date.now();

  // Step 1: Wipe target schema
  await cleanTarget();

  // Step 2: Restore from dump
  await restoreFromDump(dumpFile);

  // Step 3: Ensure Kysely migration tables exist
  // pg_restore on Neon often fails to restore these (swallowed as exit code 1)
  await ensureMigrationTables();

  // Step 4: Verify
  await verifyRestore();

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\nRestore complete in ${elapsed}s`);
  console.log('\nNext step: run migrations on staging');
  console.log('  source .env.staging && pnpm migrate:up');
}

main().catch((error) => {
  console.error('Error:', error);
  exit(1);
});
