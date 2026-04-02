import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  // Add logoUrl and subheader to programs table for program-specific branding
  await sql`
    ALTER TABLE programs ADD COLUMN logo_url TEXT
  `.execute(db);

  await sql`
    ALTER TABLE programs ADD COLUMN subheader TEXT
  `.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql`
    ALTER TABLE programs DROP COLUMN subheader
  `.execute(db);

  await sql`
    ALTER TABLE programs DROP COLUMN logo_url
  `.execute(db);
}
