import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`
    CREATE TABLE admin_active_test_user (
      admin_phone VARCHAR(20) NOT NULL PRIMARY KEY,
      active_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql`DROP TABLE IF EXISTS admin_active_test_user`.execute(db);
}
