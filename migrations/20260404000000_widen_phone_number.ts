import { type Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`ALTER TABLE users ALTER COLUMN phone_number TYPE varchar(50)`.execute(db);
  await sql`ALTER TABLE messages ALTER COLUMN phone_from TYPE varchar(50)`.execute(db);
  await sql`ALTER TABLE messages ALTER COLUMN phone_to TYPE varchar(50)`.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql`ALTER TABLE users ALTER COLUMN phone_number TYPE varchar(20)`.execute(db);
  await sql`ALTER TABLE messages ALTER COLUMN phone_from TYPE varchar(20)`.execute(db);
  await sql`ALTER TABLE messages ALTER COLUMN phone_to TYPE varchar(20)`.execute(db);
}
