import { Migration, sql } from 'kysely';

/**
 * NEW AGENT SYSTEM - Consolidated Migration
 *
 * This single migration transforms the database from main branch schema
 * to the new-agent-system schema. It consolidates all changes from the
 * new-agent-system branch development.
 *
 * Key Changes:
 * - Creates agent_definitions table (versioned agent configs)
 * - Adds messaging columns to users table  
 * - Simplifies fitness_plans (dossier-based)
 * - Simplifies microcycles (dossier-based)
 * - Simplifies profiles (drops structured column)
 * - Simplifies agent_logs (drops eval columns)
 * - Migrates workout_instances in-place (renames client_id→user_id, keeps details)
 * - Drops unused tables (prompts, context_templates, agent_extensions)
 */

export const up: Migration = async (db) => {
  console.log('Starting NEW AGENT SYSTEM migration...');

  // =============================================================================
  // 1. Create agent_definitions table
  // =============================================================================
  console.log('Creating agent_definitions table...');
  
  // Drop existing table if it exists (main branch has incompatible schema)
  await sql`DROP TABLE IF EXISTS agent_definitions CASCADE`.execute(db);
  
  await sql`
    CREATE TABLE agent_definitions (
      version_id SERIAL PRIMARY KEY,
      agent_id TEXT NOT NULL UNIQUE,
      system_prompt TEXT NOT NULL,
      model TEXT NOT NULL DEFAULT 'gpt-5-nano',
      max_tokens INTEGER DEFAULT 16000,
      temperature NUMERIC(3,2) DEFAULT 1.0,
      max_iterations INTEGER DEFAULT 5,
      description TEXT,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      tool_ids TEXT[],
      tool_hooks JSONB,
      hooks JSONB,
      user_prompt_template TEXT,
      examples JSONB,
      eval_rubric TEXT
    )
  `.execute(db);

  await sql`
    CREATE INDEX IF NOT EXISTS idx_agent_definitions_agent_id_created
    ON agent_definitions (agent_id, created_at DESC)
  `.execute(db);

  await sql`
    CREATE INDEX IF NOT EXISTS idx_agent_definitions_active
    ON agent_definitions (is_active) WHERE is_active = true
  `.execute(db);

  // =============================================================================
  // 2. Add messaging columns to users table
  // =============================================================================
  console.log('Adding messaging columns to users...');
  
  await sql`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS preferred_messaging_provider VARCHAR(20) DEFAULT 'twilio'
  `.execute(db);

  await sql`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS messaging_opt_in BOOLEAN DEFAULT FALSE
  `.execute(db);

  await sql`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS messaging_opt_in_date TIMESTAMPTZ
  `.execute(db);

  await sql`
    CREATE INDEX IF NOT EXISTS users_messaging_opt_in_idx
    ON users(messaging_opt_in)
    WHERE messaging_opt_in = TRUE
  `.execute(db);

  await sql`
    CREATE INDEX IF NOT EXISTS messages_provider_idx
    ON messages(provider)
  `.execute(db);

  // =============================================================================
  // 3. Simplify profiles table
  // =============================================================================
  console.log('Simplifying profiles...');
  await sql`ALTER TABLE profiles DROP COLUMN IF EXISTS structured`.execute(db);

  // =============================================================================
  // 4. Simplify fitness_plans table (dossier-based)
  // =============================================================================
  console.log('Simplifying fitness_plans...');

  // Add content column
  await sql`ALTER TABLE fitness_plans ADD COLUMN IF NOT EXISTS content TEXT`.execute(db);

  // Migrate description to content if it exists
  const fitnessPlansDescExists = await sql<{ exists: boolean }>`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'fitness_plans' AND column_name = 'description'
    ) as exists
  `.execute(db);
  
  if (fitnessPlansDescExists.rows[0]?.exists) {
    await sql`UPDATE fitness_plans SET content = description WHERE content IS NULL AND description IS NOT NULL`.execute(db);
  }

  // Drop unused columns
  await sql`ALTER TABLE fitness_plans DROP COLUMN IF EXISTS current_state`.execute(db);
  await sql`ALTER TABLE fitness_plans DROP COLUMN IF EXISTS personalization_snapshot`.execute(db);
  await sql`ALTER TABLE fitness_plans DROP COLUMN IF EXISTS program_version_id`.execute(db);
  await sql`ALTER TABLE fitness_plans DROP COLUMN IF EXISTS status`.execute(db);
  await sql`ALTER TABLE fitness_plans DROP COLUMN IF EXISTS structured`.execute(db);
  await sql`ALTER TABLE fitness_plans DROP COLUMN IF EXISTS message`.execute(db);
  await sql`ALTER TABLE fitness_plans DROP COLUMN IF EXISTS updated_at`.execute(db);
  await sql`ALTER TABLE fitness_plans DROP COLUMN IF EXISTS published_at`.execute(db);
  await sql`ALTER TABLE fitness_plans DROP COLUMN IF EXISTS program_id`.execute(db);

  await sql`CREATE INDEX IF NOT EXISTS idx_fitness_plans_user_latest ON fitness_plans(client_id, created_at DESC)`.execute(db);

  // =============================================================================
  // 5. Simplify microcycles table (dossier-based)
  // =============================================================================
  console.log('Simplifying microcycles...');

  // Add new columns
  await sql`ALTER TABLE microcycles ADD COLUMN IF NOT EXISTS content TEXT`.execute(db);
  await sql`ALTER TABLE microcycles ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES fitness_plans(id)`.execute(db);

  // Migrate description to content if it exists
  const microcyclesDescExists = await sql<{ exists: boolean }>`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'microcycles' AND column_name = 'description'
    ) as exists
  `.execute(db);
  
  if (microcyclesDescExists.rows[0]?.exists) {
    await sql`UPDATE microcycles SET content = description WHERE content IS NULL AND description IS NOT NULL`.execute(db);
  }

  // Drop unused columns
  await sql`ALTER TABLE microcycles DROP COLUMN IF EXISTS absolute_week`.execute(db);
  await sql`ALTER TABLE microcycles DROP COLUMN IF EXISTS days`.execute(db);
  await sql`ALTER TABLE microcycles DROP COLUMN IF EXISTS description`.execute(db);
  await sql`ALTER TABLE microcycles DROP COLUMN IF EXISTS message`.execute(db);
  await sql`ALTER TABLE microcycles DROP COLUMN IF EXISTS structured`.execute(db);
  await sql`ALTER TABLE microcycles DROP COLUMN IF EXISTS is_active`.execute(db);
  await sql`ALTER TABLE microcycles DROP COLUMN IF EXISTS updated_at`.execute(db);
  await sql`ALTER TABLE microcycles DROP COLUMN IF EXISTS end_date`.execute(db);

  await sql`CREATE INDEX IF NOT EXISTS idx_microcycles_user_latest ON microcycles(client_id, created_at DESC)`.execute(db);
  await sql`CREATE INDEX IF NOT EXISTS idx_microcycles_user_date ON microcycles(client_id, start_date DESC)`.execute(db);

  // =============================================================================
  // 6. Simplify agent_logs
  // =============================================================================
  console.log('Simplifying agent_logs...');
  
  await sql`TRUNCATE TABLE agent_logs`.execute(db);
  await sql`ALTER TABLE agent_logs DROP COLUMN IF EXISTS eval_result`.execute(db);
  await sql`ALTER TABLE agent_logs DROP COLUMN IF EXISTS eval_score`.execute(db);

  // =============================================================================
  // 7. Migrate workout_instances table in-place
  // =============================================================================
  console.log('Migrating workout_instances table...');

  // Rename client_id → user_id
  await sql`ALTER TABLE workout_instances RENAME COLUMN client_id TO user_id`.execute(db);

  // Merge structured data into details where details is null
  await sql`UPDATE workout_instances SET details = structured WHERE details IS NULL AND structured IS NOT NULL`.execute(db);

  // Drop unused columns
  await sql`ALTER TABLE workout_instances DROP COLUMN IF EXISTS microcycle_id`.execute(db);
  await sql`ALTER TABLE workout_instances DROP COLUMN IF EXISTS session_type`.execute(db);
  await sql`ALTER TABLE workout_instances DROP COLUMN IF EXISTS goal`.execute(db);
  await sql`ALTER TABLE workout_instances DROP COLUMN IF EXISTS description`.execute(db);
  await sql`ALTER TABLE workout_instances DROP COLUMN IF EXISTS reasoning`.execute(db);
  await sql`ALTER TABLE workout_instances DROP COLUMN IF EXISTS structured`.execute(db);
  await sql`ALTER TABLE workout_instances DROP COLUMN IF EXISTS completed_at`.execute(db);
  await sql`ALTER TABLE workout_instances DROP COLUMN IF EXISTS tags`.execute(db);

  // Make details nullable (old schema had NOT NULL)
  await sql`ALTER TABLE workout_instances ALTER COLUMN details DROP NOT NULL`.execute(db);

  // Add unique constraint on (user_id, date)
  await sql`ALTER TABLE workout_instances ADD CONSTRAINT workout_instances_user_id_date_unique UNIQUE (user_id, date)`.execute(db);

  // Create indexes
  await sql`CREATE INDEX IF NOT EXISTS idx_workout_instances_user_id ON workout_instances (user_id)`.execute(db);
  await sql`CREATE INDEX IF NOT EXISTS idx_workout_instances_user_date ON workout_instances (user_id, date DESC)`.execute(db);

  // =============================================================================
  // 8. Drop unused tables
  // =============================================================================
  console.log('Dropping unused tables...');
  await sql`DROP TABLE IF EXISTS prompts CASCADE`.execute(db);
  await sql`DROP TABLE IF EXISTS context_templates CASCADE`.execute(db);
  await sql`DROP TABLE IF EXISTS agent_extensions CASCADE`.execute(db);

  console.log('NEW AGENT SYSTEM migration complete!');
};

export const down: Migration = async (db) => {
  console.log('Rolling back NEW AGENT SYSTEM migration...');

  // This rollback is destructive - it drops tables and columns added by this migration
  // Recommend taking a backup before running this rollback

  // Drop agent_definitions
  await sql`DROP TABLE IF EXISTS agent_definitions CASCADE`.execute(db);

  // Remove messaging columns from users
  await sql`DROP INDEX IF EXISTS users_messaging_opt_in_idx`.execute(db);
  await sql`DROP INDEX IF EXISTS messages_provider_idx`.execute(db);
  await sql`ALTER TABLE users DROP COLUMN IF EXISTS preferred_messaging_provider`.execute(db);
  await sql`ALTER TABLE users DROP COLUMN IF EXISTS messaging_opt_in`.execute(db);
  await sql`ALTER TABLE users DROP COLUMN IF EXISTS messaging_opt_in_date`.execute(db);

  // Restore profiles
  await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS structured JSONB`.execute(db);

  // Restore fitness_plans
  await sql`DROP INDEX IF EXISTS idx_fitness_plans_user_latest`.execute(db);
  await sql`UPDATE fitness_plans SET description = content WHERE content IS NOT NULL`.execute(db);
  await sql`ALTER TABLE fitness_plans DROP COLUMN IF EXISTS content`.execute(db);

  // Restore microcycles
  await sql`DROP INDEX IF EXISTS idx_microcycles_user_latest`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_microcycles_user_date`.execute(db);
  await sql`UPDATE microcycles SET description = content WHERE content IS NOT NULL`.execute(db);
  await sql`ALTER TABLE microcycles DROP COLUMN IF EXISTS content`.execute(db);
  await sql`ALTER TABLE microcycles DROP COLUMN IF EXISTS plan_id`.execute(db);

  // Restore agent_logs
  await sql`ALTER TABLE agent_logs ADD COLUMN IF NOT EXISTS eval_result JSONB`.execute(db);
  await sql`ALTER TABLE agent_logs ADD COLUMN IF NOT EXISTS eval_score NUMERIC(5,2)`.execute(db);

  // Restore workout_instances columns
  await sql`DROP INDEX IF EXISTS idx_workout_instances_user_id`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_workout_instances_user_date`.execute(db);
  await sql`ALTER TABLE workout_instances DROP CONSTRAINT IF EXISTS workout_instances_user_id_date_unique`.execute(db);
  await sql`ALTER TABLE workout_instances ALTER COLUMN details SET NOT NULL`.execute(db);
  await sql`ALTER TABLE workout_instances ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}'`.execute(db);
  await sql`ALTER TABLE workout_instances ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ`.execute(db);
  await sql`ALTER TABLE workout_instances ADD COLUMN IF NOT EXISTS structured JSONB`.execute(db);
  await sql`ALTER TABLE workout_instances ADD COLUMN IF NOT EXISTS reasoning TEXT`.execute(db);
  await sql`ALTER TABLE workout_instances ADD COLUMN IF NOT EXISTS description TEXT`.execute(db);
  await sql`ALTER TABLE workout_instances ADD COLUMN IF NOT EXISTS goal TEXT`.execute(db);
  await sql`ALTER TABLE workout_instances ADD COLUMN IF NOT EXISTS session_type VARCHAR(50)`.execute(db);
  await sql`ALTER TABLE workout_instances ADD COLUMN IF NOT EXISTS microcycle_id UUID REFERENCES microcycles(id) ON DELETE SET NULL`.execute(db);
  await sql`ALTER TABLE workout_instances RENAME COLUMN user_id TO client_id`.execute(db);

  console.log('Rollback complete!');
};
