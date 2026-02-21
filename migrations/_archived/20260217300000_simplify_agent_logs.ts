import { Kysely, sql } from 'kysely';

/**
 * Simplify agent_logs schema after dossier refactor.
 *
 * Removes eval-related columns and metadata complexity.
 * Truncates existing data since the schema is incompatible.
 */

export async function up(db: Kysely<unknown>): Promise<void> {
  console.log('Simplifying agent_logs...');

  // Truncate existing data
  await sql`TRUNCATE TABLE agent_logs`.execute(db);

  // Drop eval columns
  await sql`ALTER TABLE agent_logs DROP COLUMN IF EXISTS eval_result`.execute(db);
  await sql`ALTER TABLE agent_logs DROP COLUMN IF EXISTS eval_score`.execute(db);

  console.log('Done simplifying agent_logs.');
}

export async function down(db: Kysely<unknown>): Promise<void> {
  console.log('Re-adding eval columns to agent_logs...');

  await sql`ALTER TABLE agent_logs ADD COLUMN IF NOT EXISTS eval_result JSONB`.execute(db);
  await sql`ALTER TABLE agent_logs ADD COLUMN IF NOT EXISTS eval_score NUMERIC(5,2)`.execute(db);

  console.log('Done restoring agent_logs columns.');
}
