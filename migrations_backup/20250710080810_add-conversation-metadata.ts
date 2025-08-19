import { Kysely, sql } from 'kysely';
import { DB } from '../src/server/models/_types';

export async function up(db: Kysely<DB>): Promise<void> {
  // Create conversation topics table
  await db.schema
    .createTable('conversation_topics')
    .addColumn('id', 'uuid', (col) => 
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('conversation_id', 'uuid', (col) => 
      col.references('conversations.id').onDelete('cascade').notNull()
    )
    .addColumn('topic', 'varchar(100)', (col) => col.notNull())
    .addColumn('confidence', 'real', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => 
      col.notNull().defaultTo(sql`now()`)
    )
    .execute();

  // Create index for conversation topics
  await db.schema
    .createIndex('idx_conversation_topics_conversation_id')
    .on('conversation_topics')
    .column('conversation_id')
    .execute();

  // Create composite index for topic lookups
  await db.schema
    .createIndex('idx_conversation_topics_topic')
    .on('conversation_topics')
    .columns(['topic', 'confidence'])
    .execute();
}

export async function down(db: Kysely<DB>): Promise<void> {
  // Drop indexes
  await db.schema.dropIndex('idx_conversation_topics_topic').execute();
  await db.schema.dropIndex('idx_conversation_topics_conversation_id').execute();
  
  // Drop table
  await db.schema.dropTable('conversation_topics').execute();
}
