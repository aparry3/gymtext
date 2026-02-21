import { Kysely, sql } from 'kysely';

/**
 * Add WhatsApp support to users table.
 *
 * Adds messaging preference fields to allow users to opt-in to WhatsApp
 * messaging and set their preferred messaging provider.
 */

export async function up(db: Kysely<unknown>): Promise<void> {
  console.log('Adding WhatsApp support fields to users table...');

  // Add WhatsApp-related fields to users table
  await sql`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS preferred_messaging_provider VARCHAR(20) DEFAULT 'twilio',
    ADD COLUMN IF NOT EXISTS whatsapp_opt_in BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS whatsapp_opt_in_date TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(20)
  `.execute(db);

  // Add index for provider field in messages table (for analytics/filtering)
  await sql`
    CREATE INDEX IF NOT EXISTS messages_provider_idx
    ON messages(provider)
  `.execute(db);

  // Add index for WhatsApp opt-in users (for targeted queries)
  await sql`
    CREATE INDEX IF NOT EXISTS users_whatsapp_opt_in_idx
    ON users(whatsapp_opt_in)
    WHERE whatsapp_opt_in = TRUE
  `.execute(db);

  console.log('Done adding WhatsApp support.');
}

export async function down(db: Kysely<unknown>): Promise<void> {
  console.log('Removing WhatsApp support fields from users table...');

  // Remove indexes
  await sql`DROP INDEX IF EXISTS users_whatsapp_opt_in_idx`.execute(db);
  await sql`DROP INDEX IF EXISTS messages_provider_idx`.execute(db);

  // Remove columns from users table
  await sql`
    ALTER TABLE users
    DROP COLUMN IF EXISTS preferred_messaging_provider,
    DROP COLUMN IF EXISTS whatsapp_opt_in,
    DROP COLUMN IF EXISTS whatsapp_opt_in_date,
    DROP COLUMN IF EXISTS whatsapp_number
  `.execute(db);

  console.log('Done removing WhatsApp support.');
}
