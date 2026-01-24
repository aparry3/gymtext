import { Kysely, sql } from 'kysely';

/**
 * Exercise Schema V2 Migration
 *
 * Drops and recreates exercises, exercise_aliases, and exercise_uses tables
 * with the new schema matching exercises.json structure.
 *
 * Key changes:
 * - exercises: new columns (slug, type, mechanics, kinetic_chain, press_plane,
 *   training_groups, movement_patterns, equipment as array, modality, intensity,
 *   short_description, cues, aliases, popularity)
 * - exercise_aliases: alias_normalized now stores stripped alphanumeric,
 *   alias_searchable removed (was generated column), is_default added
 * - exercise_uses: recreated with same structure
 */

export async function up(db: Kysely<unknown>): Promise<void> {
  console.log('Starting exercise_schema_v2 migration...');

  // 1. Enable pg_trgm extension
  await sql`CREATE EXTENSION IF NOT EXISTS pg_trgm`.execute(db);
  console.log('Ensured pg_trgm extension exists');

  // 2. Drop dependent tables (cascade handles foreign keys)
  await sql`DROP TABLE IF EXISTS exercise_uses CASCADE`.execute(db);
  await sql`DROP TABLE IF EXISTS exercise_aliases CASCADE`.execute(db);
  await sql`DROP TABLE IF EXISTS exercises CASCADE`.execute(db);
  console.log('Dropped existing exercise tables');

  // 3. Create exercises table
  await sql`
    CREATE TABLE exercises (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(200) NOT NULL UNIQUE,
      slug VARCHAR(200) NOT NULL UNIQUE,
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      type VARCHAR(30) NOT NULL,
      mechanics VARCHAR(50) NOT NULL DEFAULT '',
      kinetic_chain VARCHAR(50) NOT NULL DEFAULT '',
      press_plane VARCHAR(50) NOT NULL DEFAULT '',
      training_groups TEXT[] NOT NULL DEFAULT '{}',
      movement_patterns TEXT[] NOT NULL DEFAULT '{}',
      primary_muscles TEXT[] NOT NULL DEFAULT '{}',
      secondary_muscles TEXT[] NOT NULL DEFAULT '{}',
      equipment TEXT[] NOT NULL DEFAULT '{}',
      modality VARCHAR(50) NOT NULL DEFAULT '',
      intensity VARCHAR(50) NOT NULL DEFAULT '',
      short_description TEXT NOT NULL DEFAULT '',
      instructions TEXT NOT NULL DEFAULT '',
      cues TEXT[] NOT NULL DEFAULT '{}',
      aliases TEXT[] NOT NULL DEFAULT '{}',
      popularity NUMERIC(7,3) NOT NULL DEFAULT 500,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `.execute(db);
  console.log('Created exercises table');

  // 4. Create exercise_aliases table
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

  // 5. Create exercise_uses table
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

  // 6. Create indexes
  await sql`CREATE INDEX idx_exercises_slug ON exercises(slug)`.execute(db);
  await sql`CREATE INDEX idx_exercises_type ON exercises(type)`.execute(db);
  await sql`CREATE INDEX idx_exercises_status ON exercises(status)`.execute(db);
  await sql`CREATE INDEX idx_exercises_is_active ON exercises(is_active)`.execute(db);
  await sql`CREATE INDEX idx_exercise_aliases_exercise_id ON exercise_aliases(exercise_id)`.execute(db);
  await sql`CREATE INDEX idx_exercise_aliases_lex_trgm ON exercise_aliases USING gin (alias_lex gin_trgm_ops)`.execute(db);
  await sql`CREATE INDEX idx_exercise_aliases_norm_trgm ON exercise_aliases USING gin (alias_normalized gin_trgm_ops)`.execute(db);
  await sql`CREATE INDEX idx_exercise_uses_exercise_id ON exercise_uses(exercise_id)`.execute(db);
  await sql`CREATE INDEX idx_exercise_uses_created_at ON exercise_uses(created_at)`.execute(db);
  console.log('Created indexes');

  console.log('exercise_schema_v2 migration complete');
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql`DROP TABLE IF EXISTS exercise_uses CASCADE`.execute(db);
  await sql`DROP TABLE IF EXISTS exercise_aliases CASCADE`.execute(db);
  await sql`DROP TABLE IF EXISTS exercises CASCADE`.execute(db);
  console.log('Reverted exercise_schema_v2 migration');
}
