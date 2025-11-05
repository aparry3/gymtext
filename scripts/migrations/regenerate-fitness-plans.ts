import { Kysely, PostgresDialect } from 'kysely';
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

// Database connection
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({ connectionString: databaseUrl, max: 10 });
const db = new Kysely<DB>({ dialect: new PostgresDialect({ pool }) });

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
 * Regenerate fitness plans for all users
 */
async function regenerateFitnessPlans() {
  console.log('\nRegenerating Fitness Plans...');

  // Get all users from database
  const allUsersRows = await db
    .selectFrom('users')
    .selectAll()
    .execute();

  console.log(`Found ${allUsersRows.length} total user(s)\n`);

  let successCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  const errors: Array<{ userId: string; userName: string; error: string }> = [];

  for (let i = 0; i < allUsersRows.length; i++) {
    const userRow = allUsersRows[i];
    const userId = userRow.id.substring(0, 8);
    const index = i + 1;
    const total = allUsersRows.length;

    try {
      // Fetch user with profile
      const user = await userRepository.findById(userRow.id);

      if (!user) {
        console.log(`  [${index}/${total}] User ${userId} (${userRow.name}): [NOT FOUND] → Skipped`);
        skippedCount++;
        continue;
      }

      // Check if user has a valid fitness profile
      if (!hasValidProfile(user)) {
        console.log(`  [${index}/${total}] User ${userId} (${user.name}): [NO PROFILE] → Skipped`);
        skippedCount++;
        continue;
      }

      console.log(`  [${index}/${total}] User ${userId} (${user.name}): [GENERATING PLAN]...`);

      if (!isDryRun) {
        // Generate new fitness plan
        const newPlan = await fitnessPlanService.createFitnessPlan(user);
        const planId = newPlan.id ? newPlan.id.substring(0, 8) : 'unknown';
        console.log(`  [${index}/${total}] User ${userId} (${user.name}): ✓ Plan created (${planId})`);
      } else {
        console.log(`  [${index}/${total}] User ${userId} (${user.name}): ✓ Would create plan (dry-run)`);
      }

      successCount++;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`  [${index}/${total}] User ${userId} (${userRow.name}): ✗ Failed - ${errorMessage}`);

      errors.push({
        userId: userRow.id,
        userName: userRow.name,
        error: errorMessage
      });

      failedCount++;
    }
  }

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
