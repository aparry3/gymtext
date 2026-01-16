import { Kysely, sql } from 'kysely';

/**
 * Migration: Remove deprecated version_id column from program_enrollments
 *
 * The version_id field was originally used to link enrollments to fitness plans (the user's instance).
 * This has been replaced by:
 * - program_version_id: Links to the program version (the "recipe")
 * - FitnessPlan.clientId: Tracks the user's plan instance directly
 *
 * This migration removes the deprecated column after all code has been updated
 * to use the new fields.
 */
export async function up(db: Kysely<any>): Promise<void> {
  console.log('Removing deprecated version_id column from program_enrollments...');

  // Drop the deprecated versionId column
  await sql`ALTER TABLE program_enrollments DROP COLUMN IF EXISTS version_id`.execute(db);

  console.log('Removed version_id column from program_enrollments');
}

export async function down(db: Kysely<any>): Promise<void> {
  console.log('Restoring version_id column to program_enrollments...');

  // Restore the column if needed (for rollback)
  await sql`ALTER TABLE program_enrollments ADD COLUMN version_id UUID REFERENCES fitness_plans(id) ON DELETE SET NULL`.execute(db);

  console.log('Restored version_id column to program_enrollments');
}
