import { Kysely, sql } from 'kysely';

/**
 * Dossier Tables Migration
 *
 * Simplifies profiles, fitness_plans, and microcycles tables
 * for the new dossier-based architecture where content is stored
 * as plain text rather than structured JSON.
 */

export async function up(db: Kysely<unknown>): Promise<void> {
  // =========================================================================
  // 1. Profiles: Drop structured column
  // =========================================================================
  console.log('Dropping structured column from profiles...');
  await sql`ALTER TABLE profiles DROP COLUMN IF EXISTS structured`.execute(db);

  // =========================================================================
  // 2. Fitness Plans: Simplify to content-based
  // =========================================================================
  console.log('Simplifying fitness_plans table...');

  // Add content column
  await sql`ALTER TABLE fitness_plans ADD COLUMN IF NOT EXISTS content TEXT`.execute(db);

  // Migrate existing description data to content
  await sql`UPDATE fitness_plans SET content = description WHERE content IS NULL AND description IS NOT NULL`.execute(db);

  // Drop columns that are no longer needed
  await sql`ALTER TABLE fitness_plans DROP COLUMN IF EXISTS current_state`.execute(db);
  await sql`ALTER TABLE fitness_plans DROP COLUMN IF EXISTS personalization_snapshot`.execute(db);
  await sql`ALTER TABLE fitness_plans DROP COLUMN IF EXISTS program_version_id`.execute(db);
  await sql`ALTER TABLE fitness_plans DROP COLUMN IF EXISTS status`.execute(db);
  await sql`ALTER TABLE fitness_plans DROP COLUMN IF EXISTS structured`.execute(db);
  await sql`ALTER TABLE fitness_plans DROP COLUMN IF EXISTS message`.execute(db);
  await sql`ALTER TABLE fitness_plans DROP COLUMN IF EXISTS updated_at`.execute(db);
  await sql`ALTER TABLE fitness_plans DROP COLUMN IF EXISTS published_at`.execute(db);
  await sql`ALTER TABLE fitness_plans DROP COLUMN IF EXISTS program_id`.execute(db);

  // Add index for latest plan per user
  await sql`CREATE INDEX IF NOT EXISTS idx_fitness_plans_user_latest ON fitness_plans(client_id, created_at DESC)`.execute(db);

  // =========================================================================
  // 3. Microcycles: Simplify to content-based
  // =========================================================================
  console.log('Simplifying microcycles table...');

  // Add new columns
  await sql`ALTER TABLE microcycles ADD COLUMN IF NOT EXISTS content TEXT`.execute(db);
  await sql`ALTER TABLE microcycles ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES fitness_plans(id)`.execute(db);

  // Migrate existing description data to content
  await sql`UPDATE microcycles SET content = description WHERE content IS NULL AND description IS NOT NULL`.execute(db);

  // Drop columns that are no longer needed
  await sql`ALTER TABLE microcycles DROP COLUMN IF EXISTS absolute_week`.execute(db);
  await sql`ALTER TABLE microcycles DROP COLUMN IF EXISTS days`.execute(db);
  await sql`ALTER TABLE microcycles DROP COLUMN IF EXISTS description`.execute(db);
  await sql`ALTER TABLE microcycles DROP COLUMN IF EXISTS message`.execute(db);
  await sql`ALTER TABLE microcycles DROP COLUMN IF EXISTS structured`.execute(db);
  await sql`ALTER TABLE microcycles DROP COLUMN IF EXISTS is_active`.execute(db);
  await sql`ALTER TABLE microcycles DROP COLUMN IF EXISTS updated_at`.execute(db);
  await sql`ALTER TABLE microcycles DROP COLUMN IF EXISTS end_date`.execute(db);

  // Add indexes
  await sql`CREATE INDEX IF NOT EXISTS idx_microcycles_user_latest ON microcycles(client_id, created_at DESC)`.execute(db);
  await sql`CREATE INDEX IF NOT EXISTS idx_microcycles_user_date ON microcycles(client_id, start_date DESC)`.execute(db);

  console.log('Dossier tables migration complete!');
}

export async function down(db: Kysely<unknown>): Promise<void> {
  console.log('Rolling back dossier tables migration...');

  // =========================================================================
  // 1. Microcycles: Restore dropped columns
  // =========================================================================
  await sql`DROP INDEX IF EXISTS idx_microcycles_user_latest`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_microcycles_user_date`.execute(db);

  await sql`ALTER TABLE microcycles ADD COLUMN IF NOT EXISTS absolute_week INTEGER`.execute(db);
  await sql`ALTER TABLE microcycles ADD COLUMN IF NOT EXISTS days TEXT[]`.execute(db);
  await sql`ALTER TABLE microcycles ADD COLUMN IF NOT EXISTS description TEXT`.execute(db);
  await sql`ALTER TABLE microcycles ADD COLUMN IF NOT EXISTS message TEXT`.execute(db);
  await sql`ALTER TABLE microcycles ADD COLUMN IF NOT EXISTS structured JSONB`.execute(db);
  await sql`ALTER TABLE microcycles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true`.execute(db);
  await sql`ALTER TABLE microcycles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP`.execute(db);
  await sql`ALTER TABLE microcycles ADD COLUMN IF NOT EXISTS end_date DATE`.execute(db);

  // Migrate content back to description
  await sql`UPDATE microcycles SET description = content WHERE description IS NULL AND content IS NOT NULL`.execute(db);

  await sql`ALTER TABLE microcycles DROP COLUMN IF EXISTS content`.execute(db);
  await sql`ALTER TABLE microcycles DROP COLUMN IF EXISTS plan_id`.execute(db);

  // =========================================================================
  // 2. Fitness Plans: Restore dropped columns
  // =========================================================================
  await sql`DROP INDEX IF EXISTS idx_fitness_plans_user_latest`.execute(db);

  await sql`ALTER TABLE fitness_plans ADD COLUMN IF NOT EXISTS current_state JSONB`.execute(db);
  await sql`ALTER TABLE fitness_plans ADD COLUMN IF NOT EXISTS personalization_snapshot JSONB`.execute(db);
  await sql`ALTER TABLE fitness_plans ADD COLUMN IF NOT EXISTS program_version_id UUID`.execute(db);
  await sql`ALTER TABLE fitness_plans ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'`.execute(db);
  await sql`ALTER TABLE fitness_plans ADD COLUMN IF NOT EXISTS structured JSONB`.execute(db);
  await sql`ALTER TABLE fitness_plans ADD COLUMN IF NOT EXISTS message TEXT`.execute(db);
  await sql`ALTER TABLE fitness_plans ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP`.execute(db);
  await sql`ALTER TABLE fitness_plans ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ`.execute(db);
  await sql`ALTER TABLE fitness_plans ADD COLUMN IF NOT EXISTS program_id UUID`.execute(db);

  // Migrate content back to description
  await sql`UPDATE fitness_plans SET description = content WHERE description IS NULL AND content IS NOT NULL`.execute(db);

  await sql`ALTER TABLE fitness_plans DROP COLUMN IF EXISTS content`.execute(db);

  // =========================================================================
  // 3. Profiles: Restore structured column
  // =========================================================================
  await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS structured JSONB`.execute(db);

  console.log('Dossier tables rollback complete!');
}
