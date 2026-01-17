import { Kysely, sql } from 'kysely';
import { DB } from '../src/server/models/_types';

/**
 * Update microcycles table schema
 *
 * Changes:
 * - DROP reasoning column (no longer needed)
 * - ADD isDeload boolean column (explicit flag for deload weeks)
 */
export async function up(db: Kysely<DB>): Promise<void> {
  await sql`
    ALTER TABLE microcycles
    DROP COLUMN IF EXISTS reasoning,
    ADD COLUMN is_deload BOOLEAN NOT NULL DEFAULT false
  `.execute(db);
}

export async function down(db: Kysely<DB>): Promise<void> {
  await sql`
    ALTER TABLE microcycles
    ADD COLUMN reasoning TEXT,
    DROP COLUMN IF EXISTS is_deload
  `.execute(db);
}
