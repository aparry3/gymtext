#!/usr/bin/env tsx
/**
 * Migration Testing with Anonymized Production Data
 *
 * Usage:
 *   pnpm test:migration
 *
 * This script:
 * 1. Drops and recreates the local database
 * 2. pg_dump from prod (via READONLY_PROD_DB_URL) and pg_restore to local
 * 3. Selects 15 users by data completeness, deletes the rest
 * 4. Anonymizes remaining data: remaps IDs, scrubs PII, replaces embedded names/phones
 * 5. Runs current branch's migrations (the real test - against actual data)
 * 6. Seeds system data (agents, exercises)
 * 7. Regenerates TypeScript types
 * 8. Runs build to verify
 *
 * Requires READONLY_PROD_DB_URL in .env.local (read-only connection to production).
 */

import { execSync } from 'child_process';
import { exit } from 'process';
import { readFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { Client } from 'pg';
import { Kysely, PostgresDialect, sql } from 'kysely';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';

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

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable not set');
  exit(1);
}

const PROD_URL = process.env.READONLY_PROD_DB_URL;
if (!PROD_URL) {
  console.error('READONLY_PROD_DB_URL environment variable not set');
  console.error('Add a read-only connection string to production in .env.local');
  exit(1);
}

if (PROD_URL === DATABASE_URL) {
  console.error('READONLY_PROD_DB_URL must differ from DATABASE_URL');
  exit(1);
}

const DB_NAME = DATABASE_URL.split('/').pop()?.split('?')[0] || 'gymtext_local';
const url = new URL(DATABASE_URL);
const POSTGRES_URL = `postgresql://${url.host}/postgres`;

const DUMP_PATH = '/tmp/gymtext-prod-dump.pgdump';

// System IDs to preserve (never remap)
const SYSTEM_IDS = new Set([
  '00000000-0000-0000-0000-000000000001', // AI_OWNER_ID
  '00000000-0000-0000-0000-000000000002', // AI_PROGRAM_ID
  '00000000-0000-0000-0000-000000000003', // AI_VERSION_ID
]);

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

function generateFakePhone(): string {
  const areaCode = faker.number.int({ min: 200, max: 999 });
  const exchange = faker.number.int({ min: 200, max: 999 });
  const subscriber = faker.number.int({ min: 1000, max: 9999 });
  return `+1${areaCode}${exchange}${subscriber}`;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function newId(oldId: string): string {
  if (SYSTEM_IDS.has(oldId)) return oldId;
  return uuidv4();
}

// ---------------------------------------------------------------------------
// Database recreation
// ---------------------------------------------------------------------------

async function recreateDatabase() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  Drop and recreate database: ${DB_NAME}`);
  console.log(`${'='.repeat(60)}\n`);

  const client = new Client({ connectionString: POSTGRES_URL });

  try {
    await client.connect();

    console.log('Terminating existing connections...');
    await client.query(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = '${DB_NAME}'
        AND pid <> pg_backend_pid()
    `);

    console.log(`Dropping database ${DB_NAME}...`);
    await client.query(`DROP DATABASE IF EXISTS ${DB_NAME}`);

    console.log(`Creating database ${DB_NAME}...`);
    await client.query(`CREATE DATABASE ${DB_NAME}`);

    console.log('Database recreated successfully');
  } finally {
    await client.end();
  }
}

// ---------------------------------------------------------------------------
// Dump & restore
// ---------------------------------------------------------------------------

function dumpAndRestore() {
  console.log(`\n${'='.repeat(60)}`);
  console.log('  Dump production and restore locally');
  console.log(`${'='.repeat(60)}\n`);

  console.log('Dumping production database...');
  execSync(
    `pg_dump "${PROD_URL}" --format=custom --compress=9 --file="${DUMP_PATH}"`,
    { stdio: 'inherit' },
  );

  console.log('Restoring to local database...');
  execSync(
    `pg_restore --dbname="${DATABASE_URL}" --jobs=4 --no-owner --no-privileges "${DUMP_PATH}"`,
    { stdio: 'inherit' },
  );

  console.log('Dump & restore complete');
}

// ---------------------------------------------------------------------------
// User selection & pruning
// ---------------------------------------------------------------------------

async function selectAndPruneUsers(db: Kysely<any>, count: number) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  Select top ${count} users and prune the rest`);
  console.log(`${'='.repeat(60)}\n`);

  // Score users by data completeness
  const scoredUsers = await sql<{ id: string; score: number }>`
    SELECT u.id,
      (
        (SELECT count(*)::int FROM messages WHERE client_id = u.id) +
        (SELECT count(*)::int FROM workout_instances WHERE client_id = u.id) * 5 +
        (SELECT count(*)::int FROM fitness_plans WHERE client_id = u.id) * 10 +
        (SELECT count(*)::int FROM profiles WHERE client_id = u.id) * 10 +
        (SELECT count(*)::int FROM microcycles WHERE client_id = u.id) * 5
      ) as score
    FROM users u
    ORDER BY score DESC
    LIMIT ${count}
  `.execute(db);

  const keepIds = scoredUsers.rows.map(r => r.id);
  console.log(`Selected ${keepIds.length} users (top scores: ${scoredUsers.rows.slice(0, 3).map(r => r.score).join(', ')}...)`);

  if (keepIds.length === 0) {
    console.error('No users found in database');
    exit(1);
  }

  // Disable FK constraints
  await sql`SET session_replication_role = replica`.execute(db);

  // Delete user-related data for non-selected users
  // Order: leaves first to avoid FK issues (though constraints are disabled)
  const userScopedTables: { table: string; col: string; condition?: string }[] = [
    { table: 'message_queues', col: 'client_id' },
    { table: 'user_exercise_metrics', col: 'client_id' },
    { table: 'exercise_uses', col: 'user_id' },
    { table: 'workout_instances', col: 'client_id' },
    { table: 'program_enrollments', col: 'client_id' },
    { table: 'microcycles', col: 'client_id' },
    { table: 'fitness_plans', col: 'client_id' },
    { table: 'messages', col: 'client_id' },
    { table: 'profile_updates', col: 'client_id' },
    { table: 'profiles', col: 'client_id' },
    { table: 'subscriptions', col: 'client_id' },
    { table: 'user_onboarding', col: 'client_id' },
    { table: 'short_links', col: 'client_id' },
    { table: 'day_configs', col: 'scope_id' },
    { table: 'event_logs', col: 'user_id' },
    { table: 'admin_activity_logs', col: 'target_client_id' },
  ];

  for (const { table, col } of userScopedTables) {
    const result = await sql`
      DELETE FROM ${sql.table(table)}
      WHERE ${sql.ref(col)} IS NOT NULL
        AND ${sql.ref(col)} != ALL(${keepIds}::uuid[])
    `.execute(db);
    console.log(`  ${table}: deleted ${(result as any).numAffectedRows ?? '?'} rows`);
  }

  // Referrals: delete where either referrer or referee is not in keepIds
  await sql`
    DELETE FROM referrals
    WHERE referrer_id != ALL(${keepIds}::uuid[])
       OR referee_id != ALL(${keepIds}::uuid[])
  `.execute(db);
  console.log('  referrals: pruned');

  // Delete non-selected users
  await sql`
    DELETE FROM users WHERE id != ALL(${keepIds}::uuid[])
  `.execute(db);
  console.log('  users: pruned');

  // Truncate tables without user FK
  await sql`TRUNCATE agent_logs`.execute(db);
  console.log('  agent_logs: truncated');

  await sql`TRUNCATE user_auth_codes`.execute(db);
  console.log('  user_auth_codes: truncated');

  // Clean up orphaned actor_client_id references in admin_activity_logs
  await sql`
    UPDATE admin_activity_logs SET actor_client_id = NULL
    WHERE actor_client_id IS NOT NULL
      AND actor_client_id != ALL(${keepIds}::uuid[])
  `.execute(db);

  // Re-enable FK constraints
  await sql`SET session_replication_role = DEFAULT`.execute(db);

  console.log('\nUser pruning complete');
}

// ---------------------------------------------------------------------------
// Anonymization
// ---------------------------------------------------------------------------

async function anonymizeLocalDb(db: Kysely<any>) {
  console.log(`\n${'='.repeat(60)}`);
  console.log('  Anonymize local database');
  console.log(`${'='.repeat(60)}\n`);

  // ------------------------------------------------------------------
  // Phase 1: Build ID maps for all tables that need remapping
  // ------------------------------------------------------------------
  console.log('Phase 1: Building ID maps...');

  const idMaps: Record<string, Map<string, string>> = {};

  // Tables whose PKs need remapping (with their PK column, always 'id')
  const remapTables = [
    'users',
    'profiles',
    'profile_updates',
    'subscriptions',
    'messages',
    'microcycles',
    'workout_instances',
    'user_onboarding',
    'short_links',
    'referrals',
    'day_configs',
    'message_queues',
    'admin_activity_logs',
    'fitness_plans',
    'program_owners',
    'programs',
    'program_versions',
    'program_families',
    'program_enrollments',
    'page_visits',
    'uploaded_images',
    'user_exercise_metrics',
    'exercise_uses',
    'organizations',
    'organization_members',
    'blog_posts',
    'event_logs',
  ];

  for (const table of remapTables) {
    const map = new Map<string, string>();
    const rows = await sql<{ id: string }>`
      SELECT id FROM ${sql.table(table)}
    `.execute(db);

    for (const row of rows.rows) {
      map.set(row.id, newId(row.id));
    }
    idMaps[table] = map;
    console.log(`  ${table}: ${map.size} IDs`);
  }

  // ------------------------------------------------------------------
  // Phase 2: Build PII maps (old name/phone → fake)
  // ------------------------------------------------------------------
  console.log('\nPhase 2: Building PII maps...');

  const nameMap = new Map<string, string>();
  const phoneMap = new Map<string, string>();

  const users = await db
    .selectFrom('users')
    .select(['id', 'name', 'phone_number'])
    .execute();

  for (const user of users) {
    const fakeName = faker.person.fullName();
    const fakePhone = generateFakePhone();
    nameMap.set(user.name, fakeName);
    phoneMap.set(user.phone_number, fakePhone);
  }

  // Also map program_owners display names and phones
  const owners = await db
    .selectFrom('program_owners')
    .select(['id', 'display_name', 'phone'])
    .execute();

  for (const owner of owners) {
    if (owner.display_name && !nameMap.has(owner.display_name)) {
      nameMap.set(owner.display_name, faker.person.fullName());
    }
    if (owner.phone && !phoneMap.has(owner.phone)) {
      phoneMap.set(owner.phone, generateFakePhone());
    }
  }

  console.log(`  ${nameMap.size} names, ${phoneMap.size} phones mapped`);

  // Text anonymization helpers using the maps
  function anonymizeText(text: string | null): string | null {
    if (!text) return text;
    let result = text;
    for (const [oldPhone, newPhone] of phoneMap) {
      result = result.replaceAll(oldPhone, newPhone);
    }
    for (const [oldName, newName] of nameMap) {
      if (oldName.length > 2) {
        result = result.replace(
          new RegExp(`\\b${escapeRegex(oldName)}\\b`, 'gi'),
          newName,
        );
      }
    }
    return result;
  }

  function anonymizeJson(value: any): any {
    if (value === null || value === undefined) return value;
    const text = JSON.stringify(value);
    const anonymized = anonymizeText(text);
    try {
      return JSON.parse(anonymized!);
    } catch {
      return value;
    }
  }

  // ------------------------------------------------------------------
  // Phase 3: Disable FK constraints and apply all changes
  // ------------------------------------------------------------------
  console.log('\nPhase 3: Applying ID remaps...');

  await sql`SET session_replication_role = replica`.execute(db);

  // Helper: remap a PK column for a table
  async function remapPk(table: string) {
    const map = idMaps[table];
    if (!map || map.size === 0) return;
    let count = 0;
    for (const [oldId, newIdVal] of map) {
      if (oldId === newIdVal) continue; // system ID, skip
      await db
        .updateTable(table)
        .set({ id: newIdVal })
        .where('id', '=', oldId)
        .execute();
      count++;
    }
    console.log(`  ${table}.id: ${count} remapped`);
  }

  // Helper: remap an FK column using a parent table's ID map
  async function remapFk(
    table: string,
    column: string,
    parentTable: string,
    condition?: { column: string; value: string },
  ) {
    const map = idMaps[parentTable];
    if (!map || map.size === 0) return;
    let count = 0;
    for (const [oldId, newIdVal] of map) {
      if (oldId === newIdVal) continue;
      let query = db
        .updateTable(table)
        .set({ [column]: newIdVal })
        .where(column, '=', oldId);
      if (condition) {
        query = query.where(condition.column, '=', condition.value);
      }
      await query.execute();
      count++;
    }
    if (count > 0) {
      console.log(`  ${table}.${column}: ${count} FK refs updated`);
    }
  }

  // --- Remap PKs ---
  // Save programs.published_version_id before NULLing (circular ref with program_versions)
  const publishedVersionMap = new Map<string, string>();
  const programsWithVersions = await db
    .selectFrom('programs')
    .select(['id', 'published_version_id'])
    .where('published_version_id', 'is not', null)
    .execute();
  for (const p of programsWithVersions) {
    publishedVersionMap.set(p.id, p.published_version_id!);
  }

  // NULL it so program_versions PK remap doesn't break the FK
  await db
    .updateTable('programs')
    .set({ published_version_id: null })
    .where('published_version_id', 'is not', null)
    .execute();

  for (const table of remapTables) {
    await remapPk(table);
  }

  // --- Remap FKs ---
  console.log('\n  Updating FK references...');

  // users FKs (client_id / user_id patterns)
  await remapFk('profiles', 'client_id', 'users');
  await remapFk('profile_updates', 'client_id', 'users');
  await remapFk('subscriptions', 'client_id', 'users');
  await remapFk('messages', 'client_id', 'users');
  await remapFk('microcycles', 'client_id', 'users');
  await remapFk('workout_instances', 'client_id', 'users');
  await remapFk('user_onboarding', 'client_id', 'users');
  await remapFk('short_links', 'client_id', 'users');
  await remapFk('referrals', 'referrer_id', 'users');
  await remapFk('referrals', 'referee_id', 'users');
  await remapFk('day_configs', 'scope_id', 'users', {
    column: 'scope_type',
    value: 'user',
  });
  await remapFk('message_queues', 'client_id', 'users');
  await remapFk('admin_activity_logs', 'target_client_id', 'users');
  await remapFk('admin_activity_logs', 'actor_client_id', 'users');
  await remapFk('fitness_plans', 'client_id', 'users');
  await remapFk('program_enrollments', 'client_id', 'users');
  await remapFk('program_owners', 'user_id', 'users');
  await remapFk('user_exercise_metrics', 'client_id', 'users');
  await remapFk('exercise_uses', 'user_id', 'users');
  await remapFk('event_logs', 'user_id', 'users');
  await remapFk('uploaded_images', 'uploaded_by', 'users');

  // messages FKs
  await remapFk('message_queues', 'message_id', 'messages');

  // workout_instances FKs
  await remapFk('user_exercise_metrics', 'workout_id', 'workout_instances');

  // program_owners FKs
  await remapFk('programs', 'owner_id', 'program_owners');
  await remapFk('program_families', 'owner_id', 'program_owners');
  await remapFk('organization_members', 'program_owner_id', 'program_owners');
  await remapFk('blog_posts', 'owner_id', 'program_owners');

  // programs FKs
  await remapFk('program_versions', 'program_id', 'programs');
  await remapFk('program_family_programs', 'program_id', 'programs');
  await remapFk('program_enrollments', 'program_id', 'programs');

  // program_versions FKs
  await remapFk('program_enrollments', 'program_version_id', 'program_versions');

  // Restore programs.published_version_id using saved mapping + ID maps
  console.log('\n  Restoring programs.published_version_id...');
  let restoredCount = 0;
  for (const [oldProgramId, oldVersionId] of publishedVersionMap) {
    const newProgramId = idMaps['programs'].get(oldProgramId);
    const newVersionId = idMaps['program_versions'].get(oldVersionId);
    if (newProgramId && newVersionId) {
      await db
        .updateTable('programs')
        .set({ published_version_id: newVersionId })
        .where('id', '=', newProgramId)
        .execute();
      restoredCount++;
    }
  }
  console.log(`  programs.published_version_id: ${restoredCount} restored`);

  // program_families FKs
  await remapFk('program_family_programs', 'family_id', 'program_families');

  // organizations FKs
  await remapFk('organization_members', 'organization_id', 'organizations');
  await remapFk('programs', 'organization_id', 'organizations');
  await remapFk('blog_posts', 'organization_id', 'organizations');

  // uploaded_images FKs
  await remapFk('programs', 'cover_image_id', 'uploaded_images');
  await remapFk('blog_posts', 'cover_image_id', 'uploaded_images');

  // ------------------------------------------------------------------
  // Phase 4: Scrub PII
  // ------------------------------------------------------------------
  console.log('\nPhase 4: Scrubbing PII...');

  // Users: name, phone, email, stripe_customer_id, referral_code
  for (const user of users) {
    const newUserId = idMaps['users'].get(user.id)!;
    await db
      .updateTable('users')
      .set({
        name: nameMap.get(user.name) ?? faker.person.fullName(),
        phone_number: phoneMap.get(user.phone_number) ?? generateFakePhone(),
        email: `user-${newUserId.slice(0, 8)}@test.gymtext.com`,
        stripe_customer_id: null,
        referral_code: faker.string.alphanumeric(8).toUpperCase(),
      })
      .where('id', '=', newUserId)
      .execute();
  }
  console.log('  users: PII scrubbed');

  // Messages: phone_from, phone_to
  for (const [oldPhone, newPhone] of phoneMap) {
    await db
      .updateTable('messages')
      .set({ phone_from: newPhone })
      .where('phone_from', '=', oldPhone)
      .execute();
    await db
      .updateTable('messages')
      .set({ phone_to: newPhone })
      .where('phone_to', '=', oldPhone)
      .execute();
  }
  console.log('  messages: phones scrubbed');

  // Messages: provider_message_id (Twilio SID)
  await db
    .updateTable('messages')
    .set({ provider_message_id: null })
    .where('provider_message_id', 'is not', null)
    .execute();
  console.log('  messages: provider IDs cleared');

  // Subscriptions: stripe_subscription_id
  await db
    .updateTable('subscriptions')
    .set({ stripe_subscription_id: sql`'sub_test_' || substr(id::text, 1, 8)` })
    .execute();
  console.log('  subscriptions: stripe IDs anonymized');

  // Page visits: IP and user agent
  await db
    .updateTable('page_visits')
    .set({
      ip_address: sql`'10.0.' || (floor(random() * 255))::int::text || '.' || (floor(random() * 255))::int::text`,
      user_agent: null,
    })
    .execute();
  console.log('  page_visits: IPs and user agents scrubbed');

  // Program owners: display_name, phone, bio
  for (const owner of owners) {
    const newOwnerId = idMaps['program_owners'].get(owner.id)!;
    await db
      .updateTable('program_owners')
      .set({
        display_name: nameMap.get(owner.display_name) ?? faker.person.fullName(),
        phone: owner.phone ? (phoneMap.get(owner.phone) ?? generateFakePhone()) : null,
        bio: null,
        stripe_connect_account_id: null,
      })
      .where('id', '=', newOwnerId)
      .execute();
  }
  console.log('  program_owners: PII scrubbed');

  // Short links: randomize codes (ensure uniqueness)
  const shortLinks = await db
    .selectFrom('short_links')
    .select('id')
    .execute();

  const usedCodes = new Set<string>();
  for (const link of shortLinks) {
    let code: string;
    do {
      code = faker.string.alphanumeric(5).toLowerCase();
    } while (usedCodes.has(code));
    usedCodes.add(code);

    await db
      .updateTable('short_links')
      .set({ code })
      .where('id', '=', link.id)
      .execute();
  }
  console.log('  short_links: codes randomized');

  // ------------------------------------------------------------------
  // Phase 5: Anonymize text and JSONB fields
  // ------------------------------------------------------------------
  console.log('\nPhase 5: Anonymizing text content...');

  // Helper: check if a column exists on the current schema
  async function columnExists(table: string, column: string): Promise<boolean> {
    const result = await sql<{ exists: boolean }>`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = ${table} AND column_name = ${column}
      ) as exists
    `.execute(db);
    return result.rows[0]?.exists ?? false;
  }

  // Helper: batch update text columns
  async function anonymizeTextColumn(table: string, column: string) {
    if (!(await columnExists(table, column))) {
      console.log(`  ${table}.${column}: column not found, skipping`);
      return;
    }

    const rows = await sql<{ id: string; val: string }>`
      SELECT id, ${sql.ref(column)} as val
      FROM ${sql.table(table)}
      WHERE ${sql.ref(column)} IS NOT NULL
    `.execute(db);

    let updated = 0;
    for (const row of rows.rows) {
      const anonymized = anonymizeText(row.val);
      if (anonymized !== row.val) {
        await db
          .updateTable(table)
          .set({ [column]: anonymized })
          .where('id', '=', row.id)
          .execute();
        updated++;
      }
    }
    if (updated > 0) {
      console.log(`  ${table}.${column}: ${updated} rows anonymized`);
    }
  }

  // Helper: batch update JSONB columns
  async function anonymizeJsonColumn(table: string, column: string) {
    if (!(await columnExists(table, column))) {
      console.log(`  ${table}.${column}: column not found, skipping`);
      return;
    }

    const rows = await sql<{ id: string; val: any }>`
      SELECT id, ${sql.ref(column)} as val
      FROM ${sql.table(table)}
      WHERE ${sql.ref(column)} IS NOT NULL
    `.execute(db);

    let updated = 0;
    for (const row of rows.rows) {
      const anonymized = anonymizeJson(row.val);
      const oldStr = JSON.stringify(row.val);
      const newStr = JSON.stringify(anonymized);
      if (newStr !== oldStr) {
        await db
          .updateTable(table)
          .set({ [column]: JSON.stringify(anonymized) })
          .where('id', '=', row.id)
          .execute();
        updated++;
      }
    }
    if (updated > 0) {
      console.log(`  ${table}.${column}: ${updated} rows anonymized`);
    }
  }

  // Text columns with potential PII
  // Some columns may not exist on prod (added by branch migrations) - columnExists handles this
  await anonymizeTextColumn('profiles', 'profile');
  await anonymizeTextColumn('messages', 'content');
  await anonymizeTextColumn('fitness_plans', 'content');
  await anonymizeTextColumn('fitness_plans', 'description');
  await anonymizeTextColumn('microcycles', 'content');
  await anonymizeTextColumn('microcycles', 'description');
  await anonymizeTextColumn('microcycles', 'message');
  await anonymizeTextColumn('workout_instances', 'message');

  // JSONB columns with potential PII
  await anonymizeJsonColumn('user_onboarding', 'signup_data');
  await anonymizeJsonColumn('admin_activity_logs', 'payload');
  await anonymizeJsonColumn('profile_updates', 'patch');
  await anonymizeJsonColumn('messages', 'metadata');

  // ------------------------------------------------------------------
  // Re-enable FK constraints
  // ------------------------------------------------------------------
  await sql`SET session_replication_role = DEFAULT`.execute(db);

  console.log('\nAnonymization complete');
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
  console.log(`Local DB: ${DB_NAME}`);

  const startTime = Date.now();

  // Step 1: Drop and recreate database
  await recreateDatabase();

  // Step 2: Dump prod and restore locally
  dumpAndRestore();

  // Step 3-4: Select users, prune, anonymize
  const localPool = new Pool({ connectionString: DATABASE_URL, max: 5 });
  const localDb = new Kysely<any>({
    dialect: new PostgresDialect({ pool: localPool }),
  });

  try {
    await selectAndPruneUsers(localDb, 15);
    await anonymizeLocalDb(localDb);
  } finally {
    await localDb.destroy();
  }

  // Step 5: Run branch migrations (the real test!)
  run('pnpm migrate:latest', `Run ${currentBranch} migrations`);

  // Step 6: Seed system data
  run('pnpm seed --all', 'Seed database');

  // Step 7: Regenerate TypeScript types
  run('pnpm db:codegen', 'Regenerate TypeScript types');

  // Step 8: Build
  run('pnpm build', 'Verify build passes');

  // Cleanup dump file
  if (existsSync(DUMP_PATH)) {
    unlinkSync(DUMP_PATH);
    console.log('\nCleaned up dump file');
  }

  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  console.log(`\nMigration test complete in ${elapsed}m`);
  console.log(`Branch: ${currentBranch}`);
  console.log(`Database: ${DB_NAME}`);
  console.log('\nVerification:');
  console.log('  SELECT name, phone_number, email FROM users LIMIT 5;');
  console.log('  SELECT phone_from, phone_to FROM messages LIMIT 5;');
}

main().catch(error => {
  console.error('Error:', error);
  // Cleanup on failure
  if (existsSync(DUMP_PATH)) {
    unlinkSync(DUMP_PATH);
  }
  exit(1);
});
