/**
 * Add details JSONB column to profiles table
 *
 * Stores structured profile data extracted by the profile:details agent
 * for UI display purposes.
 */
import type { Kysely } from 'kysely';
import { sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS details JSONB`.execute(db);
  console.log('Added details column to profiles table');
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql`ALTER TABLE profiles DROP COLUMN IF EXISTS details`.execute(db);
  console.log('Removed details column from profiles table');
}
