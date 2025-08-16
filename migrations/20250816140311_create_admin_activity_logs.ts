import { Kysely, sql } from 'kysely';
import type { DB } from '../src/server/models/_types';

export async function up(db: Kysely<DB>): Promise<void> {
  await db.schema
    .createTable('admin_activity_logs')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('actor_user_id', 'uuid')
    .addColumn('target_user_id', 'uuid', (col) => col.notNull())
    .addColumn('action', 'text', (col) => col.notNull())
    .addColumn('payload', 'jsonb', (col) => col.notNull().defaultTo(sql`'{}'::jsonb`))
    .addColumn('result', 'text', (col) => col.notNull())
    .addColumn('error_message', 'text')
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createIndex('idx_admin_activity_logs_target')
    .on('admin_activity_logs')
    .column('target_user_id')
    .execute();

  await db.schema
    .createIndex('idx_admin_activity_logs_created_at')
    .on('admin_activity_logs')
    .column('created_at')
    .execute();
}

export async function down(db: Kysely<DB>): Promise<void> {
  await db.schema.dropIndex('idx_admin_activity_logs_target').execute();
  await db.schema.dropIndex('idx_admin_activity_logs_created_at').execute();
  await db.schema.dropTable('admin_activity_logs').execute();
}
