import { Kysely, sql } from 'kysely';
import { DB } from '../src/server/models/_types';

export async function up(db: Kysely<DB>): Promise<void> {
  // Create new microcycles table for storing weekly training patterns
  await db.schema
    .createTable('microcycles')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('user_id', 'uuid', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('fitness_plan_id', 'uuid', (col) => col.notNull().references('fitness_plans.id').onDelete('cascade'))
    .addColumn('mesocycle_index', 'integer', (col) => col.notNull())
    .addColumn('week_number', 'integer', (col) => col.notNull())
    .addColumn('pattern', 'json', (col) => col.notNull())
    .addColumn('start_date', 'timestamp', (col) => col.notNull())
    .addColumn('end_date', 'timestamp', (col) => col.notNull())
    .addColumn('is_active', 'boolean', (col) => col.defaultTo(true))
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .execute();

  // Add unique constraint for one microcycle per user per week
  await db.schema
    .createIndex('microcycles_unique_week')
    .on('microcycles')
    .columns(['user_id', 'fitness_plan_id', 'mesocycle_index', 'week_number'])
    .unique()
    .execute();
  
  // Add index for active microcycle lookups
  await db.schema
    .createIndex('microcycles_active_user')
    .on('microcycles')
    .columns(['user_id', 'is_active'])
    .execute();
}

export async function down(db: Kysely<DB>): Promise<void> {
  // Drop indexes first
  await db.schema.dropIndex('microcycles_active_user').execute();
  await db.schema.dropIndex('microcycles_unique_week').execute();
  
  // Drop the table
  await db.schema.dropTable('microcycles').execute();
}
