import { Kysely, PostgresDialect, CamelCasePlugin } from 'kysely';
import { Pool } from 'pg';
import { DB } from '@/server/models';
import { UserRepository } from '@/server/repositories/userRepository';
import { FitnessPlanService } from '@/server/services/training/fitnessPlanService';
import { UserWithProfile } from '@/server/models/userModel';

/**
 * Data Migration Script: Regenerate Fitness Plans for All Users
 *
 * Generates new fitness plans for all users with fitness profiles using the
 * updated fitness plan generator.
 *
 * Usage:
 *   source .env.local && tsx scripts/migrations/regenerate-fitness-plans.ts [--dry-run]
 */

// ============================================================================
// Configuration & Setup
// ============================================================================

const isDryRun = process.argv.includes('--dry-run');
const CONCURRENCY_LIMIT = 5; // Process 5 users in parallel at a time

// Database connection
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({ connectionString: databaseUrl, max: 10 });
const db = new Kysely<DB>({
  dialect: new PostgresDialect({ pool }),
  plugins: [new CamelCasePlugin()]
});

// Initialize services
const userRepository = new UserRepository(db);
const fitnessPlanService = FitnessPlanService.getInstance();

// ============================================================================
// Migration Logic
// ============================================================================

/**
 * Check if a user has a valid fitness profile
 */
function hasValidProfile(user: UserWithProfile): boolean {
  if (!user.profile) {
    return false;
  }

  // Check if profile has essential data (goals field is required)
  const profile = user.profile;
  return !!(profile.goals?.primary);
}

/**
 * Result of processing a single user
 */
interface UserProcessingResult {
  status: 'success' | 'skipped' | 'failed';
  userId: string;
  userName: string;
  planId?: string;
  error?: string;
  reason?: string; // For skipped users
}

/**
 * Process a single user - extract fitness plan generation
 */
async function processSingleUser(
  userRow: any,
  index: number,
  total: number
): Promise<UserProcessingResult> {
  const userId = userRow.id.substring(0, 8);
  const userName = userRow.name;

  try {
    // Fetch user with profile
    const user = await userRepository.findById(userRow.id);

    if (!user) {
      console.log(`  [${index}/${total}] User ${userId} (${userName}): [NOT FOUND] → Skipped`);
      return {
        status: 'skipped',
        userId: userRow.id,
        userName,
        reason: 'User not found'
      };
    }

    // Check if user has a valid fitness profile
    if (!hasValidProfile(user)) {
      console.log(`  [${index}/${total}] User ${userId} (${user.name}): [NO PROFILE] → Skipped`);
      return {
        status: 'skipped',
        userId: userRow.id,
        userName: user.name,
        reason: 'No valid fitness profile'
      };
    }

    console.log(`  [${index}/${total}] User ${userId} (${user.name}): [GENERATING PLAN]...`);

    if (!isDryRun) {
      // Generate new fitness plan
      const newPlan = await fitnessPlanService.createFitnessPlan(user);
      const planId = newPlan.id ? newPlan.id.substring(0, 8) : 'unknown';
      console.log(`  [${index}/${total}] User ${userId} (${user.name}): ✓ Plan created (${planId})`);

      return {
        status: 'success',
        userId: userRow.id,
        userName: user.name,
        planId
      };
    } else {
      console.log(`  [${index}/${total}] User ${userId} (${user.name}): ✓ Would create plan (dry-run)`);
      return {
        status: 'success',
        userId: userRow.id,
        userName: user.name
      };
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(`  [${index}/${total}] User ${userId} (${userName}): ✗ Failed - ${errorMessage}`);

    return {
      status: 'failed',
      userId: userRow.id,
      userName,
      error: errorMessage
    };
  }
}

/**
 * Process users in batches with controlled concurrency
 */
async function processBatch(users: any[], startIndex: number): Promise<UserProcessingResult[]> {
  const batch = users.slice(startIndex, startIndex + CONCURRENCY_LIMIT);
  const total = users.length;

  const results = await Promise.allSettled(
    batch.map((userRow, batchIndex) =>
      processSingleUser(userRow, startIndex + batchIndex + 1, total)
    )
  );

  return results.map((result, idx) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      // Promise was rejected (shouldn't happen since processSingleUser catches all errors)
      const userRow = batch[idx];
      return {
        status: 'failed' as const,
        userId: userRow.id,
        userName: userRow.name,
        error: result.reason?.message || String(result.reason)
      };
    }
  });
}

/**
 * Regenerate fitness plans for all users (with parallel processing)
 */
async function regenerateFitnessPlans() {
  console.log('\nRegenerating Fitness Plans...');

  // Get all users from database
  const allUsersRows = await db
    .selectFrom('users')
    .selectAll()
    .execute();

  console.log(`Found ${allUsersRows.length} total user(s)`);
  console.log(`Processing in batches of ${CONCURRENCY_LIMIT} users at a time\n`);

  // Process users in batches
  const allResults: UserProcessingResult[] = [];
  const numBatches = Math.ceil(allUsersRows.length / CONCURRENCY_LIMIT);

  for (let batchNum = 0; batchNum < numBatches; batchNum++) {
    const startIndex = batchNum * CONCURRENCY_LIMIT;
    const batchResults = await processBatch(allUsersRows, startIndex);
    allResults.push(...batchResults);

    console.log(`\nCompleted batch ${batchNum + 1}/${numBatches}\n`);
  }

  // Aggregate results
  let successCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  const errors: Array<{ userId: string; userName: string; error: string }> = [];

  allResults.forEach(result => {
    if (result.status === 'success') {
      successCount++;
    } else if (result.status === 'skipped') {
      skippedCount++;
    } else if (result.status === 'failed') {
      failedCount++;
      if (result.error) {
        errors.push({
          userId: result.userId,
          userName: result.userName,
          error: result.error
        });
      }
    }
  });

  return { successCount, skippedCount, failedCount, errors };
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  console.log('='.repeat(60));
  console.log('Data Migration: Regenerate Fitness Plans for All Users');
  console.log('='.repeat(60));

  if (isDryRun) {
    console.log('⚠️  DRY-RUN MODE: No changes will be made to the database\n');
  }

  try {
    // Run migration
    const result = await regenerateFitnessPlans();

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('Migration Complete!');
    console.log('='.repeat(60));
    console.log(`✓ Success: ${result.successCount} plan(s) ${isDryRun ? 'would be' : ''} created`);
    console.log(`⊘ Skipped: ${result.skippedCount} user(s) (no profile or invalid)`);
    console.log(`✗ Failed: ${result.failedCount} user(s)`);

    if (result.errors.length > 0) {
      console.log('\nErrors:');
      console.log('='.repeat(60));
      result.errors.forEach((err, idx) => {
        console.log(`${idx + 1}. User: ${err.userName} (${err.userId.substring(0, 8)})`);
        console.log(`   Error: ${err.error}\n`);
      });
    }

    if (isDryRun) {
      console.log('\n⚠️  Dry-run completed. No changes were made to the database.');
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    await db.destroy();
  }
}

// Run migration
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
