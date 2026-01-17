import { Kysely, sql } from 'kysely';
import { DB } from '../src/server/models/_types';

/**
 * Simplify microcycles schema by removing complex pattern JSON
 * and replacing with individual day overview columns
 *
 * - Removes: pattern column (complex JSON structure)
 * - Adds: Individual text columns for each day's overview
 */
export async function up(db: Kysely<DB>): Promise<void> {
  // Add day overview columns
  await sql`
    ALTER TABLE microcycles
    ADD COLUMN monday_overview TEXT,
    ADD COLUMN tuesday_overview TEXT,
    ADD COLUMN wednesday_overview TEXT,
    ADD COLUMN thursday_overview TEXT,
    ADD COLUMN friday_overview TEXT,
    ADD COLUMN saturday_overview TEXT,
    ADD COLUMN sunday_overview TEXT
  `.execute(db);

  // Remove pattern column
  await sql`
    ALTER TABLE microcycles
    DROP COLUMN pattern
  `.execute(db);
}

export async function down(db: Kysely<DB>): Promise<void> {
  // Re-add pattern column
  await sql`
    ALTER TABLE microcycles
    ADD COLUMN pattern JSON NOT NULL DEFAULT '{}'::json
  `.execute(db);

  // Remove day overview columns
  await sql`
    ALTER TABLE microcycles
    DROP COLUMN IF EXISTS monday_overview,
    DROP COLUMN IF EXISTS tuesday_overview,
    DROP COLUMN IF EXISTS wednesday_overview,
    DROP COLUMN IF EXISTS thursday_overview,
    DROP COLUMN IF EXISTS friday_overview,
    DROP COLUMN IF EXISTS saturday_overview,
    DROP COLUMN IF EXISTS sunday_overview
  `.execute(db);
}
