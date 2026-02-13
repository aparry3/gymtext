import { Kysely, sql } from 'kysely';

/**
 * Drop is_deload column from microcycles table
 *
 * The deload concept is being removed from the codebase.
 * Training periodization will no longer track deload weeks explicitly.
 */

export async function up(db: Kysely<unknown>): Promise<void> {
  console.log('Dropping is_deload column from microcycles...');

  await sql`ALTER TABLE microcycles DROP COLUMN IF EXISTS is_deload`.execute(db);

  console.log('Done dropping is_deload column.');
}

export async function down(db: Kysely<unknown>): Promise<void> {
  console.log('Re-adding is_deload column to microcycles...');

  await sql`ALTER TABLE microcycles ADD COLUMN IF NOT EXISTS is_deload BOOLEAN NOT NULL DEFAULT false`.execute(db);

  console.log('Done re-adding is_deload column.');
}
