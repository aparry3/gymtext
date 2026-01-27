import { Kysely, sql } from 'kysely';

/**
 * Consolidated Exercise Schema Migration
 *
 * Combines the following migrations into a single file:
 * - 20260124000000_exercise_schema_v2.ts
 * - 20260125000000_movements.ts
 * - 20260125000001_drop_columns_nullable_fields.ts
 * - 20260125100000_user_exercise_metrics.ts
 *
 * Creates:
 * - movements table (with 18 seeded canonical movements)
 * - exercises table (with embedding column for semantic search)
 * - exercise_aliases table
 * - exercise_uses table
 * - user_exercise_metrics table
 */

export async function up(db: Kysely<unknown>): Promise<void> {
  console.log('Starting consolidated exercise schema migration...');

  // 1. Enable required extensions
  await sql`CREATE EXTENSION IF NOT EXISTS pg_trgm`.execute(db);
  await sql`CREATE EXTENSION IF NOT EXISTS vector`.execute(db);
  console.log('Ensured pg_trgm and vector extensions exist');

  // 2. Drop existing tables (cascade handles foreign keys)
  await sql`DROP TABLE IF EXISTS exercise_uses CASCADE`.execute(db);
  await sql`DROP TABLE IF EXISTS exercise_aliases CASCADE`.execute(db);
  await sql`DROP TABLE IF EXISTS exercises CASCADE`.execute(db);
  console.log('Dropped existing exercise tables');

  // 3. Create movements table (must come before exercises for FK)
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

  // 4. Seed 18 canonical movements
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

  // 5. Create exercises table
  // - Omits press_plane and kinetic_chain (were dropped in later migration)
  // - mechanics, modality, intensity are nullable (not NOT NULL)
  // - Includes movement_id FK and embedding column for semantic search
  await sql`
    CREATE TABLE exercises (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(200) NOT NULL UNIQUE,
      slug VARCHAR(200) NOT NULL UNIQUE,
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      type VARCHAR(30) NOT NULL,
      mechanics VARCHAR(50) DEFAULT '',
      training_groups TEXT[] NOT NULL DEFAULT '{}',
      movement_patterns TEXT[] NOT NULL DEFAULT '{}',
      primary_muscles TEXT[] NOT NULL DEFAULT '{}',
      secondary_muscles TEXT[] NOT NULL DEFAULT '{}',
      equipment TEXT[] NOT NULL DEFAULT '{}',
      modality VARCHAR(50) DEFAULT '',
      intensity VARCHAR(50) DEFAULT '',
      short_description TEXT NOT NULL DEFAULT '',
      instructions TEXT NOT NULL DEFAULT '',
      cues TEXT[] NOT NULL DEFAULT '{}',
      aliases TEXT[] NOT NULL DEFAULT '{}',
      popularity NUMERIC(7,3) NOT NULL DEFAULT 500,
      is_active BOOLEAN NOT NULL DEFAULT true,
      movement_id UUID REFERENCES movements(id),
      embedding vector(1536),
      embedding_text TEXT,
      embedding_text_version INTEGER DEFAULT 1,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `.execute(db);
  console.log('Created exercises table');

  // 6. Create exercise_aliases table
  await sql`
    CREATE TABLE exercise_aliases (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
      alias VARCHAR(200) NOT NULL,
      alias_normalized VARCHAR(200) NOT NULL,
      alias_lex TEXT NOT NULL DEFAULT '',
      source VARCHAR(50) NOT NULL DEFAULT 'seed',
      is_default BOOLEAN NOT NULL DEFAULT false,
      confidence_score NUMERIC(3,2),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE(alias_normalized)
    )
  `.execute(db);
  console.log('Created exercise_aliases table');

  // 7. Create exercise_uses table
  await sql`
    CREATE TABLE exercise_uses (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      use_type VARCHAR(20) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `.execute(db);
  console.log('Created exercise_uses table');

  // 8. Create user_exercise_metrics table
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

  // 9. Create indexes
  // Exercise indexes
  await sql`CREATE INDEX idx_exercises_slug ON exercises(slug)`.execute(db);
  await sql`CREATE INDEX idx_exercises_type ON exercises(type)`.execute(db);
  await sql`CREATE INDEX idx_exercises_status ON exercises(status)`.execute(db);
  await sql`CREATE INDEX idx_exercises_is_active ON exercises(is_active)`.execute(db);
  await sql`CREATE INDEX idx_exercises_movement_id ON exercises(movement_id)`.execute(db);

  // HNSW index for vector similarity search on embeddings
  await sql`CREATE INDEX idx_exercises_embedding ON exercises USING hnsw (embedding vector_cosine_ops)`.execute(db);

  // Exercise aliases indexes
  await sql`CREATE INDEX idx_exercise_aliases_exercise_id ON exercise_aliases(exercise_id)`.execute(db);
  await sql`CREATE INDEX idx_exercise_aliases_lex_trgm ON exercise_aliases USING gin (alias_lex gin_trgm_ops)`.execute(db);
  await sql`CREATE INDEX idx_exercise_aliases_norm_trgm ON exercise_aliases USING gin (alias_normalized gin_trgm_ops)`.execute(db);

  // Exercise uses indexes
  await sql`CREATE INDEX idx_exercise_uses_exercise_id ON exercise_uses(exercise_id)`.execute(db);
  await sql`CREATE INDEX idx_exercise_uses_created_at ON exercise_uses(created_at)`.execute(db);

  // User exercise metrics indexes
  await sql`CREATE INDEX idx_user_exercise_metrics_client ON user_exercise_metrics(client_id)`.execute(db);
  await sql`CREATE INDEX idx_user_exercise_metrics_workout ON user_exercise_metrics(workout_id)`.execute(db);
  await sql`CREATE INDEX idx_user_exercise_metrics_exercise ON user_exercise_metrics(exercise_id)`.execute(db);

  console.log('Created all indexes');
  console.log('Consolidated exercise schema migration complete');
}

export async function down(db: Kysely<unknown>): Promise<void> {
  // Drop tables in reverse order of dependencies
  await sql`DROP TABLE IF EXISTS user_exercise_metrics CASCADE`.execute(db);
  await sql`DROP TABLE IF EXISTS exercise_uses CASCADE`.execute(db);
  await sql`DROP TABLE IF EXISTS exercise_aliases CASCADE`.execute(db);
  await sql`DROP TABLE IF EXISTS exercises CASCADE`.execute(db);
  await sql`DROP TABLE IF EXISTS movements CASCADE`.execute(db);
  console.log('Reverted consolidated exercise schema migration');
}
