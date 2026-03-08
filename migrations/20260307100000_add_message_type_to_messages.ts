import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`
    ALTER TABLE messages ADD COLUMN message_type VARCHAR(20) NOT NULL DEFAULT 'conversation'
  `.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql`
    ALTER TABLE messages DROP COLUMN message_type
  `.execute(db);
}
