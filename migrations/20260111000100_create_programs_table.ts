import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  console.log('Creating programs table...');

  await db.schema
    .createTable('programs')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('owner_id', 'uuid', (col) => col.notNull().references('program_owners.id').onDelete('cascade'))
    .addColumn('name', 'varchar(200)', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('scheduling_mode', 'varchar(20)', (col) => col.notNull().defaultTo('rolling_start'))
    .addColumn('cadence', 'varchar(30)', (col) => col.notNull().defaultTo('calendar_days'))
    .addColumn('late_joiner_policy', 'varchar(30)', (col) => col.defaultTo('start_from_beginning'))
    .addColumn('billing_model', 'varchar(30)', (col) => col.defaultTo('subscription'))
    .addColumn('revenue_split_percent', 'integer', (col) => col.defaultTo(70))
    .addColumn('is_active', 'boolean', (col) => col.notNull().defaultTo(true))
    .addColumn('is_public', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  await db.schema
    .createIndex('idx_programs_owner_id')
    .on('programs')
    .column('owner_id')
    .execute();

  await db.schema
    .createIndex('idx_programs_active_public')
    .on('programs')
    .columns(['is_active', 'is_public'])
    .execute();

  console.log('Successfully created programs table');
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex('idx_programs_active_public').execute();
  await db.schema.dropIndex('idx_programs_owner_id').execute();
  await db.schema.dropTable('programs').execute();
}
