import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  // Add details column to microcycles (mirrors workout_instances pattern)
  await sql`ALTER TABLE microcycles ADD COLUMN IF NOT EXISTS details jsonb`.execute(db);

  // Add message column to microcycles (formatted version, like workout_instances)
  await sql`ALTER TABLE microcycles ADD COLUMN IF NOT EXISTS message text`.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql`ALTER TABLE microcycles DROP COLUMN IF EXISTS details`.execute(db);
  await sql`ALTER TABLE microcycles DROP COLUMN IF EXISTS message`.execute(db);
}
