import { Kysely, sql } from 'kysely';

/**
 * Add units preference column to users table
 *
 * This migration adds a units column to allow users to choose between
 * imperial (lbs) and metric (kg) weight units throughout the app.
 *
 * Default is 'imperial' to maintain backwards compatibility.
 */

export async function up(db: Kysely<unknown>): Promise<void> {
  console.log('Adding units column to users table...');

  // Add the units column with default value
  await sql`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS units VARCHAR(10) NOT NULL DEFAULT 'imperial'
  `.execute(db);

  console.log('Added units column');

  // Add check constraint for valid values
  await sql`
    ALTER TABLE users
    ADD CONSTRAINT users_units_check
    CHECK (units IN ('imperial', 'metric'))
  `.execute(db);

  console.log('Added units check constraint');
  console.log('Migration complete!');
}

export async function down(db: Kysely<unknown>): Promise<void> {
  console.log('Removing units column from users table...');

  // Drop the check constraint first
  await sql`
    ALTER TABLE users
    DROP CONSTRAINT IF EXISTS users_units_check
  `.execute(db);

  console.log('Dropped units check constraint');

  // Drop the column
  await sql`
    ALTER TABLE users
    DROP COLUMN IF EXISTS units
  `.execute(db);

  console.log('Dropped units column');
  console.log('Rollback complete!');
}
