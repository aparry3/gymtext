import { Kysely, sql } from 'kysely';

/**
 * Remove fitnessPlanId from microcycles and workout_instances tables
 *
 * Rationale:
 * - Queries use clientId + date/progress instead
 * - When plan is needed, fetch user's active (most recent) plan via getCurrentPlan
 */
export async function up(db: Kysely<any>): Promise<void> {
  // Drop index that uses fitness_plan_id
  await sql`DROP INDEX IF EXISTS idx_microcycles_absolute_week`.execute(db);

  // Drop foreign key constraints
  await sql`ALTER TABLE microcycles DROP CONSTRAINT IF EXISTS microcycles_fitness_plan_id_fkey`.execute(db);
  await sql`ALTER TABLE workout_instances DROP CONSTRAINT IF EXISTS workout_instances_fitness_plan_id_fkey`.execute(db);

  // Drop columns
  await sql`ALTER TABLE microcycles DROP COLUMN IF EXISTS fitness_plan_id`.execute(db);
  await sql`ALTER TABLE workout_instances DROP COLUMN IF EXISTS fitness_plan_id`.execute(db);

  // Create new index without fitness_plan_id
  await db.schema.createIndex('idx_microcycles_client_absolute_week')
    .on('microcycles')
    .columns(['client_id', 'absolute_week'])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop new index
  await sql`DROP INDEX IF EXISTS idx_microcycles_client_absolute_week`.execute(db);

  // Restore columns (without data - this is a one-way migration)
  await sql`ALTER TABLE microcycles ADD COLUMN fitness_plan_id UUID`.execute(db);
  await sql`ALTER TABLE workout_instances ADD COLUMN fitness_plan_id UUID`.execute(db);

  // Restore old index
  await db.schema.createIndex('idx_microcycles_absolute_week')
    .on('microcycles')
    .columns(['fitness_plan_id', 'absolute_week'])
    .execute();
}
