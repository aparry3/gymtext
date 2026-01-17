import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable('users')
    .dropColumn('profile')
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable('users')
    .addColumn('profile', 'jsonb', (col) => col.defaultTo(sql`'{}'::jsonb`))
    .execute();
}
