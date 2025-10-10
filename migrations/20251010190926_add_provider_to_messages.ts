import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Add provider column to messages table
  await db.schema
    .alterTable('messages')
    .addColumn('provider', 'varchar(20)', (col) =>
      col.notNull().defaultTo('twilio').check(sql`provider IN ('twilio', 'local', 'websocket')`)
    )
    .execute();

  // Rename twilio_message_sid to provider_message_id for generic usage
  await sql`ALTER TABLE messages RENAME COLUMN twilio_message_sid TO provider_message_id`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  // Rename provider_message_id back to twilio_message_sid
  await sql`ALTER TABLE messages RENAME COLUMN provider_message_id TO twilio_message_sid`.execute(db);

  // Drop provider column
  await db.schema
    .alterTable('messages')
    .dropColumn('provider')
    .execute();
}
