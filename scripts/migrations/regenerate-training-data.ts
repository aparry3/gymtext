import { Command } from 'commander';
import { Kysely, PostgresDialect, CamelCasePlugin } from 'kysely';
import { Pool } from 'pg';
import { DB } from '@/server/models';
import { FitnessPlanService } from '@/server/services/training/fitnessPlanService';
import { progressService } from '@/server/services/training/progressService';
import { userService } from '@/server/services/user/userService';
import { fitnessProfileService } from '@/server/services/user/fitnessProfileService';
import { UserWithProfile } from '@/server/models/user';
import { now, formatForAI } from '@/shared/utils/date';
import { OnboardingRepository, SignupData } from '@/server/repositories/onboardingRepository';
import { formatSignupDataForLLM } from '@/server/services/user/signupDataFormatter';
import { createEmptyProfile } from '@/server/utils/profile/jsonToMarkdown';
// Profile agent imports for inline agent creation
import { createAgent, PROMPT_IDS } from '@/server/agents';
import { buildProfileUpdateUserMessage } from '@/server/services/agents/prompts/profile';
import { ProfileUpdateOutputSchema } from '@/server/services/agents/schemas';

/**
 * Data Migration Script: Full Reset & Regenerate Training Data for All Users
 *
 * Performs a complete reset of all training data for each user:
 * 1. Captures existing profile (for fallback)
 * 2. Generates new profile from signupData (or uses existing profile if no signupData)
 * 3. Deletes all existing data (profiles, fitness plans, microcycles, workout instances)
 * 4. Saves the new profile
 * 5. Generates new fitness plan
 * 6. Creates first microcycle
 *
 * Safety: Profile generation happens BEFORE deletion, so no data is lost on failure.
 *
 * Usage:
 *   pnpm migrate:training                    # All users
 *   pnpm migrate:training -p +15551234567    # Single user by phone
 *   pnpm migrate:training --dry-run          # Dry run (all users)
 *   pnpm migrate:training -p +15551234567 --dry-run  # Dry run (single user)
 */

// ============================================================================
// CLI Configuration
// ============================================================================

interface MigrationOptions {
  phone?: string;
  dryRun?: boolean;
}

const program = new Command();
program
  .name('regenerate-training-data')
  .description('Full reset & regenerate training data for users')
  .option('-p, --phone <phone>', 'Target a single user by phone number')
  .option('--dry-run', 'Run without making database changes')
  .parse(process.argv);

const opts = program.opts<MigrationOptions>();
const isDryRun = opts.dryRun ?? false;
const targetPhone = opts.phone;

// ============================================================================
// Configuration & Setup
// ============================================================================

const CONCURRENCY_LIMIT = 10; // Process 10 users in parallel at a time

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
const fitnessPlanService = FitnessPlanService.getInstance();
const onboardingRepository = new OnboardingRepository();

// ============================================================================
// Data Deletion
// ============================================================================

/**
 * Delete counts for a single user
 */
interface DeleteCounts {
  workouts: number;
  microcycles: number;
  fitnessPlans: number;
  profiles: number;
}

/**
 * Delete all training data for a user (workouts, microcycles, plans, profiles)
 * Deletes in correct order: child → parent
 */
async function deleteUserData(userId: string): Promise<DeleteCounts> {
  const counts: DeleteCounts = {
    workouts: 0,
    microcycles: 0,
    fitnessPlans: 0,
    profiles: 0,
  };

  // 1. Delete workout instances
  const workoutsResult = await db
    .deleteFrom('workoutInstances')
    .where('clientId', '=', userId)
    .executeTakeFirst();
  counts.workouts = Number(workoutsResult.numDeletedRows);

  // 2. Delete microcycles
  const microcyclesResult = await db
    .deleteFrom('microcycles')
    .where('clientId', '=', userId)
    .executeTakeFirst();
  counts.microcycles = Number(microcyclesResult.numDeletedRows);

  // 3. Delete fitness plans
  const plansResult = await db
    .deleteFrom('fitnessPlans')
    .where('clientId', '=', userId)
    .executeTakeFirst();
  counts.fitnessPlans = Number(plansResult.numDeletedRows);

  // 4. Delete profiles
  const profilesResult = await db
    .deleteFrom('profiles')
    .where('clientId', '=', userId)
    .executeTakeFirst();
  counts.profiles = Number(profilesResult.numDeletedRows);

  return counts;
}

// ============================================================================
// Profile Generation
// ============================================================================

/**
 * Generate profile from signup data without saving
 * Returns the profile text for safe generation before deletion
 */
async function generateProfileFromSignupData(
  user: UserWithProfile,
  signupData: SignupData
): Promise<string> {
  // Format signup data for agent processing
  const formattedData = formatSignupDataForLLM(signupData);

  // Build message from signup data
  const messageParts: string[] = [];

  if (formattedData.fitnessGoals?.trim()) {
    messageParts.push(`***Goals***:\n${formattedData.fitnessGoals.trim()}`);
  }

  if (formattedData.currentExercise?.trim()) {
    messageParts.push(`***Current Activity***:\n${formattedData.currentExercise.trim()}`);
  }

  if (formattedData.environment?.trim()) {
    messageParts.push(`***Training Environment***:\n${formattedData.environment.trim()}`);
  }

  if (formattedData.injuries?.trim()) {
    messageParts.push(`***Injuries or Limitations***:\n${formattedData.injuries.trim()}`);
  }

  const message = messageParts.join('\n\n');

  // Start with empty profile
  const currentProfile = createEmptyProfile(user);

  // Use Profile Update Agent to build profile from signup data
  const currentDate = formatForAI(new Date(), user.timezone);
  const userPrompt = buildProfileUpdateUserMessage(currentProfile, message, user, currentDate);

  const agent = await createAgent({
    name: PROMPT_IDS.PROFILE_FITNESS,
    schema: ProfileUpdateOutputSchema,
  });

  const result = await agent.invoke(userPrompt);

  return result.response.updatedProfile;
}

// ============================================================================
// Migration Logic
// ============================================================================

/**
 * Result of processing a single user
 */
interface UserProcessingResult {
  status: 'success' | 'skipped' | 'failed';
  userId: string;
  userName: string;
  profileSource?: 'signupData' | 'existingProfile';
  deleteCounts?: DeleteCounts;
  planId?: string;
  microcycleId?: string;
  error?: string;
  reason?: string; // For skipped users
}

/**
 * Process a single user - full reset: delete all data, regenerate profile + plan + microcycle
 */
async function processSingleUser(
  userRow: any,
  index: number,
  total: number
): Promise<UserProcessingResult> {
  const userId = userRow.id.substring(0, 8);
  const userName = userRow.name;

  try {
    // 1. Fetch user with profile (capture BEFORE any changes)
    const user = await userService.getUser(userRow.id);

    if (!user) {
      console.log(`  [${index}/${total}] User ${userId} (${userName}): [NOT FOUND] → Skipped`);
      return {
        status: 'skipped',
        userId: userRow.id,
        userName,
        reason: 'User not found'
      };
    }

    const existingProfile = user.profile; // Save for fallback

    // 2. Get signupData from onboarding table
    const signupData = await onboardingRepository.getSignupData(user.id);

    // Must have either signupData OR existing profile
    if (!signupData && !existingProfile) {
      console.log(`  [${index}/${total}] User ${userId} (${user.name}): [NO DATA] → Skipped`);
      return {
        status: 'skipped',
        userId: userRow.id,
        userName: user.name,
        reason: 'No signup data or profile available'
      };
    }

    const profileSource = signupData ? 'signupData' : 'existingProfile';
    console.log(`  [${index}/${total}] User ${userId} (${user.name}): [PROCESSING] (source: ${profileSource})...`);

    if (!isDryRun) {
      // 3. Generate new profile FIRST (before any deletion)
      let newProfile: string;
      if (signupData) {
        console.log(`  [${index}/${total}] User ${userId} (${user.name}): [GENERATING PROFILE]...`);
        newProfile = await generateProfileFromSignupData(user, signupData);
      } else {
        // Fallback: Use existing profile as-is
        newProfile = existingProfile!;
        console.log(`  [${index}/${total}] User ${userId} (${user.name}): [USING EXISTING PROFILE]`);
      }

      // 4. Only delete AFTER successful profile generation
      console.log(`  [${index}/${total}] User ${userId} (${user.name}): [DELETING OLD DATA]...`);
      const deleteCounts = await deleteUserData(user.id);

      // 5. Save the new profile
      await fitnessProfileService.saveProfile(user.id, newProfile);
      console.log(`  [${index}/${total}] User ${userId} (${user.name}): ✓ Profile saved`);

      // 6. Re-fetch user with new profile
      const updatedUser = await userService.getUser(user.id);
      if (!updatedUser) {
        throw new Error('Failed to re-fetch user after profile save');
      }

      // 7. Generate fitness plan
      const newPlan = await fitnessPlanService.createFitnessPlan(updatedUser);
      const planId = newPlan.id ? newPlan.id.substring(0, 8) : 'unknown';
      console.log(`  [${index}/${total}] User ${userId} (${user.name}): ✓ Plan created (${planId})`);

      // 8. Create first microcycle
      const currentDate = now(user.timezone).toJSDate();
      const { microcycle } = await progressService.getOrCreateMicrocycleForDate(
        user.id,
        newPlan,
        currentDate,
        user.timezone
      );
      const microcycleId = microcycle?.id?.substring(0, 8) ?? 'unknown';
      console.log(`  [${index}/${total}] User ${userId} (${user.name}): ✓ Microcycle created (${microcycleId})`);

      return {
        status: 'success',
        userId: userRow.id,
        userName: user.name,
        profileSource,
        deleteCounts,
        planId,
        microcycleId
      };
    } else {
      console.log(`  [${index}/${total}] User ${userId} (${user.name}): ✓ Would delete + regenerate all (dry-run)`);
      return {
        status: 'success',
        userId: userRow.id,
        userName: user.name,
        profileSource
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
 * Full reset and regenerate training data for all users (with parallel processing)
 */
async function regenerateTrainingData() {
  console.log('\nFull Reset: Regenerating Profiles + Plans + Microcycles...');

  // Build query - filter by phone if provided
  let query = db.selectFrom('users').selectAll();
  if (targetPhone) {
    query = query.where('phoneNumber', '=', targetPhone);
  }
  const allUsersRows = await query.execute();

  // Validate phone target
  if (targetPhone && allUsersRows.length === 0) {
    console.error(`\n❌ No user found with phone number: ${targetPhone}`);
    process.exit(1);
  }

  if (targetPhone) {
    console.log(`Targeting user with phone: ${targetPhone}`);
  }
  console.log(`Found ${allUsersRows.length} user(s) to process`);
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
  console.log('Data Migration: Full Reset & Regenerate Training Data');
  console.log('='.repeat(60));

  if (targetPhone) {
    console.log(`📱 Target: ${targetPhone}`);
  } else {
    console.log('📱 Target: All users');
  }

  if (isDryRun) {
    console.log('⚠️  DRY-RUN MODE: No changes will be made to the database\n');
  } else {
    console.log('⚠️  WARNING: This will DELETE and REGENERATE profiles, plans, and microcycles!\n');
  }

  try {
    // Run migration
    const result = await regenerateTrainingData();

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('Migration Complete!');
    console.log('='.repeat(60));
    console.log(`✓ Success: ${result.successCount} user(s) ${isDryRun ? 'would have' : ''} full reset completed`);
    console.log(`⊘ Skipped: ${result.skippedCount} user(s) (no signup data or profile)`);
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
