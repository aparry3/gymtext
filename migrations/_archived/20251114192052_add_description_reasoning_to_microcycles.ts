import { Kysely, sql } from 'kysely';
import { DB } from '../src/server/models/_types';

/**
 * Add description and reasoning columns to microcycles table
 *
 * These fields store the long-form microcycle description and coaching rationale,
 * matching the pattern used in fitness_plans and workout_instances tables.
 *
 * - description: Long-form narrative description of the weekly microcycle
 * - reasoning: Explanation of how and why the week is structured
 */
export async function up(db: Kysely<DB>): Promise<void> {
  await sql`
    ALTER TABLE microcycles
    ADD COLUMN description TEXT,
    ADD COLUMN reasoning TEXT
  `.execute(db);
}

export async function down(db: Kysely<DB>): Promise<void> {
  await sql`
    ALTER TABLE microcycles
    DROP COLUMN IF EXISTS description,
    DROP COLUMN IF EXISTS reasoning
  `.execute(db);
}
