import { Kysely, sql } from 'kysely';

/**
 * Add wordmark_url column to program_owners
 *
 * This allows program owners to have a custom wordmark logo
 * displayed on signup pages for their programs.
 */

export async function up(db: Kysely<unknown>): Promise<void> {
  console.log('Adding wordmark_url column to program_owners...');
  await sql`
    ALTER TABLE program_owners
    ADD COLUMN IF NOT EXISTS wordmark_url TEXT
  `.execute(db);
  console.log('Migration complete!');
}

export async function down(db: Kysely<unknown>): Promise<void> {
  console.log('Removing wordmark_url column from program_owners...');
  await sql`
    ALTER TABLE program_owners
    DROP COLUMN IF EXISTS wordmark_url
  `.execute(db);
  console.log('Rollback complete!');
}
