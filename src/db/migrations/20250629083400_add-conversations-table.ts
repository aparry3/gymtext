import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('conversations')
    .addColumn('id', 'uuid', (col) => 
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('user_id', 'uuid', (col) => 
      col.references('users.id').onDelete('cascade').notNull()
    )
    .addColumn('message_id', 'text', (col) => col.notNull())
    .addColumn('role', 'text', (col) => col.notNull())
    .addColumn('content', 'text', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute();

  // Add index for faster user conversation lookups
  await db.schema
    .createIndex('conversations_user_id_created_at_idx')
    .on('conversations')
    .columns(['user_id', 'created_at'])
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .dropIndex('conversations_user_id_created_at_idx')
    .execute();
    
  await db.schema
    .dropTable('conversations')
    .execute();
}
