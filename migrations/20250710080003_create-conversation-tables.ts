import { Kysely, sql } from 'kysely';
import { DB } from '../src/server/models/_types';

export async function up(db: Kysely<DB>): Promise<void> {
  // Create conversations table
  await db.schema
    .createTable('conversations')
    .addColumn('id', 'uuid', (col) => 
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('user_id', 'uuid', (col) => 
      col.references('users.id').onDelete('cascade').notNull()
    )
    .addColumn('started_at', 'timestamptz', (col) => col.notNull())
    .addColumn('last_message_at', 'timestamptz', (col) => col.notNull())
    .addColumn('status', 'varchar(20)', (col) => 
      col.notNull().defaultTo('active').check(sql`status IN ('active', 'inactive', 'archived')`)
    )
    .addColumn('message_count', 'integer', (col) => 
      col.notNull().defaultTo(0)
    )
    .addColumn('metadata', 'jsonb', (col) => col.defaultTo(sql`'{}'::jsonb`))
    .addColumn('created_at', 'timestamptz', (col) => 
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('updated_at', 'timestamptz', (col) => 
      col.notNull().defaultTo(sql`now()`)
    )
    .execute();

  // Create messages table
  await db.schema
    .createTable('messages')
    .addColumn('id', 'uuid', (col) => 
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('conversation_id', 'uuid', (col) => 
      col.references('conversations.id').onDelete('cascade').notNull()
    )
    .addColumn('user_id', 'uuid', (col) => 
      col.references('users.id').onDelete('cascade').notNull()
    )
    .addColumn('direction', 'varchar(10)', (col) => 
      col.notNull().check(sql`direction IN ('inbound', 'outbound')`)
    )
    .addColumn('content', 'text', (col) => col.notNull())
    .addColumn('phone_from', 'varchar(20)', (col) => col.notNull())
    .addColumn('phone_to', 'varchar(20)', (col) => col.notNull())
    .addColumn('twilio_message_sid', 'varchar(100)')
    .addColumn('metadata', 'jsonb', (col) => col.defaultTo(sql`'{}'::jsonb`))
    .addColumn('created_at', 'timestamptz', (col) => 
      col.notNull().defaultTo(sql`now()`)
    )
    .execute();

  // Create indexes
  await db.schema
    .createIndex('idx_conversations_user_id')
    .on('conversations')
    .column('user_id')
    .execute();

  await db.schema
    .createIndex('idx_conversations_last_message_at')
    .on('conversations')
    .column('last_message_at')
    .using('btree')
    .execute();

  await db.schema
    .createIndex('idx_conversations_status')
    .on('conversations')
    .column('status')
    .where('status', '=', 'active')
    .execute();

  await db.schema
    .createIndex('idx_messages_conversation_id')
    .on('messages')
    .column('conversation_id')
    .execute();

  await db.schema
    .createIndex('idx_messages_created_at')
    .on('messages')
    .column('created_at')
    .using('btree')
    .execute();

  await db.schema
    .createIndex('idx_messages_user_id_created_at')
    .on('messages')
    .columns(['user_id', 'created_at'])
    .execute();
}

export async function down(db: Kysely<DB>): Promise<void> {
  // Drop indexes first
  await db.schema.dropIndex('idx_messages_user_id_created_at').execute();
  await db.schema.dropIndex('idx_messages_created_at').execute();
  await db.schema.dropIndex('idx_messages_conversation_id').execute();
  await db.schema.dropIndex('idx_conversations_status').execute();
  await db.schema.dropIndex('idx_conversations_last_message_at').execute();
  await db.schema.dropIndex('idx_conversations_user_id').execute();
  
  // Drop tables
  await db.schema.dropTable('messages').execute();
  await db.schema.dropTable('conversations').execute();
}
