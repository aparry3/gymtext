import { Kysely, sql } from 'kysely';
import { DB } from '../src/server/models/_types';

/**
 * Add description and reasoning columns to workout_instances table
 *
 * These fields store the long-form workout description and coaching rationale,
 * matching the pattern used in fitness_plans table (plan_description, reasoning).
 *
 * - description: Human-readable workout overview with exercises, sets, reps
 * - reasoning: Coaching decisions explaining why exercises were chosen and how they
 *   relate to the user's goals, plan, profile, and constraints
 */
export async function up(db: Kysely<DB>): Promise<void> {
  await sql`
    ALTER TABLE workout_instances
    ADD COLUMN description TEXT,
    ADD COLUMN reasoning TEXT
  `.execute(db);
}

export async function down(db: Kysely<DB>): Promise<void> {
  await sql`
    ALTER TABLE workout_instances
    DROP COLUMN IF EXISTS description,
    DROP COLUMN IF EXISTS reasoning
  `.execute(db);
}
