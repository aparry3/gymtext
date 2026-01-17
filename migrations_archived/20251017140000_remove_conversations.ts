import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  console.log('Starting migration: remove conversations');

  // Step 1: Drop conversation_topics table (references conversations)
  await db.schema.dropTable('conversation_topics').ifExists().execute();
  console.log('Dropped conversation_topics table');

  // Step 2: Drop foreign key constraint from messages.conversation_id
  // Note: We need to drop the constraint before we can drop the conversations table
  await sql`
    ALTER TABLE messages
    DROP CONSTRAINT IF EXISTS messages_conversation_id_fkey
  `.execute(db);
  console.log('Dropped messages.conversation_id foreign key constraint');

  // Step 3: Drop the conversations table
  await db.schema.dropTable('conversations').ifExists().execute();
  console.log('Dropped conversations table');

  // Step 4: Make conversation_id nullable (for backward compatibility with existing data)
  // In a future migration, we could remove this column entirely
  await sql`
    ALTER TABLE messages
    ALTER COLUMN conversation_id DROP NOT NULL
  `.execute(db);
  console.log('Made messages.conversation_id nullable');

  // Step 5: Add index on messages (user_id, created_at) for efficient querying
  await sql`
    CREATE INDEX IF NOT EXISTS idx_messages_user_created
    ON messages (user_id, created_at DESC)
  `.execute(db);
  console.log('Created index on messages (user_id, created_at)');

  console.log('Migration complete: remove conversations');
}

export async function down(db: Kysely<any>): Promise<void> {
  console.log('Rolling back migration: remove conversations');

  // Step 1: Drop the index we created
  await sql`DROP INDEX IF EXISTS idx_messages_user_created`.execute(db);
  console.log('Dropped index idx_messages_user_created');

  // Step 2: Recreate conversations table
  await db.schema
    .createTable('conversations')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('user_id', 'uuid', (col) => col.references('users.id').onDelete('cascade').notNull())
    .addColumn('started_at', 'timestamptz', (col) => col.notNull())
    .addColumn('last_message_at', 'timestamptz', (col) => col.notNull())
    .addColumn('status', 'varchar(20)', (col) =>
      col.notNull().defaultTo('active').check(sql`status IN ('active', 'inactive', 'archived')`)
    )
    .addColumn('message_count', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('metadata', 'jsonb', (col) => col.defaultTo(sql`'{}'::jsonb`))
    .addColumn('summary', 'text')
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();
  console.log('Recreated conversations table');

  // Step 3: Recreate trigger for conversations updated_at
  await sql`
    CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `.execute(db);
  console.log('Recreated conversations trigger');

  // Step 4: Recreate conversation_topics table
  await db.schema
    .createTable('conversation_topics')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('conversation_id', 'uuid', (col) =>
      col.references('conversations.id').onDelete('cascade').notNull()
    )
    .addColumn('topic', 'varchar(100)', (col) => col.notNull())
    .addColumn('confidence', 'real', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();
  console.log('Recreated conversation_topics table');

  // Step 5: Make conversation_id NOT NULL again (this will fail if there are null values)
  // Note: This is a risky operation - in production you'd want to handle this more carefully
  await sql`
    ALTER TABLE messages
    ALTER COLUMN conversation_id SET NOT NULL
  `.execute(db);
  console.log('Made messages.conversation_id NOT NULL');

  // Step 6: Recreate foreign key constraint
  await sql`
    ALTER TABLE messages
    ADD CONSTRAINT messages_conversation_id_fkey
    FOREIGN KEY (conversation_id)
    REFERENCES conversations(id)
    ON DELETE CASCADE
  `.execute(db);
  console.log('Recreated messages.conversation_id foreign key constraint');

  console.log('Rollback complete: remove conversations');
}
