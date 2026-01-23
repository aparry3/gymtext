import { Kysely, sql } from 'kysely';

/**
 * Add alias_searchable Generated Column
 *
 * Adds a stored generated column on exercise_aliases that strips everything
 * except lowercase a-z, enabling normalized text search (e.g. "situp" matches "Sit-Up").
 * Also adds a GIN trigram index on the new column for efficient ILIKE queries.
 */

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`
    ALTER TABLE exercise_aliases
    ADD COLUMN alias_searchable varchar(200)
    GENERATED ALWAYS AS (regexp_replace(lower(alias), '[^a-z]', '', 'g')) STORED
  `.execute(db);

  await sql`
    CREATE INDEX idx_exercise_aliases_searchable_trgm
    ON exercise_aliases USING gin (alias_searchable gin_trgm_ops)
  `.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql`DROP INDEX IF EXISTS idx_exercise_aliases_searchable_trgm`.execute(db);
  await sql`ALTER TABLE exercise_aliases DROP COLUMN IF EXISTS alias_searchable`.execute(db);
}
