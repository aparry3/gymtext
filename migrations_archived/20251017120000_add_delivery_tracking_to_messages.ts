import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Add delivery tracking columns to messages table
  await db.schema
    .alterTable('messages')
    .addColumn('delivery_status', 'varchar(20)', (col) =>
      col.notNull().defaultTo('queued').check(
        sql`delivery_status IN ('queued', 'sent', 'delivered', 'failed', 'undelivered')`
      )
    )
    .addColumn('delivery_attempts', 'integer', (col) =>
      col.notNull().defaultTo(1)
    )
    .addColumn('last_delivery_attempt_at', 'timestamptz', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .addColumn('delivery_error', 'text')
    .execute();

  // Add index on provider_message_id for fast lookups by Twilio SID
  await db.schema
    .createIndex('messages_provider_message_id_idx')
    .on('messages')
    .column('provider_message_id')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop index
  await db.schema
    .dropIndex('messages_provider_message_id_idx')
    .execute();

  // Drop delivery tracking columns
  await db.schema
    .alterTable('messages')
    .dropColumn('delivery_status')
    .dropColumn('delivery_attempts')
    .dropColumn('last_delivery_attempt_at')
    .dropColumn('delivery_error')
    .execute();
}
