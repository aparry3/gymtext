import { Kysely, sql } from 'kysely';

/**
 * Drop scheduling_type column from programs.
 *
 * We simplified coach scheduling to just a URL + notes — no need for
 * a separate enum distinguishing Calendly / Cal.com / custom URL.
 */

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`ALTER TABLE programs DROP COLUMN IF EXISTS scheduling_type`.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql`ALTER TABLE programs ADD COLUMN scheduling_type TEXT`.execute(db);
}
