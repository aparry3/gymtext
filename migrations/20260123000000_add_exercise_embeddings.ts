import { Kysely, sql } from 'kysely';

/**
 * Add Exercise Embeddings Migration
 *
 * Enables vector-based semantic search and fuzzy trigram matching for exercises:
 * - pgvector extension + embedding column on exercises table
 * - pg_trgm extension + GIN index on exercise_aliases for fuzzy matching
 */

export async function up(db: Kysely<unknown>): Promise<void> {
  // Vector support for semantic search
  await sql`CREATE EXTENSION IF NOT EXISTS vector`.execute(db);
  await sql`ALTER TABLE exercises ADD COLUMN embedding vector(1536)`.execute(db);
  await sql`CREATE INDEX idx_exercises_embedding ON exercises USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)`.execute(db);

  // Trigram support for fuzzy search
  await sql`CREATE EXTENSION IF NOT EXISTS pg_trgm`.execute(db);
  await sql`CREATE INDEX idx_exercise_aliases_trgm ON exercise_aliases USING gin (alias_normalized gin_trgm_ops)`.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql`DROP INDEX IF EXISTS idx_exercise_aliases_trgm`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_exercises_embedding`.execute(db);
  await sql`ALTER TABLE exercises DROP COLUMN IF EXISTS embedding`.execute(db);
  // Note: Extensions are left in place as other tables may use them
}
