import { Kysely, Migration } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('conversations')
    .addColumn('summary', 'text')
    .execute();
};

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('conversations')
    .dropColumn('summary')
    .execute();
};
