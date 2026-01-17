import { Kysely, sql } from 'kysely';

/**
 * Migration: Backfill program versions and enrollment version links
 *
 * This migration fixes two data integrity gaps:
 * 1. Creates draft versions for any programs that have no versions
 * 2. Sets program_version_id on enrollments where it's null (using program's published_version_id)
 *
 * Going forward, the programService.create() method auto-creates draft versions,
 * and admin enrollment creation passes the published_version_id.
 */
export async function up(db: Kysely<any>): Promise<void> {
  console.log('Backfilling program versions...');

  // 1. Create draft versions for programs that have no versions
  const result1 = await sql`
    INSERT INTO program_versions (id, program_id, version_number, status, created_at)
    SELECT
      gen_random_uuid(),
      p.id,
      1,
      'draft',
      NOW()
    FROM programs p
    WHERE NOT EXISTS (
      SELECT 1 FROM program_versions pv WHERE pv.program_id = p.id
    )
  `.execute(db);

  console.log(`Created draft versions for programs without versions`);

  // 2. Update enrollments to use their program's published_version_id
  const result2 = await sql`
    UPDATE program_enrollments pe
    SET program_version_id = p.published_version_id
    FROM programs p
    WHERE pe.program_id = p.id
      AND pe.program_version_id IS NULL
      AND p.published_version_id IS NOT NULL
  `.execute(db);

  console.log(`Updated enrollments with program version IDs`);
}

export async function down(db: Kysely<any>): Promise<void> {
  // Note: Not reversing - would lose data
  // The created draft versions would need manual cleanup if rollback is needed
  console.log('Down migration is a no-op - data would be lost');
}
