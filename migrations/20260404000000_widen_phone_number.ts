import { type Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`ALTER TABLE users ALTER COLUMN phone_number TYPE varchar(50)`.execute(db);
  await sql`ALTER TABLE messages ALTER COLUMN phone_from TYPE varchar(50)`.execute(db);
  await sql`ALTER TABLE messages ALTER COLUMN phone_to TYPE varchar(50)`.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  // Delete admin test data with oversized phones before shrinking columns
  await sql`DELETE FROM messages WHERE length(phone_from) > 20 OR length(phone_to) > 20`.execute(db);
  await sql`DELETE FROM users WHERE length(phone_number) > 20`.execute(db);
  await sql`ALTER TABLE users ALTER COLUMN phone_number TYPE varchar(20)`.execute(db);
  await sql`ALTER TABLE messages ALTER COLUMN phone_from TYPE varchar(20)`.execute(db);
  await sql`ALTER TABLE messages ALTER COLUMN phone_to TYPE varchar(20)`.execute(db);
}
