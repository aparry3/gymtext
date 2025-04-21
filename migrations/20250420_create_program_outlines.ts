import { Kysely, Generated, sql } from 'kysely';
import { Database } from '../src/shared/types/schema';

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('program_outlines')
    .addColumn('id', 'text', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('user_id', 'uuid', (col) => col.notNull().references('users.id'))
    .addColumn('outline', 'jsonb', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .execute();
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable('program_outlines').execute();
} 