import { Kysely, sql } from 'kysely';

/**
 * User Exercise Metrics Migration
 *
 * Creates the user_exercise_metrics table for storing actual performance data
 * from workout tracking (weights, reps, duration, etc.)
 */

export async function up(db: Kysely<unknown>): Promise<void> {
  console.log('Starting user_exercise_metrics migration...');

  // 1. Create user_exercise_metrics table
  await sql`
    CREATE TABLE user_exercise_metrics (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      workout_id UUID NOT NULL REFERENCES workout_instances(id) ON DELETE CASCADE,
      exercise_id UUID NOT NULL REFERENCES exercises(id),
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

      UNIQUE(workout_id, exercise_id)
    )
  `.execute(db);
  console.log('Created user_exercise_metrics table');

  // 2. Create indexes for efficient queries
  await sql`CREATE INDEX idx_user_exercise_metrics_client ON user_exercise_metrics(client_id)`.execute(db);
  await sql`CREATE INDEX idx_user_exercise_metrics_workout ON user_exercise_metrics(workout_id)`.execute(db);
  await sql`CREATE INDEX idx_user_exercise_metrics_exercise ON user_exercise_metrics(exercise_id)`.execute(db);
  console.log('Created indexes on user_exercise_metrics');

  console.log('User exercise metrics migration complete');
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql`DROP INDEX IF EXISTS idx_user_exercise_metrics_exercise`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_user_exercise_metrics_workout`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_user_exercise_metrics_client`.execute(db);
  await sql`DROP TABLE IF EXISTS user_exercise_metrics CASCADE`.execute(db);
  console.log('Reverted user_exercise_metrics migration');
}
