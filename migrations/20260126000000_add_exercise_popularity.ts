import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  // Add popularity column to exercises (all start at 0.5)
  await sql`ALTER TABLE exercises ADD COLUMN popularity NUMERIC(4,3) NOT NULL DEFAULT 0.500`.execute(db);

  // Create exercise_uses tracking table
  await db.schema
    .createTable('exercise_uses')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('exercise_id', 'uuid', (col) => col.notNull().references('exercises.id').onDelete('cascade'))
    .addColumn('user_id', 'uuid', (col) => col.references('users.id').onDelete('set null'))
    .addColumn('use_type', 'varchar(20)', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  await db.schema
    .createIndex('idx_exercise_uses_exercise_id')
    .on('exercise_uses')
    .column('exercise_id')
    .execute();

  await db.schema
    .createIndex('idx_exercise_uses_created_at')
    .on('exercise_uses')
    .column('created_at')
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('exercise_uses').execute();
  await db.schema.alterTable('exercises').dropColumn('popularity').execute();
}
