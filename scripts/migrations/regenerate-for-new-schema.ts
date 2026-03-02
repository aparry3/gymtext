/**
 * Data Regeneration Script for New Agent System
 *
 * Reads old-format data from _deprecated_* archive tables, converts dossiers
 * to new format via migration agents, extracts structured details via detail agents,
 * and writes the results to the new-schema live tables.
 *
 * Workouts are skipped — they generate on-demand in the new system.
 *
 * Usage:
 *   pnpm migrate:regenerate                         # All active users
 *   pnpm migrate:regenerate --phone +15551234567    # Single user
 *   pnpm migrate:regenerate --list                  # List users that would be processed
 *   pnpm migrate:regenerate --dry-run               # Read & convert but don't write
 */

import 'dotenv/config';
import { Command } from 'commander';
import { Kysely, PostgresDialect, CamelCasePlugin, sql } from 'kysely';
import { Pool } from 'pg';
import type { DB } from '../../packages/shared/src/server/models/_types';
import { createServicesFromDb } from '../../packages/shared/src/server/services/factory';
import { AGENTS } from '../../packages/shared/src/server/agents/constants';

// ============================================================================
// CLI Configuration
// ============================================================================

interface MigrationOptions {
  phone?: string;
  dryRun?: boolean;
  list?: boolean;
}

const program = new Command();
program
  .name('regenerate-for-new-schema')
  .description('Convert old-format dossiers to new format for active users')
  .option('-p, --phone <phone>', 'Target a single user by phone number')
  .option('--dry-run', 'Read and convert but do not write to database')
  .option('--list', 'List users that would be processed, then exit')
  .parse(process.argv);

const opts = program.opts<MigrationOptions>();
const isDryRun = opts.dryRun ?? false;
const targetPhone = opts.phone;
const listOnly = opts.list ?? false;

// ============================================================================
// Configuration & Setup
// ============================================================================

const CONCURRENCY_LIMIT = 5;

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({ connectionString: databaseUrl, max: 10 });
const db = new Kysely<DB>({
  dialect: new PostgresDialect({ pool }),
  plugins: [new CamelCasePlugin()],
});

const services = createServicesFromDb(db);
const { agentRunner } = services;

// ============================================================================
// Helpers
// ============================================================================

interface UserRow {
  id: string;
  name: string;
  phoneNumber: string;
  timezone: string;
}

interface DeprecatedProfile {
  id: string;
  client_id: string;
  profile: string;
  structured: unknown;
  created_at: Date;
}

interface DeprecatedPlan {
  id: string;
  client_id: string;
  description: string | null;
  start_date: Date;
  structured: unknown;
  created_at: Date;
}

interface DeprecatedMicrocycle {
  id: string;
  client_id: string;
  description: string | null;
  start_date: Date;
  structured: unknown;
  created_at: Date;
}

/**
 * Check if archive tables exist
 */
async function archiveTablesExist(): Promise<boolean> {
  const result = await sql<{ exists: boolean }>`
    SELECT EXISTS (
      SELECT FROM information_schema.tables WHERE table_name = '_deprecated_profiles'
    ) as exists
  `.execute(db);
  return result.rows[0]?.exists ?? false;
}

/**
 * Get active users — those with conversations (not just signups)
 */
async function getActiveUsers(): Promise<UserRow[]> {
  let query = sql<UserRow>`
    SELECT DISTINCT u.id, u.name, u.phone_number, u.timezone
    FROM users u
    INNER JOIN conversations c ON c.client_id = u.id
    WHERE u.deleted_at IS NULL
  `;

  if (targetPhone) {
    query = sql<UserRow>`
      SELECT DISTINCT u.id, u.name, u.phone_number, u.timezone
      FROM users u
      INNER JOIN conversations c ON c.client_id = u.id
      WHERE u.deleted_at IS NULL AND u.phone_number = ${targetPhone}
    `;
  }

  const result = await query.execute(db);
  return result.rows;
}

/**
 * Get latest deprecated profile for a user
 */
async function getDeprecatedProfile(userId: string): Promise<DeprecatedProfile | null> {
  const result = await sql<DeprecatedProfile>`
    SELECT * FROM _deprecated_profiles
    WHERE client_id = ${userId}
    ORDER BY created_at DESC
    LIMIT 1
  `.execute(db);
  return result.rows[0] ?? null;
}

/**
 * Get latest deprecated plan for a user
 */
async function getDeprecatedPlan(userId: string): Promise<DeprecatedPlan | null> {
  const result = await sql<DeprecatedPlan>`
    SELECT * FROM _deprecated_fitness_plans
    WHERE client_id = ${userId}
    ORDER BY created_at DESC
    LIMIT 1
  `.execute(db);
  return result.rows[0] ?? null;
}

/**
 * Get latest deprecated microcycle for a user
 */
async function getDeprecatedMicrocycle(userId: string): Promise<DeprecatedMicrocycle | null> {
  const result = await sql<DeprecatedMicrocycle>`
    SELECT * FROM _deprecated_microcycles
    WHERE client_id = ${userId}
    ORDER BY created_at DESC
    LIMIT 1
  `.execute(db);
  return result.rows[0] ?? null;
}

/**
 * Check if user already has new-format data (idempotency check)
 */
async function userHasNewData(userId: string): Promise<boolean> {
  const result = await sql<{ count: string }>`
    SELECT COUNT(*) as count FROM profiles WHERE client_id = ${userId}
  `.execute(db);
  return parseInt(result.rows[0]?.count ?? '0', 10) > 0;
}

// ============================================================================
// Processing
// ============================================================================

interface ProcessingResult {
  status: 'success' | 'skipped' | 'failed';
  userId: string;
  userName: string;
  profile?: boolean;
  plan?: boolean;
  week?: boolean;
  error?: string;
  reason?: string;
}

async function processUser(
  user: UserRow,
  index: number,
  total: number,
): Promise<ProcessingResult> {
  const shortId = user.id.substring(0, 8);
  const label = `[${index}/${total}] ${shortId} (${user.name})`;

  try {
    // Idempotency check
    if (await userHasNewData(user.id)) {
      console.log(`  ${label}: [ALREADY MIGRATED] -> Skipped`);
      return { status: 'skipped', userId: user.id, userName: user.name, reason: 'Already has new-format data' };
    }

    const oldProfile = await getDeprecatedProfile(user.id);
    const oldPlan = await getDeprecatedPlan(user.id);
    const oldMicrocycle = await getDeprecatedMicrocycle(user.id);

    if (!oldProfile && !oldPlan && !oldMicrocycle) {
      console.log(`  ${label}: [NO OLD DATA] -> Skipped`);
      return { status: 'skipped', userId: user.id, userName: user.name, reason: 'No deprecated data found' };
    }

    console.log(`  ${label}: [PROCESSING] profile=${!!oldProfile} plan=${!!oldPlan} week=${!!oldMicrocycle}`);

    let profileDone = false;
    let planDone = false;
    let planId: string | undefined;
    let weekDone = false;

    // --- Profile ---
    if (oldProfile?.profile) {
      console.log(`  ${label}: Converting profile...`);
      const convertResult = await agentRunner.invoke(AGENTS.MIGRATE_PROFILE, {
        input: oldProfile.profile,
        params: { user: { id: user.id, name: user.name, timezone: user.timezone } },
      });
      const newProfileText = convertResult.response;

      // Extract structured details
      let profileDetails: Record<string, unknown> | undefined;
      try {
        const detailsResult = await agentRunner.invoke(AGENTS.PROFILE_DETAILS, {
          input: newProfileText,
          params: { user: { id: user.id, name: user.name, timezone: user.timezone } },
        });
        profileDetails = JSON.parse(detailsResult.response);
      } catch (err) {
        console.warn(`  ${label}: Warning - failed to extract profile details: ${err}`);
      }

      if (!isDryRun) {
        await sql`
          INSERT INTO profiles (id, client_id, profile, details, created_at)
          VALUES (gen_random_uuid(), ${user.id}, ${newProfileText}, ${profileDetails ? JSON.stringify(profileDetails) : null}::jsonb, NOW())
        `.execute(db);
      }
      profileDone = true;
      console.log(`  ${label}: Profile ${isDryRun ? 'would be' : ''} saved`);
    }

    // --- Plan ---
    if (oldPlan?.description) {
      console.log(`  ${label}: Converting plan...`);
      const convertResult = await agentRunner.invoke(AGENTS.MIGRATE_PLAN, {
        input: oldPlan.description,
        params: { user: { id: user.id, name: user.name, timezone: user.timezone } },
      });
      const newPlanText = convertResult.response;

      // Extract structured details
      let planDetails: Record<string, unknown> | undefined;
      try {
        const detailsResult = await agentRunner.invoke(AGENTS.PLAN_DETAILS, {
          input: newPlanText,
          params: { user: { id: user.id, name: user.name, timezone: user.timezone } },
        });
        planDetails = JSON.parse(detailsResult.response);
      } catch (err) {
        console.warn(`  ${label}: Warning - failed to extract plan details: ${err}`);
      }

      if (!isDryRun) {
        const planResult = await sql<{ id: string }>`
          INSERT INTO fitness_plans (id, client_id, legacy_client_id, content, description, start_date, details, created_at)
          VALUES (gen_random_uuid(), ${user.id}, ${user.id}, ${newPlanText}, ${newPlanText}, ${oldPlan.start_date.toISOString()}::date, ${planDetails ? JSON.stringify(planDetails) : null}::jsonb, NOW())
          RETURNING id
        `.execute(db);
        planId = planResult.rows[0]?.id;
      }
      planDone = true;
      console.log(`  ${label}: Plan ${isDryRun ? 'would be' : ''} saved`);
    }

    // --- Microcycle ---
    if (oldMicrocycle?.description) {
      console.log(`  ${label}: Converting week...`);
      const convertResult = await agentRunner.invoke(AGENTS.MIGRATE_WEEK, {
        input: oldMicrocycle.description,
        params: { user: { id: user.id, name: user.name, timezone: user.timezone } },
      });
      const newWeekText = convertResult.response;

      // Extract structured details
      let weekDetails: Record<string, unknown> | undefined;
      try {
        const detailsResult = await agentRunner.invoke(AGENTS.WEEK_DETAILS, {
          input: newWeekText,
          params: { user: { id: user.id, name: user.name, timezone: user.timezone } },
        });
        weekDetails = JSON.parse(detailsResult.response);
      } catch (err) {
        console.warn(`  ${label}: Warning - failed to extract week details: ${err}`);
      }

      // Generate formatted message
      let weekMessage: string | undefined;
      try {
        const formatResult = await agentRunner.invoke(AGENTS.WEEK_FORMAT, {
          input: newWeekText,
          params: { user: { id: user.id, name: user.name, timezone: user.timezone } },
        });
        weekMessage = formatResult.response;
      } catch (err) {
        console.warn(`  ${label}: Warning - failed to format week message: ${err}`);
      }

      if (!isDryRun) {
        const refPlanId = planId ?? null;
        await sql`
          INSERT INTO microcycles (id, client_id, plan_id, content, start_date, details, message, created_at)
          VALUES (gen_random_uuid(), ${user.id}, ${refPlanId}::uuid, ${newWeekText}, ${oldMicrocycle.start_date.toISOString()}::timestamp, ${weekDetails ? JSON.stringify(weekDetails) : null}::jsonb, ${weekMessage ?? null}, NOW())
        `.execute(db);
      }
      weekDone = true;
      console.log(`  ${label}: Week ${isDryRun ? 'would be' : ''} saved`);
    }

    console.log(`  ${label}: Done (profile=${profileDone}, plan=${planDone}, week=${weekDone})`);
    return {
      status: 'success',
      userId: user.id,
      userName: user.name,
      profile: profileDone,
      plan: planDone,
      week: weekDone,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`  ${label}: FAILED - ${errorMessage}`);
    return { status: 'failed', userId: user.id, userName: user.name, error: errorMessage };
  }
}

/**
 * Process users in batches with controlled concurrency
 */
async function processBatch(users: UserRow[], startIndex: number): Promise<ProcessingResult[]> {
  const batch = users.slice(startIndex, startIndex + CONCURRENCY_LIMIT);
  const total = users.length;

  const results = await Promise.allSettled(
    batch.map((user, batchIndex) => processUser(user, startIndex + batchIndex + 1, total)),
  );

  return results.map((result, idx) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    const user = batch[idx];
    return {
      status: 'failed' as const,
      userId: user.id,
      userName: user.name,
      error: result.reason?.message || String(result.reason),
    };
  });
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log('='.repeat(60));
  console.log('Data Migration: Convert Dossiers to New Schema Format');
  console.log('='.repeat(60));

  if (targetPhone) {
    console.log(`Target: ${targetPhone}`);
  } else {
    console.log('Target: All active users');
  }

  if (isDryRun) {
    console.log('MODE: DRY-RUN (no database writes)\n');
  } else if (listOnly) {
    console.log('MODE: LIST ONLY\n');
  } else {
    console.log('MODE: LIVE (will write to database)\n');
  }

  // Verify archive tables exist
  if (!(await archiveTablesExist())) {
    console.error('ERROR: _deprecated_* archive tables not found.');
    console.error('Run the archive migration first: pnpm migrate:latest');
    process.exit(1);
  }

  // Get active users
  const users = await getActiveUsers();

  if (targetPhone && users.length === 0) {
    console.error(`ERROR: No active user found with phone number: ${targetPhone}`);
    process.exit(1);
  }

  console.log(`Found ${users.length} active user(s) to process\n`);

  // List mode — show users and exit
  if (listOnly) {
    users.forEach((u, i) => {
      console.log(`  ${i + 1}. ${u.name} (${u.phoneNumber}) [${u.id.substring(0, 8)}]`);
    });
    console.log(`\nTotal: ${users.length} users`);
    await db.destroy();
    return;
  }

  console.log(`Processing in batches of ${CONCURRENCY_LIMIT}\n`);

  // Process in batches
  const allResults: ProcessingResult[] = [];
  const numBatches = Math.ceil(users.length / CONCURRENCY_LIMIT);

  for (let batchNum = 0; batchNum < numBatches; batchNum++) {
    const startIndex = batchNum * CONCURRENCY_LIMIT;
    const batchResults = await processBatch(users, startIndex);
    allResults.push(...batchResults);
    console.log(`\nBatch ${batchNum + 1}/${numBatches} complete\n`);
  }

  // Summary
  const successCount = allResults.filter((r) => r.status === 'success').length;
  const skippedCount = allResults.filter((r) => r.status === 'skipped').length;
  const failedCount = allResults.filter((r) => r.status === 'failed').length;
  const errors = allResults.filter((r) => r.status === 'failed' && r.error);

  console.log('\n' + '='.repeat(60));
  console.log('Migration Complete!');
  console.log('='.repeat(60));
  console.log(`  Success: ${successCount}`);
  console.log(`  Skipped: ${skippedCount}`);
  console.log(`  Failed:  ${failedCount}`);

  if (errors.length > 0) {
    console.log('\nErrors:');
    errors.forEach((err, idx) => {
      console.log(`  ${idx + 1}. ${err.userName} (${err.userId.substring(0, 8)}): ${err.error}`);
    });
  }

  if (isDryRun) {
    console.log('\nDry-run completed. No changes were made.');
  }

  await db.destroy();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
