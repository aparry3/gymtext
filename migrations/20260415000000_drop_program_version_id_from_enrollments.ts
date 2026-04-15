import { Kysely, sql } from 'kysely';

/**
 * Drop program_version_id from program_enrollments.
 *
 * Enrollments now reference programs only. Program content (formats, constraints,
 * template) is resolved at read time from the latest published program version
 * via programVersionRepository.findLatestPublished(programId). Storing a
 * version id on the enrollment pinned users to the version at signup.
 */

export async function up(db: Kysely<unknown>): Promise<void> {
  console.log('Dropping idx_enrollments_program_version_id...');
  await db.schema.dropIndex('idx_enrollments_program_version_id').ifExists().execute();

  console.log('Dropping program_version_id column from program_enrollments...');
  await sql`ALTER TABLE program_enrollments DROP COLUMN IF EXISTS program_version_id`.execute(db);

  console.log('Done dropping program_version_id.');
}

export async function down(db: Kysely<unknown>): Promise<void> {
  console.log('Re-adding program_version_id to program_enrollments...');
  await sql`
    ALTER TABLE program_enrollments
    ADD COLUMN IF NOT EXISTS program_version_id uuid REFERENCES program_versions(id) ON DELETE SET NULL
  `.execute(db);

  console.log('Recreating idx_enrollments_program_version_id...');
  await sql`CREATE INDEX IF NOT EXISTS idx_enrollments_program_version_id ON program_enrollments (program_version_id)`.execute(db);

  console.log('Done re-adding program_version_id.');
}
