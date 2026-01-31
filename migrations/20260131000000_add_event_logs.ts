import { Kysely, sql } from 'kysely';

/**
 * Add event_logs table for tracking application events
 *
 * This table provides a generic event logging system for tracking various
 * application events. Initial use case: workout agent validation failures.
 *
 * The table is designed to be extensible for future events like SMS failures,
 * payment events, etc.
 */

export async function up(db: Kysely<unknown>): Promise<void> {
  console.log('Creating event_logs table...');

  await sql`
    CREATE TABLE event_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event_name VARCHAR(100) NOT NULL,
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      entity_id VARCHAR(100),
      chain_id UUID,
      data JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `.execute(db);

  console.log('Created event_logs table');

  // Create indexes for common query patterns
  console.log('Creating indexes...');

  await sql`
    CREATE INDEX idx_event_logs_event_name ON event_logs(event_name)
  `.execute(db);

  await sql`
    CREATE INDEX idx_event_logs_user_id ON event_logs(user_id)
  `.execute(db);

  await sql`
    CREATE INDEX idx_event_logs_entity_id ON event_logs(entity_id)
  `.execute(db);

  await sql`
    CREATE INDEX idx_event_logs_chain_id ON event_logs(chain_id)
  `.execute(db);

  await sql`
    CREATE INDEX idx_event_logs_created_at ON event_logs(created_at)
  `.execute(db);

  console.log('Created indexes');
  console.log('Migration complete!');
}

export async function down(db: Kysely<unknown>): Promise<void> {
  console.log('Dropping event_logs table...');

  await sql`
    DROP TABLE IF EXISTS event_logs
  `.execute(db);

  console.log('Dropped event_logs table');
  console.log('Rollback complete!');
}
