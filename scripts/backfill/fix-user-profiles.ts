#!/usr/bin/env tsx
import { sql } from 'kysely';
import { postgresDb } from '@/server/connections/postgres/postgres';
import chalk from 'chalk';

/**
 * Backfill Script: Fix Invalid User Profiles
 *
 * Finds and fixes user profiles that are invalid due to:
 * - Null profile
 * - Empty profile object
 * - Missing goals field
 * - Missing goals.primary field (required by FitnessProfileSchema)
 *
 * Updates invalid profiles with minimal valid structure:
 * {
 *   goals: {
 *     primary: "General fitness improvement",
 *     timeline: 12
 *   }
 * }
 *
 * Usage:
 *   source .env.local && tsx scripts/backfill/fix-user-profiles.ts [--dry-run]
 */

// ============================================================================
// Configuration
// ============================================================================

const isDryRun = process.argv.includes('--dry-run');

const DEFAULT_GOALS = {
  primary: 'General fitness improvement',
  timeline: 12,
};

// ============================================================================
// Helper Functions
// ============================================================================

interface User {
  id: string;
  name: string;
  phoneNumber: string;
  profile: any;
}

interface FixResult {
  userId: string;
  userName: string;
  beforeProfile: any;
  afterProfile: any;
}

interface ErrorResult {
  userId: string;
  userName: string;
  error: string;
}

/**
 * Find all users with invalid profiles
 */
async function findInvalidProfiles(): Promise<User[]> {
  const users = await postgresDb
    .selectFrom('users')
    .select(['id', 'name', 'phoneNumber', 'profile'])
    .where((eb) =>
      eb.or([
        // Profile is null
        eb('profile', 'is', null),
        // Profile is empty object
        sql<boolean>`profile = '{}'::jsonb`,
        // Profile missing goals
        sql<boolean>`profile->'goals' IS NULL`,
        // Profile missing goals.primary
        sql<boolean>`profile->'goals'->>'primary' IS NULL`,
        // Profile goals.primary is empty string
        sql<boolean>`profile->'goals'->>'primary' = ''`,
      ])
    )
    .execute();

  return users as User[];
}

/**
 * Fix a single user's profile
 */
async function fixUserProfile(user: User): Promise<FixResult> {
  const beforeProfile = user.profile || {};

  // Merge default goals into existing profile
  // If profile has goals but missing primary, update just goals
  // Otherwise, add the entire goals object
  const afterProfile = {
    ...beforeProfile,
    goals: {
      ...(beforeProfile.goals || {}),
      ...DEFAULT_GOALS,
    },
  };

  if (!isDryRun) {
    await postgresDb
      .updateTable('users')
      .set({
        profile: JSON.stringify(afterProfile),
        updatedAt: new Date(),
      })
      .where('id', '=', user.id)
      .execute();
  }

  return {
    userId: user.id,
    userName: user.name,
    beforeProfile,
    afterProfile,
  };
}

/**
 * Display profile comparison
 */
function displayProfileChange(result: FixResult, index: number, total: number) {
  const userIdShort = result.userId.substring(0, 8);
  const before = JSON.stringify(result.beforeProfile);
  const after = JSON.stringify(result.afterProfile);

  console.log(
    chalk.blue(`  [${index}/${total}]`) +
      ` User ${chalk.cyan(userIdShort)} (${result.userName}):`
  );
  console.log(chalk.gray(`    Before: ${before}`));
  console.log(chalk.green(`    After:  ${after}`));
  console.log();
}

// ============================================================================
// Main Script
// ============================================================================

async function main() {
  console.log(chalk.bold('='.repeat(60)));
  console.log(chalk.bold('Backfill Script: Fix Invalid User Profiles'));
  console.log(chalk.bold('='.repeat(60)));
  console.log();

  if (isDryRun) {
    console.log(chalk.yellow('⚠️  DRY-RUN MODE: No changes will be made to the database'));
    console.log();
  }

  try {
    // Find invalid profiles
    console.log(chalk.bold('Finding users with invalid profiles...'));
    const invalidUsers = await findInvalidProfiles();
    console.log(
      chalk.blue(`Found ${chalk.bold(invalidUsers.length)} user(s) with invalid profiles\n`)
    );

    if (invalidUsers.length === 0) {
      console.log(chalk.green('✓ No invalid profiles found. All profiles are valid!'));
      return;
    }

    // Fix each profile
    const results: FixResult[] = [];
    const errors: ErrorResult[] = [];

    for (let i = 0; i < invalidUsers.length; i++) {
      const user = invalidUsers[i];
      const index = i + 1;
      const total = invalidUsers.length;

      try {
        const result = await fixUserProfile(user);
        results.push(result);
        displayProfileChange(result, index, total);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const userIdShort = user.id.substring(0, 8);

        console.log(
          chalk.red(`  [${index}/${total}] User ${userIdShort} (${user.name}): ✗ Failed`)
        );
        console.log(chalk.red(`    Error: ${errorMessage}`));
        console.log();

        errors.push({
          userId: user.id,
          userName: user.name,
          error: errorMessage,
        });
      }
    }

    // Summary
    console.log(chalk.bold('='.repeat(60)));
    console.log(chalk.bold('Summary'));
    console.log(chalk.bold('='.repeat(60)));
    console.log(
      chalk.green(`✓ Fixed: ${results.length} profile(s) ${isDryRun ? 'would be' : ''} updated`)
    );
    console.log(chalk.red(`✗ Failed: ${errors.length} profile(s)`));
    console.log();

    if (errors.length > 0) {
      console.log(chalk.bold('Errors:'));
      console.log(chalk.bold('='.repeat(60)));
      errors.forEach((err, idx) => {
        const userIdShort = err.userId.substring(0, 8);
        console.log(chalk.red(`${idx + 1}. User: ${err.userName} (${userIdShort})`));
        console.log(chalk.red(`   Error: ${err.error}`));
        console.log();
      });
    }

    if (isDryRun) {
      console.log(
        chalk.yellow('\n⚠️  Dry-run completed. No changes were made to the database.')
      );
    } else {
      console.log(chalk.green('\n✓ Backfill completed successfully!'));
    }
  } catch (error) {
    console.error(chalk.red('\n❌ Backfill failed:'), error);
    throw error;
  } finally {
    await postgresDb.destroy();
  }
}

// Run the script
main().catch((error) => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});
