import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Add preferred_send_hour column with check constraint
  await db.schema
    .alterTable('users')
    .addColumn('preferred_send_hour', 'integer', (col) => 
      col.defaultTo(8).notNull()
    )
    .execute();

  // Add check constraint for preferred_send_hour (0-23)
  await sql`
    ALTER TABLE users 
    ADD CONSTRAINT check_preferred_send_hour 
    CHECK (preferred_send_hour >= 0 AND preferred_send_hour <= 23)
  `.execute(db);

  // Add timezone column with default
  await db.schema
    .alterTable('users')
    .addColumn('timezone', 'varchar(50)', (col) => 
      col.defaultTo('America/New_York').notNull()
    )
    .execute();

  // Note: IANA timezone validation will be handled at the application layer
  // PostgreSQL doesn't allow subqueries in CHECK constraints

  // Create indexes for efficient querying
  await db.schema
    .createIndex('idx_users_send_hour')
    .on('users')
    .column('preferred_send_hour')
    .execute();

  await db.schema
    .createIndex('idx_users_timezone')
    .on('users')
    .column('timezone')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop indexes
  await db.schema.dropIndex('idx_users_timezone').execute();
  await db.schema.dropIndex('idx_users_send_hour').execute();

  // Drop constraints
  await sql`ALTER TABLE users DROP CONSTRAINT IF EXISTS check_preferred_send_hour`.execute(db);

  // Drop columns
  await db.schema
    .alterTable('users')
    .dropColumn('timezone')
    .execute();

  await db.schema
    .alterTable('users')
    .dropColumn('preferred_send_hour')
    .execute();
}