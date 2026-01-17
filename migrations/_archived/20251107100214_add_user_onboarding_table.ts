import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Create user_onboarding table
  await db.schema
    .createTable('user_onboarding')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('user_id', 'uuid', (col) =>
      col.unique().notNull().references('users.id').onDelete('cascade')
    )
    .addColumn('signup_data', 'jsonb')
    .addColumn('status', 'text', (col) => col.notNull().defaultTo('pending'))
    .addColumn('started_at', 'timestamptz')
    .addColumn('completed_at', 'timestamptz')
    .addColumn('error_message', 'text')
    .addColumn('program_messages_sent', 'boolean', (col) => col.defaultTo(false))
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  // Create indexes for performance
  await db.schema
    .createIndex('idx_user_onboarding_user_id')
    .on('user_onboarding')
    .column('user_id')
    .execute();

  await db.schema
    .createIndex('idx_user_onboarding_status')
    .on('user_onboarding')
    .column('status')
    .execute();

  // Create updated_at trigger
  await sql`
    CREATE TRIGGER update_user_onboarding_updated_at
    BEFORE UPDATE ON user_onboarding
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('user_onboarding').execute();
}
