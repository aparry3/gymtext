#!/usr/bin/env tsx
/**
 * Backfill Script: Migrate JSON Profiles to Markdown
 *
 * This script migrates all existing user profiles from the JSON format (users.profile)
 * to the new Markdown "Living Dossier" format (profiles table).
 *
 * Process:
 * 1. Find all users with JSON profiles
 * 2. Check if they already have Markdown profiles
 * 3. Convert JSON → Markdown
 * 4. Insert into profiles table
 *
 * Usage:
 *   source .env.local && tsx scripts/backfill/migrate-profiles-to-markdown.ts [--dry-run]
 */

import { postgresDb } from '@/server/connections/postgres/postgres';
import { UserRepository } from '@/server/repositories/userRepository';
import { ProfileRepository } from '@/server/repositories/profileRepository';
import { convertJsonProfileToMarkdown } from '@/server/utils/profile/jsonToMarkdown';
import chalk from 'chalk';

// ============================================================================
// Configuration
// ============================================================================

const isDryRun = process.argv.includes('--dry-run');

// ============================================================================
// Main Migration Logic
// ============================================================================

interface MigrationStats {
  total: number;
  alreadyMigrated: number;
  noJsonProfile: number;
  migrated: number;
  failed: number;
}

async function migrateProfiles(): Promise<MigrationStats> {
  const userRepo = new UserRepository();
  const profileRepo = new ProfileRepository();

  const stats: MigrationStats = {
    total: 0,
    alreadyMigrated: 0,
    noJsonProfile: 0,
    migrated: 0,
    failed: 0,
  };

  console.log(chalk.blue('\n🔄 Starting Profile Migration to Markdown\n'));
  console.log(chalk.yellow(`Mode: ${isDryRun ? 'DRY RUN (no changes will be made)' : 'LIVE'}\n`));

  try {
    // Get all users
    const { users, total } = await userRepo.list({ pageSize: 1000 });
    stats.total = total;

    console.log(chalk.blue(`Found ${total} total users\n`));

    for (const user of users) {
      console.log(chalk.gray(`\nProcessing user: ${user.name} (${user.id})`));

      // Check if already has Markdown profile
      const hasMarkdownProfile = await profileRepo.hasProfile(user.id);
      if (hasMarkdownProfile) {
        console.log(chalk.gray('  ✓ Already has Markdown profile, skipping'));
        stats.alreadyMigrated++;
        continue;
      }

      // Check if has JSON profile
      if (!user.profile || (typeof user.profile === 'object' && Object.keys(user.profile).length === 0)) {
        console.log(chalk.gray('  ✓ No JSON profile to migrate, skipping'));
        stats.noJsonProfile++;
        continue;
      }

      try {
        // Convert JSON to Markdown
        const markdownProfile = convertJsonProfileToMarkdown(user.profile, user);

        console.log(chalk.green('  → Converted to Markdown:'));
        console.log(chalk.gray('    ' + markdownProfile.split('\n').slice(0, 5).join('\n    ') + '...'));

        // Save to profiles table (unless dry run)
        if (!isDryRun) {
          await profileRepo.createProfileForUser(user.id, markdownProfile);
          console.log(chalk.green('  ✓ Saved to profiles table'));
        } else {
          console.log(chalk.yellow('  ⚠ DRY RUN - Would save to profiles table'));
        }

        stats.migrated++;
      } catch (error) {
        console.error(chalk.red(`  ✗ Error migrating user ${user.id}:`), error);
        stats.failed++;
      }
    }

    return stats;
  } catch (error) {
    console.error(chalk.red('\n✗ Migration failed with error:'), error);
    throw error;
  }
}

// ============================================================================
// Script Execution
// ============================================================================

async function main() {
  try {
    const stats = await migrateProfiles();

    // Print summary
    console.log(chalk.blue('\n' + '='.repeat(60)));
    console.log(chalk.blue('Migration Summary'));
    console.log(chalk.blue('='.repeat(60)));
    console.log(chalk.white(`Total users:           ${stats.total}`));
    console.log(chalk.gray(`Already migrated:      ${stats.alreadyMigrated}`));
    console.log(chalk.gray(`No JSON profile:       ${stats.noJsonProfile}`));
    console.log(chalk.green(`Successfully migrated: ${stats.migrated}`));
    console.log(chalk.red(`Failed:                ${stats.failed}`));
    console.log(chalk.blue('='.repeat(60) + '\n'));

    if (isDryRun) {
      console.log(chalk.yellow('⚠ This was a DRY RUN - no changes were made to the database'));
      console.log(chalk.yellow('Run without --dry-run to perform actual migration\n'));
    } else {
      console.log(chalk.green('✓ Migration completed successfully\n'));
    }

    await postgresDb.destroy();
    process.exit(0);
  } catch (error) {
    console.error(chalk.red('\n✗ Migration script failed:'), error);
    await postgresDb.destroy();
    process.exit(1);
  }
}

// Run the script
main();
