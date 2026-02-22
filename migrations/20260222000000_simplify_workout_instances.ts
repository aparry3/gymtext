/**
 * Simplify workout_instances table
 *
 * - Keep: id, user_id, date, created_at, updated_at
 * - Add: message (TEXT - from workout:format agent)
 * - Add: structure (JSONB - from workout:structured agent)
 * - Remove: microcycle_id, session_type, description, goal, reasoning, details, tags, completed_at
 *
 * IMPORTANT: This migration now migrates existing data instead of dropping the table.
 */
import { sql } from 'kysely';
import { postgresDb } from '@/server/connections/postgres/postgres';

const db = postgresDb;

/**
 * Simplify workout_instances table by migrating data to new schema
 */
export async function up(): Promise<void> {
  console.log('Simplifying workout_instances table (with data migration)...');

  // Step 1: Add new columns that don't exist in the old schema
  console.log('  Adding new columns...');
  
  // Add user_id column (will copy from client_id)
  await sql`ALTER TABLE workout_instances ADD COLUMN IF NOT EXISTS user_id UUID`.execute(db);
  
  // Add structure column (will copy from details or structured)
  await sql`ALTER TABLE workout_instances ADD COLUMN IF NOT EXISTS structure JSONB`.execute(db);

  // Step 2: Migrate existing data
  console.log('  Migrating existing data...');
  
  // Migrate client_id -> user_id
  await sql`
    UPDATE workout_instances 
    SET user_id = client_id 
    WHERE user_id IS NULL AND client_id IS NOT NULL
  `.execute(db);
  
  // Make user_id not null after data migration
  await sql`ALTER TABLE workout_instances ALTER COLUMN user_id SET NOT NULL`.execute(db);

  // Migrate: prefer structured if it has data, otherwise use details
  // First, migrate details to structure where structure is null and details is not null/empty
  await sql`
    UPDATE workout_instances 
    SET structure = details::jsonb 
    WHERE structure IS NULL AND details IS NOT NULL AND details != '{}'::jsonb AND details != 'null'::jsonb
  `.execute(db);
  
  // Then, migrate structured to structure where structure is still null and structured is not null
  await sql`
    UPDATE workout_instances 
    SET structure = structured 
    WHERE structure IS NULL AND structured IS NOT NULL
  `.execute(db);

  // Step 3: Drop old columns that are no longer needed
  console.log('  Dropping old columns...');
  
  await sql`ALTER TABLE workout_instances DROP COLUMN IF EXISTS client_id`.execute(db);
  await sql`ALTER TABLE workout_instances DROP COLUMN IF EXISTS microcycle_id`.execute(db);
  await sql`ALTER TABLE workout_instances DROP COLUMN IF EXISTS session_type`.execute(db);
  await sql`ALTER TABLE workout_instances DROP COLUMN IF EXISTS description`.execute(db);
  await sql`ALTER TABLE workout_instances DROP COLUMN IF EXISTS goal`.execute(db);
  await sql`ALTER TABLE workout_instances DROP COLUMN IF EXISTS reasoning`.execute(db);
  await sql`ALTER TABLE workout_instances DROP COLUMN IF EXISTS details`.execute(db);
  await sql`ALTER TABLE workout_instances DROP COLUMN IF EXISTS structured`.execute(db);
  await sql`ALTER TABLE workout_instances DROP COLUMN IF EXISTS tags`.execute(db);
  await sql`ALTER TABLE workout_instances DROP COLUMN IF EXISTS completed_at`.execute(db);

  // Step 4: Recreate index (drop old tags index, create new user_id index)
  console.log('  Updating indexes...');
  await sql`DROP INDEX IF EXISTS idx_workout_instances_tags`.execute(db);
  await sql`CREATE INDEX IF NOT EXISTS idx_workout_instances_user_id ON workout_instances (user_id)`.execute(db);

  console.log('Simplified workout_instances table with data migration complete.');
}

/**
 * Restore original workout_instances table (rollback)
 */
export async function down(): Promise<void> {
  console.log('Reverting workout_instances table...');

  // Step 1: Add back old columns
  console.log('  Adding back old columns...');
  
  await sql`ALTER TABLE workout_instances ADD COLUMN IF NOT EXISTS client_id UUID NOT NULL`.execute(db);
  await sql`ALTER TABLE workout_instances ADD COLUMN IF NOT EXISTS microcycle_id UUID`.execute(db);
  await sql`ALTER TABLE workout_instances ADD COLUMN IF NOT EXISTS session_type TEXT NOT NULL`.execute(db);
  await sql`ALTER TABLE workout_instances ADD COLUMN IF NOT EXISTS description TEXT`.execute(db);
  await sql`ALTER TABLE workout_instances ADD COLUMN IF NOT EXISTS goal TEXT`.execute(db);
  await sql`ALTER TABLE workout_instances ADD COLUMN IF NOT EXISTS reasoning TEXT`.execute(db);
  await sql`ALTER TABLE workout_instances ADD COLUMN IF NOT EXISTS details JSONB NOT NULL DEFAULT '{}'`.execute(db);
  await sql`ALTER TABLE workout_instances ADD COLUMN IF NOT EXISTS structured JSONB`.execute(db);
  await sql`ALTER TABLE workout_instances ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}'`.execute(db);
  await sql`ALTER TABLE workout_instances ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ`.execute(db);

  // Step 2: Migrate data back
  console.log('  Restoring data...');
  
  // Migrate user_id -> client_id
  await sql`
    UPDATE workout_instances 
    SET client_id = user_id 
    WHERE client_id IS NULL AND user_id IS NOT NULL
  `.execute(db);
  
  // Migrate structure -> structured (prefer structured for backward compatibility)
  await sql`
    UPDATE workout_instances 
    SET structured = structure 
    WHERE structured IS NULL AND structure IS NOT NULL
  `.execute(db);
  
  // Also set details from structure
  await sql`
    UPDATE workout_instances 
    SET details = structure::text::jsonb 
    WHERE details = '{}'::jsonb AND structure IS NOT NULL
  `.execute(db);

  // Step 3: Drop new columns
  console.log('  Dropping new columns...');
  
  await sql`ALTER TABLE workout_instances DROP COLUMN IF EXISTS user_id`.execute(db);
  await sql`ALTER TABLE workout_instances DROP COLUMN IF EXISTS structure`.execute(db);

  // Step 4: Recreate old index
  console.log('  Restoring indexes...');
  await sql`DROP INDEX IF EXISTS idx_workout_instances_user_id`.execute(db);
  await sql`CREATE INDEX IF NOT EXISTS idx_workout_instances_tags ON workout_instances USING GIN (tags)`.execute(db);

  console.log('Original workout_instances table restored.');
}
