import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  // Backfill messaging opt-in for existing users
  await sql`
    UPDATE users
    SET messaging_opt_in = true, messaging_opt_in_date = created_at
    WHERE messaging_opt_in IS NULL
  `.execute(db);

  // Add message_type column to messages table
  await sql`
    ALTER TABLE messages ADD COLUMN message_type VARCHAR(20) NOT NULL DEFAULT 'conversation'
  `.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql`
    ALTER TABLE messages DROP COLUMN message_type
  `.execute(db);
  // Backfill revert is a no-op: we can't determine which users originally had NULL consent
}
