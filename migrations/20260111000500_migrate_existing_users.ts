import { Kysely, sql } from 'kysely';

const AI_PROGRAM_ID = '00000000-0000-0000-0000-000000000002';

export async function up(db: Kysely<any>): Promise<void> {
  console.log('Migrating existing users to program enrollments...');

  // Create enrollments for users with fitness plans (latest plan per user)
  const enrollmentResult = await sql`
    WITH latest_plans AS (
      SELECT
        fp.legacy_client_id,
        fp.id as plan_id,
        fp.start_date,
        fp.created_at,
        ROW_NUMBER() OVER (PARTITION BY fp.legacy_client_id ORDER BY fp.created_at DESC) as rn
      FROM fitness_plans fp
      WHERE fp.legacy_client_id IS NOT NULL
    )
    INSERT INTO program_enrollments (client_id, program_id, version_id, start_date, current_week, status, enrolled_at)
    SELECT
      lp.legacy_client_id,
      ${AI_PROGRAM_ID}::uuid,
      lp.plan_id,
      COALESCE(lp.start_date::date, lp.created_at::date),
      GREATEST(1, EXTRACT(WEEK FROM CURRENT_DATE) - EXTRACT(WEEK FROM COALESCE(lp.start_date, lp.created_at)) + 1)::integer,
      'active',
      lp.created_at
    FROM latest_plans lp
    WHERE lp.rn = 1
    AND NOT EXISTS (
      SELECT 1 FROM program_enrollments pe
      WHERE pe.client_id = lp.legacy_client_id
      AND pe.program_id = ${AI_PROGRAM_ID}::uuid
    )
  `.execute(db);

  console.log(`Created enrollments for existing users`);

  // Link all fitness_plans to AI program
  const updateResult = await sql`
    UPDATE fitness_plans
    SET program_id = ${AI_PROGRAM_ID}::uuid, published_at = created_at
    WHERE legacy_client_id IS NOT NULL AND program_id IS NULL
  `.execute(db);

  console.log(`Linked fitness_plans to AI program`);

  // Count results
  const countResult = await sql<{ count: string }>`
    SELECT COUNT(*) as count FROM program_enrollments
  `.execute(db);

  console.log(`Total enrollments: ${countResult.rows[0]?.count || 0}`);
}

export async function down(db: Kysely<any>): Promise<void> {
  // Remove enrollments created by this migration
  await sql`
    DELETE FROM program_enrollments
    WHERE program_id = ${AI_PROGRAM_ID}::uuid
  `.execute(db);

  // Clear program_id and published_at from fitness_plans
  await sql`
    UPDATE fitness_plans
    SET program_id = NULL, published_at = NULL
    WHERE program_id = ${AI_PROGRAM_ID}::uuid
  `.execute(db);
}
