import { Kysely, sql } from 'kysely';

/**
 * Movements Migration
 *
 * Creates the movements table for tracking progress across related exercises.
 * Seeds 18 canonical movements and adds a nullable movement_id FK to exercises.
 */

export async function up(db: Kysely<unknown>): Promise<void> {
  console.log('Starting movements migration...');

  // 1. Create movements table
  await sql`
    CREATE TABLE movements (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      metric_type TEXT NOT NULL DEFAULT 'strength',
      parent_slug TEXT REFERENCES movements(slug),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `.execute(db);
  console.log('Created movements table');

  // 2. Seed 18 canonical movements
  await sql`
    INSERT INTO movements (slug, name, metric_type) VALUES
      ('run', 'Run', 'cardio_distance'),
      ('bike', 'Bike', 'cardio_distance'),
      ('swim', 'Swim', 'cardio_distance'),
      ('row_erg', 'Row (Erg)', 'cardio_distance'),
      ('elliptical', 'Elliptical', 'cardio_duration'),
      ('stair_climber', 'Stair Climber', 'cardio_duration'),
      ('bench_press', 'Bench Press', 'strength'),
      ('push_up', 'Push-Up', 'reps_only'),
      ('squat', 'Squat', 'strength'),
      ('deadlift', 'Deadlift', 'strength'),
      ('overhead_press', 'Overhead Press', 'strength'),
      ('row', 'Row (Strength)', 'strength'),
      ('pull_up', 'Pull-Up', 'reps_only'),
      ('lunge', 'Lunge', 'strength'),
      ('hip_thrust', 'Hip Thrust', 'strength'),
      ('carry', 'Carry', 'strength'),
      ('core', 'Core', 'reps_only'),
      ('jump', 'Jump', 'reps_only')
  `.execute(db);
  console.log('Seeded 18 movements');

  // 3. Add movement_id FK to exercises
  await sql`
    ALTER TABLE exercises
    ADD COLUMN movement_id UUID REFERENCES movements(id)
  `.execute(db);
  console.log('Added movement_id column to exercises');

  // 4. Index for joins
  await sql`CREATE INDEX idx_exercises_movement_id ON exercises(movement_id)`.execute(db);
  console.log('Created index on exercises.movement_id');

  console.log('Movements migration complete');
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql`DROP INDEX IF EXISTS idx_exercises_movement_id`.execute(db);
  await sql`ALTER TABLE exercises DROP COLUMN IF EXISTS movement_id`.execute(db);
  await sql`DROP TABLE IF EXISTS movements CASCADE`.execute(db);
  console.log('Reverted movements migration');
}
