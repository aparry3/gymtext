import { Kysely, sql } from 'kysely';

/**
 * Message Queues Refactoring Migration
 *
 * This migration refactors the message_queues table for the new architecture:
 * - Message content is stored in messages table at enqueue time (not send time)
 * - Queue only references message_id (no longer stores content)
 * - Status tracking moves primarily to messages table
 *
 * Changes:
 * 1. Make message_id required (no longer nullable)
 * 2. Remove message_content (content now in messages only)
 * 3. Remove media_urls (in messages.metadata)
 * 4. Remove timeout_minutes (unused)
 * 5. Remove sent_at, delivered_at (status tracked on messages)
 * 6. Update status constraint to: pending | processing | completed | failed
 * 7. Add processed_at for metrics
 */

export async function up(db: Kysely<unknown>): Promise<void> {
  console.log('Starting message_queues refactoring migration...');

  // Step 1: Add new columns first
  await sql`
    ALTER TABLE message_queues
    ADD COLUMN IF NOT EXISTS processed_at timestamptz
  `.execute(db);

  console.log('Added processed_at column');

  // Step 2: Drop the old status constraint
  await sql`
    ALTER TABLE message_queues
    DROP CONSTRAINT IF EXISTS message_queues_status_check
  `.execute(db);

  console.log('Dropped old status constraint');

  // Step 3: Migrate existing data
  // - Convert 'sent' to 'processing'
  // - Convert 'delivered' to 'completed'
  // - 'pending' and 'failed' stay the same
  await sql`
    UPDATE message_queues
    SET status = CASE
      WHEN status = 'sent' THEN 'processing'
      WHEN status = 'delivered' THEN 'completed'
      ELSE status
    END
  `.execute(db);

  console.log('Migrated existing status values');

  // Step 4: Add new status constraint
  await sql`
    ALTER TABLE message_queues
    ADD CONSTRAINT message_queues_status_check
    CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
  `.execute(db);

  console.log('Added new status constraint');

  // Step 5: Clean up rows where message_id is null (orphaned entries)
  // These are queue entries that were never linked to actual messages
  const deletedRows = await sql`
    DELETE FROM message_queues
    WHERE message_id IS NULL
    RETURNING id
  `.execute(db);

  console.log(`Deleted ${deletedRows.rows.length} orphaned queue entries (null message_id)`);

  // Step 6: Make message_id required
  await sql`
    ALTER TABLE message_queues
    ALTER COLUMN message_id SET NOT NULL
  `.execute(db);

  console.log('Made message_id required');

  // Step 7: Drop columns that are now redundant
  await sql`
    ALTER TABLE message_queues
    DROP COLUMN IF EXISTS message_content,
    DROP COLUMN IF EXISTS media_urls,
    DROP COLUMN IF EXISTS timeout_minutes,
    DROP COLUMN IF EXISTS sent_at,
    DROP COLUMN IF EXISTS delivered_at
  `.execute(db);

  console.log('Dropped redundant columns (message_content, media_urls, timeout_minutes, sent_at, delivered_at)');

  // Step 8: Update messages.delivery_status constraint if needed
  // First check if the constraint exists and what it allows
  // We want to ensure 'cancelled' is allowed
  await sql`
    DO $$
    BEGIN
      -- Check if there's an existing constraint on delivery_status
      IF EXISTS (
        SELECT 1 FROM pg_constraint c
        JOIN pg_attribute a ON a.attnum = ANY(c.conkey)
        JOIN pg_class t ON t.oid = c.conrelid
        WHERE t.relname = 'messages'
        AND a.attname = 'delivery_status'
        AND c.contype = 'c'
      ) THEN
        -- Drop the existing constraint
        ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_delivery_status_check;
      END IF;
    END $$;
  `.execute(db);

  // Add new constraint with cancelled status
  await sql`
    ALTER TABLE messages
    ADD CONSTRAINT messages_delivery_status_check
    CHECK (delivery_status IN ('pending', 'queued', 'sent', 'delivered', 'failed', 'undelivered', 'cancelled'))
  `.execute(db);

  console.log('Updated messages.delivery_status constraint to include cancelled');

  console.log('Message queues refactoring migration complete!');
}

export async function down(db: Kysely<unknown>): Promise<void> {
  console.log('Rolling back message_queues refactoring...');

  // Step 1: Drop the new status constraint
  await sql`
    ALTER TABLE message_queues
    DROP CONSTRAINT IF EXISTS message_queues_status_check
  `.execute(db);

  // Step 2: Migrate status back
  await sql`
    UPDATE message_queues
    SET status = CASE
      WHEN status = 'processing' THEN 'sent'
      WHEN status = 'completed' THEN 'delivered'
      ELSE status
    END
  `.execute(db);

  // Step 3: Add original status constraint
  await sql`
    ALTER TABLE message_queues
    ADD CONSTRAINT message_queues_status_check
    CHECK (status IN ('pending', 'sent', 'delivered', 'failed'))
  `.execute(db);

  // Step 4: Make message_id nullable again
  await sql`
    ALTER TABLE message_queues
    ALTER COLUMN message_id DROP NOT NULL
  `.execute(db);

  // Step 5: Add back removed columns
  await sql`
    ALTER TABLE message_queues
    ADD COLUMN IF NOT EXISTS message_content text,
    ADD COLUMN IF NOT EXISTS media_urls jsonb,
    ADD COLUMN IF NOT EXISTS timeout_minutes integer NOT NULL DEFAULT 10,
    ADD COLUMN IF NOT EXISTS sent_at timestamptz,
    ADD COLUMN IF NOT EXISTS delivered_at timestamptz
  `.execute(db);

  // Step 6: Drop processed_at
  await sql`
    ALTER TABLE message_queues
    DROP COLUMN IF EXISTS processed_at
  `.execute(db);

  // Step 7: Restore messages constraint without cancelled
  await sql`
    ALTER TABLE messages
    DROP CONSTRAINT IF EXISTS messages_delivery_status_check
  `.execute(db);

  console.log('Rollback complete');
}
