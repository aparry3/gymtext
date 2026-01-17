import { Kysely, sql } from 'kysely';
import { DB } from '../src/server/models/_types';

/**
 * Remove session_type CHECK constraint from workout_instances table
 *
 * This migration removes the restrictive CHECK constraint on session_type
 * to allow more flexibility in session type values. The application layer
 * will handle validation as needed.
 *
 * Previously constrained to: 'strength', 'cardio', 'mobility', 'recovery', 'assessment', 'deload'
 * Now allows any string value, including: 'run', 'lift', 'metcon', 'mobility', 'rest', 'other'
 */
export async function up(db: Kysely<DB>): Promise<void> {
  await sql`
    ALTER TABLE workout_instances
    DROP CONSTRAINT IF EXISTS check_session_type
  `.execute(db);
}

export async function down(db: Kysely<DB>): Promise<void> {
  // Re-add the original constraint
  await sql`
    ALTER TABLE workout_instances
    ADD CONSTRAINT check_session_type
    CHECK (session_type IN ('strength', 'cardio', 'mobility', 'recovery', 'assessment', 'deload'))
  `.execute(db);
}
