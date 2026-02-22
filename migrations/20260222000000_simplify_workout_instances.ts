/**
 * Simplify workout_instances table
 *
 * - Keep: id, user_id, date, created_at, updated_at
 * - Add: message (TEXT - from workout:format agent)
 * - Add: structure (JSONB - from workout:structured agent)
 * - Remove: microcycle_id, session_type, description, goal, reasoning, details, tags, completed_at
 */
import { sql } from 'kysely';
import { postgresDb } from '@/server/connections/postgres/postgres';

const db = postgresDb;

/**
 * Simplify workout_instances table by dropping and recreating with simplified schema
 */
export async function up(): Promise<void> {
  console.log('Simplifying workout_instances table...');

  // Drop the table if it exists (we're simplifying the schema)
  await sql`DROP TABLE IF EXISTS workout_instances CASCADE`.execute(db);

  // Create simplified table
  await sql`
    CREATE TABLE workout_instances (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id),
      date DATE NOT NULL,
      message TEXT,
      structure JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (user_id, date)
    )
  `.execute(db);

  // Create index for user_id lookups
  await sql`CREATE INDEX idx_workout_instances_user_id ON workout_instances (user_id)`.execute(db);

  console.log('Simplified workout_instances table created.');
}

/**
 * Restore original workout_instances table (rollback)
 */
export async function down(): Promise<void> {
  console.log('Reverting workout_instances table...');

  // Drop simplified table
  await sql`DROP TABLE IF EXISTS workout_instances CASCADE`.execute(db);

  // Recreate original table (from 20260217200000_drop_unused_tables.ts)
  await sql`
    CREATE TABLE workout_instances (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      client_id UUID NOT NULL REFERENCES users(id),
      microcycle_id UUID REFERENCES microcycles(id),
      date DATE NOT NULL,
      session_type TEXT NOT NULL,
      description TEXT,
      goal TEXT,
      reasoning TEXT,
      message TEXT,
      details JSONB NOT NULL DEFAULT '{}',
      structured JSONB,
      tags TEXT[] NOT NULL DEFAULT '{}',
      completed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `.execute(db);

  await sql`CREATE INDEX idx_workout_instances_tags ON workout_instances USING GIN (tags)`.execute(db);

  console.log('Original workout_instances table restored.');
}
