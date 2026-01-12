import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  console.log('Creating program_enrollments table...');

  await db.schema
    .createTable('program_enrollments')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('client_id', 'uuid', (col) => col.notNull().references('users.id').onDelete('cascade'))
    .addColumn('program_id', 'uuid', (col) => col.notNull().references('programs.id').onDelete('cascade'))
    .addColumn('version_id', 'uuid', (col) => col.references('fitness_plans.id').onDelete('set null'))
    .addColumn('cohort_id', 'varchar(100)')
    .addColumn('cohort_start_date', 'date')
    .addColumn('start_date', 'date', (col) => col.notNull())
    .addColumn('current_week', 'integer', (col) => col.notNull().defaultTo(1))
    .addColumn('status', 'varchar(20)', (col) => col.notNull().defaultTo('active'))
    .addColumn('enrolled_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  // Unique constraint: one enrollment per client per program
  await db.schema
    .createIndex('idx_enrollments_client_program')
    .on('program_enrollments')
    .columns(['client_id', 'program_id'])
    .unique()
    .execute();

  // Index for finding enrollments by client
  await db.schema
    .createIndex('idx_enrollments_client_id')
    .on('program_enrollments')
    .column('client_id')
    .execute();

  // Index for finding enrollments by program
  await db.schema
    .createIndex('idx_enrollments_program_id')
    .on('program_enrollments')
    .column('program_id')
    .execute();

  // Index for filtering by status
  await db.schema
    .createIndex('idx_enrollments_status')
    .on('program_enrollments')
    .column('status')
    .execute();

  // Index for cohort queries
  await db.schema
    .createIndex('idx_enrollments_cohort')
    .on('program_enrollments')
    .columns(['program_id', 'cohort_id'])
    .execute();

  console.log('Successfully created program_enrollments table');
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex('idx_enrollments_cohort').execute();
  await db.schema.dropIndex('idx_enrollments_status').execute();
  await db.schema.dropIndex('idx_enrollments_program_id').execute();
  await db.schema.dropIndex('idx_enrollments_client_id').execute();
  await db.schema.dropIndex('idx_enrollments_client_program').execute();
  await db.schema.dropTable('program_enrollments').execute();
}
