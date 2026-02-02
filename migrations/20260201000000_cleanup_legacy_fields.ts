import { Kysely, sql } from 'kysely';

/**
 * Cleanup legacy database fields
 *
 * This migration:
 * 1. Removes the orphaned conversation_id column from messages table
 * 2. Consolidates legacyClientId to clientId in fitness_plans table
 *
 * The conversation_id column was orphaned when the conversations table was removed.
 * The legacyClientId column was a temporary backward-compatibility field that
 * duplicated the clientId field.
 */

export async function up(db: Kysely<unknown>): Promise<void> {
  console.log('Starting legacy field cleanup migration...');

  // 1. Remove orphaned conversation_id from messages
  console.log('Removing conversation_id column from messages table...');
  await db.schema.alterTable('messages').dropColumn('conversation_id').execute();
  console.log('Removed conversation_id column from messages table');

  // 2. Consolidate legacyClientId to clientId in fitness_plans
  console.log('Consolidating legacyClientId to clientId in fitness_plans...');

  // Copy legacyClientId to clientId where clientId is null
  await sql`UPDATE fitness_plans SET client_id = legacy_client_id WHERE client_id IS NULL`.execute(db);
  console.log('Copied legacyClientId values to clientId where needed');

  // Make clientId NOT NULL
  await db.schema.alterTable('fitness_plans')
    .alterColumn('client_id', (col) => col.setNotNull())
    .execute();
  console.log('Set clientId as NOT NULL');

  // Drop legacyClientId column
  await db.schema.alterTable('fitness_plans').dropColumn('legacy_client_id').execute();
  console.log('Dropped legacyClientId column');

  console.log('Migration complete!');
}

export async function down(db: Kysely<unknown>): Promise<void> {
  console.log('Starting rollback of legacy field cleanup...');

  // 1. Re-add conversation_id to messages
  console.log('Re-adding conversation_id column to messages table...');
  await db.schema
    .alterTable('messages')
    .addColumn('conversation_id', 'uuid')
    .execute();
  console.log('Re-added conversation_id column');

  // 2. Re-add legacyClientId to fitness_plans
  console.log('Re-adding legacy_client_id column to fitness_plans...');
  await db.schema
    .alterTable('fitness_plans')
    .addColumn('legacy_client_id', 'uuid', (col) => col.notNull())
    .execute();

  // Copy clientId back to legacyClientId
  await sql`UPDATE fitness_plans SET legacy_client_id = client_id`.execute(db);
  console.log('Copied clientId values to legacyClientId');

  // Make clientId nullable again
  await db.schema.alterTable('fitness_plans')
    .alterColumn('client_id', (col) => col.dropNotNull())
    .execute();
  console.log('Set clientId as nullable');

  console.log('Rollback complete!');
}
