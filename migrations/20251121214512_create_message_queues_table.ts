import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Create message_queues table for ordered message delivery
  await db.schema
    .createTable('message_queues')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('user_id', 'uuid', (col) =>
      col.notNull().references('users.id').onDelete('cascade')
    )
    .addColumn('queue_name', 'varchar(50)', (col) => col.notNull())
    .addColumn('sequence_number', 'integer', (col) => col.notNull())
    .addColumn('message_content', 'text')
    .addColumn('media_urls', 'jsonb')
    .addColumn('status', 'varchar(20)', (col) =>
      col.notNull().defaultTo('pending').check(
        sql`status IN ('pending', 'sent', 'delivered', 'failed')`
      )
    )
    .addColumn('message_id', 'uuid', (col) =>
      col.references('messages.id').onDelete('set null')
    )
    .addColumn('retry_count', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('max_retries', 'integer', (col) => col.notNull().defaultTo(3))
    .addColumn('timeout_minutes', 'integer', (col) => col.notNull().defaultTo(10))
    .addColumn('error_message', 'text')
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('sent_at', 'timestamptz')
    .addColumn('delivered_at', 'timestamptz')
    .execute();

  // Create indexes for efficient queue processing
  await db.schema
    .createIndex('message_queues_user_queue_sequence_idx')
    .on('message_queues')
    .columns(['user_id', 'queue_name', 'sequence_number'])
    .execute();

  await db.schema
    .createIndex('message_queues_user_status_idx')
    .on('message_queues')
    .columns(['user_id', 'status'])
    .execute();

  // Index for finding queue entries by message_id (for webhook lookup)
  await db.schema
    .createIndex('message_queues_message_id_idx')
    .on('message_queues')
    .column('message_id')
    .execute();

  // Index for finding stalled messages
  await db.schema
    .createIndex('message_queues_sent_at_status_idx')
    .on('message_queues')
    .columns(['sent_at', 'status'])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop indexes
  await db.schema.dropIndex('message_queues_sent_at_status_idx').execute();
  await db.schema.dropIndex('message_queues_message_id_idx').execute();
  await db.schema.dropIndex('message_queues_user_status_idx').execute();
  await db.schema.dropIndex('message_queues_user_queue_sequence_idx').execute();

  // Drop table
  await db.schema.dropTable('message_queues').execute();
}
