import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`
    UPDATE users
    SET messaging_opt_in = true, messaging_opt_in_date = created_at
    WHERE messaging_opt_in IS NULL
  `.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  // No-op: we can't determine which users originally had NULL consent
}
