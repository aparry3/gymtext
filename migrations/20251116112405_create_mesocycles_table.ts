import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Create mesocycles table
  await db.schema
    .createTable('mesocycles')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('user_id', 'uuid', (col) =>
      col.notNull().references('users.id').onDelete('cascade')
    )
    .addColumn('fitness_plan_id', 'uuid', (col) =>
      col.notNull().references('fitness_plans.id').onDelete('cascade')
    )
    .addColumn('mesocycle_index', 'integer', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('microcycles', sql`text[]`)
    .addColumn('formatted', 'text')
    .addColumn('start_week', 'integer', (col) => col.notNull())
    .addColumn('duration_weeks', 'integer', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute();

  // Add unique constraint on fitness_plan_id + mesocycle_index
  await db.schema
    .createIndex('mesocycles_plan_index_unique')
    .on('mesocycles')
    .columns(['fitness_plan_id', 'mesocycle_index'])
    .unique()
    .execute();

  // Add indexes for common queries
  await db.schema
    .createIndex('idx_mesocycles_plan')
    .on('mesocycles')
    .column('fitness_plan_id')
    .execute();

  await db.schema
    .createIndex('idx_mesocycles_user')
    .on('mesocycles')
    .column('user_id')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop indexes
  await db.schema.dropIndex('idx_mesocycles_user').execute();
  await db.schema.dropIndex('idx_mesocycles_plan').execute();
  await db.schema.dropIndex('mesocycles_plan_index_unique').execute();

  // Drop table
  await db.schema.dropTable('mesocycles').execute();
}
