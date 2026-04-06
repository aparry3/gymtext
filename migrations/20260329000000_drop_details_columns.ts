import { Migration, sql } from 'kysely';

/**
 * DROP DETAILS COLUMNS
 *
 * Removes the `details` JSONB columns from profiles, fitness_plans,
 * microcycles, and workout_instances tables.
 *
 * These columns stored AI-extracted structured JSON for UI display.
 * With the simplification to markdown-only storage, they are no longer
 * populated or read. Data can be regenerated from markdown if ever needed.
 *
 * Part of the gymtext simplification initiative.
 */

export const up: Migration = async (db) => {
  console.log('Dropping details columns from 4 tables...');

  await sql`ALTER TABLE profiles DROP COLUMN IF EXISTS details`.execute(db);
  console.log('  ✓ profiles.details dropped');

  await sql`ALTER TABLE fitness_plans DROP COLUMN IF EXISTS details`.execute(db);
  console.log('  ✓ fitness_plans.details dropped');

  await sql`ALTER TABLE microcycles DROP COLUMN IF EXISTS details`.execute(db);
  console.log('  ✓ microcycles.details dropped');

  await sql`ALTER TABLE workout_instances DROP COLUMN IF EXISTS details`.execute(db);
  console.log('  ✓ workout_instances.details dropped');

  console.log('Done — all details columns removed.');
};

export const down: Migration = async (db) => {
  console.log('Re-adding details columns to 4 tables...');

  await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS details JSONB`.execute(db);
  await sql`ALTER TABLE fitness_plans ADD COLUMN IF NOT EXISTS details JSONB`.execute(db);
  await sql`ALTER TABLE microcycles ADD COLUMN IF NOT EXISTS details JSONB`.execute(db);
  await sql`ALTER TABLE workout_instances ADD COLUMN IF NOT EXISTS details JSONB`.execute(db);

  console.log('Done — details columns re-added (empty). Regeneration needed to repopulate.');
};
