import { Kysely, sql } from 'kysely';

/**
 * Add tags column to workout_instances.
 *
 * Stores flattened, prefixed tag strings (e.g. 'category:strength', 'muscle:lats')
 * as a TEXT[] column with a GIN index for efficient array-overlap queries.
 */

export async function up(db: Kysely<unknown>): Promise<void> {
  console.log('Adding tags column to workout_instances...');

  await sql`ALTER TABLE workout_instances ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}'`.execute(db);
  await sql`CREATE INDEX IF NOT EXISTS idx_workout_instances_tags ON workout_instances USING GIN (tags)`.execute(db);

  console.log('Done adding tags column.');
}

export async function down(db: Kysely<unknown>): Promise<void> {
  console.log('Removing tags column from workout_instances...');

  await sql`DROP INDEX IF EXISTS idx_workout_instances_tags`.execute(db);
  await sql`ALTER TABLE workout_instances DROP COLUMN IF EXISTS tags`.execute(db);

  console.log('Done removing tags column.');
}
