import { Kysely, sql } from 'kysely';

/**
 * Add slug to program_owners
 *
 * Adds a unique slug field to program_owners for public landing page URLs.
 * Pattern: /o/[slug] (e.g., /o/pat-clatchey)
 */

export async function up(db: Kysely<unknown>): Promise<void> {
  console.log('Starting program owner slug migration...');

  // Add slug column to program_owners
  console.log('Adding slug column to program_owners...');
  await sql`
    ALTER TABLE program_owners
    ADD COLUMN IF NOT EXISTS slug VARCHAR(200)
  `.execute(db);

  // Create unique partial index on slug (where slug is not null)
  console.log('Creating unique index on program_owners.slug...');
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_program_owners_slug
    ON program_owners (slug)
    WHERE slug IS NOT NULL
  `.execute(db);

  console.log('Program owner slug migration complete!');
}

export async function down(db: Kysely<unknown>): Promise<void> {
  console.log('Rolling back program owner slug migration...');

  // Remove slug index
  console.log('Removing slug index from program_owners...');
  await sql`
    DROP INDEX IF EXISTS idx_program_owners_slug
  `.execute(db);

  // Remove slug column
  console.log('Removing slug column from program_owners...');
  await sql`
    ALTER TABLE program_owners
    DROP COLUMN IF EXISTS slug
  `.execute(db);

  console.log('Program owner slug rollback complete!');
}
