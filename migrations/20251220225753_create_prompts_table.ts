import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  // Create prompts table with composite primary key for versioning
  await db.schema
    .createTable('prompts')
    .addColumn('id', 'text', (col) => col.notNull())
    .addColumn('role', 'text', (col) => col.notNull())
    .addColumn('value', 'text', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .addPrimaryKeyConstraint('prompts_pkey', ['id', 'role', 'created_at'])
    .execute();

  // Index for efficient latest prompt lookup (ordered by created_at desc)
  await db.schema
    .createIndex('prompts_id_role_created_idx')
    .on('prompts')
    .columns(['id', 'role', 'created_at'])
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropIndex('prompts_id_role_created_idx').execute();
  await db.schema.dropTable('prompts').execute();
}
