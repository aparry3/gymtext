import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  console.log('Creating program_owners table...');

  await db.schema
    .createTable('program_owners')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('user_id', 'uuid', (col) => col.references('users.id').onDelete('set null'))
    .addColumn('owner_type', 'varchar(20)', (col) => col.notNull())
    .addColumn('display_name', 'varchar(100)', (col) => col.notNull())
    .addColumn('bio', 'text')
    .addColumn('avatar_url', 'text')
    .addColumn('stripe_connect_account_id', 'varchar(255)')
    .addColumn('is_active', 'boolean', (col) => col.notNull().defaultTo(true))
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  await db.schema
    .createIndex('idx_program_owners_user_id')
    .on('program_owners')
    .column('user_id')
    .execute();

  await db.schema
    .createIndex('idx_program_owners_type')
    .on('program_owners')
    .column('owner_type')
    .execute();

  console.log('Successfully created program_owners table');
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex('idx_program_owners_type').execute();
  await db.schema.dropIndex('idx_program_owners_user_id').execute();
  await db.schema.dropTable('program_owners').execute();
}
