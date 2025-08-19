import { Kysely, sql } from 'kysely';
import { DB } from '../src/server/models/_types';

export async function up(db: Kysely<DB>): Promise<void> {
  // Create function to update conversation when message is inserted
  await sql`
    CREATE OR REPLACE FUNCTION update_conversation_last_message()
    RETURNS TRIGGER AS $$
    BEGIN
      UPDATE conversations 
      SET last_message_at = NEW.created_at,
          message_count = message_count + 1,
          updated_at = NOW()
      WHERE id = NEW.conversation_id;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `.execute(db);

  // Create trigger for new messages
  await sql`
    CREATE TRIGGER update_conversation_on_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_last_message();
  `.execute(db);

  // Create function to update updated_at timestamp
  await sql`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `.execute(db);

  // Create trigger for conversations updated_at
  await sql`
    CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `.execute(db);
}

export async function down(db: Kysely<DB>): Promise<void> {
  // Drop triggers
  await sql`DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;`.execute(db);
  await sql`DROP TRIGGER IF EXISTS update_conversation_on_message ON messages;`.execute(db);
  
  // Drop functions
  await sql`DROP FUNCTION IF EXISTS update_updated_at_column();`.execute(db);
  await sql`DROP FUNCTION IF EXISTS update_conversation_last_message();`.execute(db);
}
