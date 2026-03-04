/**
 * Data Regeneration Script for New Agent System
 *
 * Reads existing text data from live tables (profile, content, message fields),
 * runs it through detail-extraction agents, and writes structured `details` back.
 *
 * Entities with non-null details are skipped (idempotent).
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
  .description('Regenerate structured details from text fields for active users')
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

interface ProfileRow {
  id: string;
  clientId: string;
  profile: string | null;
  details: unknown;
}

interface PlanRow {
  id: string;
  clientId: string;
  content: string | null;
  startDate: Date;
  details: unknown;
}

interface MicrocycleRow {
  id: string;
  clientId: string;
  content: string | null;
  startDate: Date;
  details: unknown;
}

interface WorkoutRow {
  id: string;
  clientId: string;
  date: string;
  message: string | null;
  details: unknown;
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
 * Get latest profile for a user (null details = needs regeneration)
 */
async function getProfile(userId: string): Promise<ProfileRow | null> {
  const result = await sql<ProfileRow>`
    SELECT id, client_id, profile, details FROM profiles
    WHERE client_id = ${userId}
    ORDER BY created_at DESC
    LIMIT 1
  `.execute(db);
  return result.rows[0] ?? null;
}

/**
 * Get latest plan for a user
 */
async function getPlan(userId: string): Promise<PlanRow | null> {
  const result = await sql<PlanRow>`
    SELECT id, client_id, content, start_date, details FROM fitness_plans
    WHERE client_id = ${userId}
    ORDER BY created_at DESC
    LIMIT 1
  `.execute(db);
  return result.rows[0] ?? null;
}

/**
 * Get latest microcycle for a user
 */
async function getMicrocycle(userId: string): Promise<MicrocycleRow | null> {
  const result = await sql<MicrocycleRow>`
    SELECT id, client_id, content, start_date, details FROM microcycles
    WHERE client_id = ${userId}
    ORDER BY created_at DESC
    LIMIT 1
  `.execute(db);
  return result.rows[0] ?? null;
}

/**
 * Get all workouts with null details for a user
 */
async function getWorkoutsNeedingDetails(userId: string): Promise<WorkoutRow[]> {
  const result = await sql<WorkoutRow>`
    SELECT id, client_id, date, message, details FROM workout_instances
    WHERE client_id = ${userId} AND details IS NULL AND message IS NOT NULL
    ORDER BY date DESC
  `.execute(db);
  return result.rows;
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
  workouts?: number;
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
  const userParams = { user: { id: user.id, name: user.name, timezone: user.timezone } };

  try {
    const profile = await getProfile(user.id);
    const plan = await getPlan(user.id);
    const microcycle = await getMicrocycle(user.id);
    const workouts = await getWorkoutsNeedingDetails(user.id);

    const needsProfile = profile?.profile && !profile.details;
    const needsPlan = plan?.content && !plan.details;
    const needsWeek = microcycle?.content && !microcycle.details;
    const needsWorkouts = workouts.length > 0;

    if (!needsProfile && !needsPlan && !needsWeek && !needsWorkouts) {
      console.log(`  ${label}: [UP TO DATE] -> Skipped`);
      return { status: 'skipped', userId: user.id, userName: user.name, reason: 'All details already populated' };
    }

    console.log(`  ${label}: [PROCESSING] profile=${!!needsProfile} plan=${!!needsPlan} week=${!!needsWeek} workouts=${workouts.length}`);

    let profileDone = false;
    let planDone = false;
    let weekDone = false;
    let workoutsDone = 0;

    // --- Profile ---
    if (needsProfile && profile) {
      console.log(`  ${label}: Generating profile details...`);
      let profileDetails: Record<string, unknown> | undefined;
      try {
        const detailsResult = await agentRunner.invoke(AGENTS.PROFILE_DETAILS, {
          input: profile.profile!,
          params: userParams,
        });
        profileDetails = JSON.parse(detailsResult.response);
      } catch (err) {
        console.warn(`  ${label}: Warning - failed to extract profile details: ${err}`);
      }

      if (!isDryRun && profileDetails) {
        await sql`
          UPDATE profiles SET details = ${JSON.stringify(profileDetails)}::jsonb
          WHERE id = ${profile.id}::uuid
        `.execute(db);
      }
      profileDone = true;
      console.log(`  ${label}: Profile details ${isDryRun ? 'would be' : ''} saved`);
    }

    // --- Plan ---
    if (needsPlan && plan) {
      console.log(`  ${label}: Generating plan details...`);
      let planDetails: Record<string, unknown> | undefined;
      try {
        const detailsResult = await agentRunner.invoke(AGENTS.PLAN_DETAILS, {
          input: plan.content!,
          params: userParams,
        });
        planDetails = JSON.parse(detailsResult.response);
      } catch (err) {
        console.warn(`  ${label}: Warning - failed to extract plan details: ${err}`);
      }

      if (!isDryRun && planDetails) {
        await sql`
          UPDATE fitness_plans SET details = ${JSON.stringify(planDetails)}::jsonb
          WHERE id = ${plan.id}::uuid
        `.execute(db);
      }
      planDone = true;
      console.log(`  ${label}: Plan details ${isDryRun ? 'would be' : ''} saved`);
    }

    // --- Microcycle (Week) ---
    if (needsWeek && microcycle) {
      console.log(`  ${label}: Generating week details...`);
      let weekDetails: Record<string, unknown> | undefined;
      try {
        const detailsResult = await agentRunner.invoke(AGENTS.WEEK_DETAILS, {
          input: microcycle.content!,
          params: userParams,
        });
        weekDetails = JSON.parse(detailsResult.response);
      } catch (err) {
        console.warn(`  ${label}: Warning - failed to extract week details: ${err}`);
      }

      if (!isDryRun && weekDetails) {
        await sql`
          UPDATE microcycles SET details = ${JSON.stringify(weekDetails)}::jsonb
          WHERE id = ${microcycle.id}::uuid
        `.execute(db);
      }
      weekDone = true;
      console.log(`  ${label}: Week details ${isDryRun ? 'would be' : ''} saved`);
    }

    // --- Workouts ---
    if (needsWorkouts) {
      console.log(`  ${label}: Generating details for ${workouts.length} workout(s)...`);
      for (const workout of workouts) {
        try {
          const detailsResult = await agentRunner.invoke(AGENTS.WORKOUT_DETAILS, {
            input: workout.message!,
            params: userParams,
          });
          const details = JSON.parse(detailsResult.response);

          if (!isDryRun) {
            await sql`
              UPDATE workout_instances SET details = ${JSON.stringify(details)}::jsonb
              WHERE id = ${workout.id}::uuid
            `.execute(db);
          }
          workoutsDone++;
        } catch (err) {
          console.warn(`  ${label}: Warning - failed workout ${workout.id}: ${err}`);
        }
      }
      console.log(`  ${label}: ${workoutsDone}/${workouts.length} workout details ${isDryRun ? 'would be' : ''} saved`);
    }

    console.log(`  ${label}: Done (profile=${profileDone}, plan=${planDone}, week=${weekDone}, workouts=${workoutsDone})`);
    return {
      status: 'success',
      userId: user.id,
      userName: user.name,
      profile: profileDone,
      plan: planDone,
      week: weekDone,
      workouts: workoutsDone,
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
  console.log('Data Regeneration: Populate Details from Text Fields');
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
  console.log('Regeneration Complete!');
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
  console.error('Regeneration failed:', err);
  process.exit(1);
});
