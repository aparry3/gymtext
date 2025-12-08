import { Command } from 'commander';
import { Kysely, PostgresDialect, CamelCasePlugin, sql } from 'kysely';
import { Pool } from 'pg';
import { DB } from '@/server/models';

/**
 * Data Migration Script: Rename signup data fields
 *
 * Updates existing signupData JSON in userOnboarding table:
 * - currentActivity → desiredDaysPerWeek
 * - activityElaboration → availabilityElaboration
 *
 * Usage:
 *   pnpm tsx scripts/migrations/rename-signup-data-fields.ts           # Run migration
 *   pnpm tsx scripts/migrations/rename-signup-data-fields.ts --dry-run # Dry run
 */

// CLI Configuration
const program = new Command();
program
  .name('rename-signup-data-fields')
  .description('Rename currentActivity → desiredDaysPerWeek in signupData JSON')
  .option('--dry-run', 'Run without making database changes')
  .parse(process.argv);

const opts = program.opts<{ dryRun?: boolean }>();
const isDryRun = opts.dryRun ?? false;

// Database connection
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({ connectionString: databaseUrl, max: 5 });
const db = new Kysely<DB>({
  dialect: new PostgresDialect({ pool }),
  plugins: [new CamelCasePlugin()]
});

interface SignupDataOld {
  currentActivity?: string;
  activityElaboration?: string;
  [key: string]: unknown;
}

interface SignupDataNew {
  desiredDaysPerWeek?: string;
  availabilityElaboration?: string;
  [key: string]: unknown;
}

async function migrateSignupDataFields() {
  console.log('\n' + '='.repeat(60));
  console.log('Migration: Rename signup data fields');
  console.log('='.repeat(60));
  console.log('currentActivity → desiredDaysPerWeek');
  console.log('activityElaboration → availabilityElaboration\n');

  if (isDryRun) {
    console.log('⚠️  DRY-RUN MODE: No changes will be made\n');
  }

  // Find all records with signupData containing old field names
  const records = await db
    .selectFrom('userOnboarding')
    .select(['id', 'clientId', 'signupData'])
    .where('signupData', 'is not', null)
    .execute();

  console.log(`Found ${records.length} onboarding record(s) with signupData\n`);

  let updatedCount = 0;
  let skippedCount = 0;
  let alreadyMigratedCount = 0;

  for (const record of records) {
    const signupData = record.signupData as SignupDataOld | null;

    if (!signupData) {
      skippedCount++;
      continue;
    }

    // Check if already migrated (has new fields, not old)
    const hasOldFields = 'currentActivity' in signupData || 'activityElaboration' in signupData;
    const hasNewFields = 'desiredDaysPerWeek' in signupData || 'availabilityElaboration' in signupData;

    if (!hasOldFields && hasNewFields) {
      alreadyMigratedCount++;
      console.log(`  [${record.id.substring(0, 8)}] Already migrated → Skipped`);
      continue;
    }

    if (!hasOldFields && !hasNewFields) {
      skippedCount++;
      console.log(`  [${record.id.substring(0, 8)}] No activity fields → Skipped`);
      continue;
    }

    // Create new object with renamed fields
    const newSignupData: SignupDataNew = { ...signupData };

    // Rename currentActivity → desiredDaysPerWeek
    if ('currentActivity' in newSignupData) {
      newSignupData.desiredDaysPerWeek = newSignupData.currentActivity as string;
      delete (newSignupData as SignupDataOld).currentActivity;
    }

    // Rename activityElaboration → availabilityElaboration
    if ('activityElaboration' in newSignupData) {
      newSignupData.availabilityElaboration = newSignupData.activityElaboration as string;
      delete (newSignupData as SignupDataOld).activityElaboration;
    }

    if (!isDryRun) {
      await db
        .updateTable('userOnboarding')
        .set({ signupData: sql`${JSON.stringify(newSignupData)}::jsonb` })
        .where('id', '=', record.id)
        .execute();
    }

    updatedCount++;
    console.log(`  [${record.id.substring(0, 8)}] ✓ ${isDryRun ? 'Would update' : 'Updated'}`);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('Migration Complete!');
  console.log('='.repeat(60));
  console.log(`✓ Updated: ${updatedCount} record(s)`);
  console.log(`⊘ Skipped: ${skippedCount} record(s) (no activity fields)`);
  console.log(`✓ Already migrated: ${alreadyMigratedCount} record(s)`);

  if (isDryRun) {
    console.log('\n⚠️  Dry-run completed. No changes were made.');
  }
}

async function main() {
  try {
    await migrateSignupDataFields();
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    await db.destroy();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
