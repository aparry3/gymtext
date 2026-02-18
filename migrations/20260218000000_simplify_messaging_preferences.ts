import { Kysely, sql } from 'kysely';

/**
 * Simplify messaging preferences in users table.
 *
 * Consolidates WhatsApp-specific opt-in fields to general messaging opt-in fields
 * since users can only use one provider (Twilio SMS or WhatsApp) at a time.
 *
 * Changes:
 * - Rename whatsapp_opt_in -> messaging_opt_in
 * - Rename whatsapp_opt_in_date -> messaging_opt_in_date
 * - Remove whatsapp_number (phoneNumber already exists)
 */

export async function up(db: Kysely<unknown>): Promise<void> {
  console.log('Simplifying messaging preferences in users table...');

  // Rename columns
  await sql`
    ALTER TABLE users
    RENAME COLUMN whatsapp_opt_in TO messaging_opt_in
  `.execute(db);

  await sql`
    ALTER TABLE users
    RENAME COLUMN whatsapp_opt_in_date TO messaging_opt_in_date
  `.execute(db);

  // Drop the whatsapp_number column (phoneNumber already exists)
  await sql`
    ALTER TABLE users
    DROP COLUMN IF EXISTS whatsapp_number
  `.execute(db);

  // Drop old index and create new one
  await sql`DROP INDEX IF EXISTS users_whatsapp_opt_in_idx`.execute(db);

  await sql`
    CREATE INDEX IF NOT EXISTS users_messaging_opt_in_idx
    ON users(messaging_opt_in)
    WHERE messaging_opt_in = TRUE
  `.execute(db);

  console.log('Done simplifying messaging preferences.');
}

export async function down(db: Kysely<unknown>): Promise<void> {
  console.log('Reverting messaging preferences simplification...');

  // Rename columns back
  await sql`
    ALTER TABLE users
    RENAME COLUMN messaging_opt_in TO whatsapp_opt_in
  `.execute(db);

  await sql`
    ALTER TABLE users
    RENAME COLUMN messaging_opt_in_date TO whatsapp_opt_in_date
  `.execute(db);

  // Re-add whatsapp_number column
  await sql`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(20)
  `.execute(db);

  // Restore old index
  await sql`DROP INDEX IF EXISTS users_messaging_opt_in_idx`.execute(db);

  await sql`
    CREATE INDEX IF NOT EXISTS users_whatsapp_opt_in_idx
    ON users(whatsapp_opt_in)
    WHERE whatsapp_opt_in = TRUE
  `.execute(db);

  console.log('Done reverting messaging preferences.');
}
