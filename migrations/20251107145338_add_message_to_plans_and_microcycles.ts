import { Kysely, sql } from 'kysely';
import { DB } from '../src/server/models/_types';

/**
 * Add message column to fitness_plans and microcycles tables
 *
 * This migration adds a consistent `message` field to both fitness_plans
 * and microcycles tables, following the pattern established by workout_instances.
 *
 * - fitness_plans.message: SMS-formatted plan summary for onboarding
 * - microcycles.message: SMS-formatted weekly check-in/breakdown message
 *
 * This decouples message generation from message sending, allowing messages
 * to be pre-generated during entity creation and stored for later delivery.
 */
export async function up(db: Kysely<DB>): Promise<void> {
  await sql`
    ALTER TABLE fitness_plans
    ADD COLUMN message TEXT
  `.execute(db);

  await sql`
    ALTER TABLE microcycles
    ADD COLUMN message TEXT
  `.execute(db);
}

export async function down(db: Kysely<DB>): Promise<void> {
  await sql`
    ALTER TABLE fitness_plans
    DROP COLUMN IF EXISTS message
  `.execute(db);

  await sql`
    ALTER TABLE microcycles
    DROP COLUMN IF EXISTS message
  `.execute(db);
}
