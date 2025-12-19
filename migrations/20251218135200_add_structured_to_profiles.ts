import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('profiles').addColumn('structured', 'jsonb').execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('profiles').dropColumn('structured').execute();
}
