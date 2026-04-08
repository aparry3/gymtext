import { Migration, sql } from 'kysely';

/**
 * COACH BOOKINGS
 *
 * Records coach scheduling bookings created via Calendly webhooks.
 * One row per Calendly invitee event. Used now for attribution + audit,
 * and later (Part 2) for per-user session-limit enforcement.
 */

export const up: Migration = async (db) => {
  console.log('Creating coach_bookings table...');

  await sql`
    CREATE TABLE IF NOT EXISTS coach_bookings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      client_id UUID REFERENCES users(id) ON DELETE CASCADE,
      program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
      calendly_event_uri TEXT NOT NULL,
      calendly_invitee_uri TEXT NOT NULL UNIQUE,
      event_type_uri TEXT,
      scheduled_at TIMESTAMPTZ NOT NULL,
      status TEXT NOT NULL,
      canceled_at TIMESTAMPTZ,
      cancel_reason TEXT,
      raw_payload JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `.execute(db);
  console.log('  ✓ coach_bookings table created');

  await sql`CREATE INDEX IF NOT EXISTS coach_bookings_client_id_idx ON coach_bookings(client_id)`.execute(db);
  await sql`CREATE INDEX IF NOT EXISTS coach_bookings_program_id_idx ON coach_bookings(program_id)`.execute(db);
  await sql`CREATE INDEX IF NOT EXISTS coach_bookings_status_idx ON coach_bookings(status)`.execute(db);
  console.log('  ✓ indexes created');

  console.log('Done — coach_bookings ready.');
};

export const down: Migration = async (db) => {
  console.log('Dropping coach_bookings table...');
  await sql`DROP TABLE IF EXISTS coach_bookings`.execute(db);
  console.log('Done.');
};
