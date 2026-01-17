import { Kysely, sql } from 'kysely';
import { DB } from '../src/server/models/_types';

/**
 * Add formatted column to microcycles table
 *
 * This migration adds a `formatted` TEXT field to the microcycles table
 * to store markdown-formatted weekly overviews for frontend display.
 * This follows the same pattern as workout_instances.formatted.
 */
export async function up(db: Kysely<DB>): Promise<void> {
  await sql`
    ALTER TABLE microcycles
    ADD COLUMN formatted TEXT
  `.execute(db);
}

export async function down(db: Kysely<DB>): Promise<void> {
  await sql`
    ALTER TABLE microcycles
    DROP COLUMN IF EXISTS formatted
  `.execute(db);
}
