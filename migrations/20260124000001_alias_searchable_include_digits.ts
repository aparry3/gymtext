import { Kysely, sql } from 'kysely';

/**
 * Update alias_searchable to Include Digits
 *
 * The previous generated column stripped all non-alpha characters ([^a-z]),
 * which meant exercises like "3/4 Sit-Up" lost their numeric identifiers.
 * This migration recreates the column with [^a-z0-9] to preserve digits.
 *
 * PostgreSQL doesn't allow altering a generated column's expression,
 * so we drop and recreate it.
 */

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`DROP INDEX IF EXISTS idx_exercise_aliases_searchable_trgm`.execute(db);

  await sql`ALTER TABLE exercise_aliases DROP COLUMN alias_searchable`.execute(db);

  await sql`
    ALTER TABLE exercise_aliases
    ADD COLUMN alias_searchable varchar(200)
    GENERATED ALWAYS AS (regexp_replace(lower(alias), '[^a-z0-9]', '', 'g')) STORED
  `.execute(db);

  await sql`
    CREATE INDEX idx_exercise_aliases_searchable_trgm
    ON exercise_aliases USING gin (alias_searchable gin_trgm_ops)
  `.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql`DROP INDEX IF EXISTS idx_exercise_aliases_searchable_trgm`.execute(db);

  await sql`ALTER TABLE exercise_aliases DROP COLUMN alias_searchable`.execute(db);

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
