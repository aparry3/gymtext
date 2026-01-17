import { Kysely, sql } from 'kysely';

/**
 * Migration: Create profiles table for Markdown-based fitness profiles
 *
 * This table stores the history of user fitness profiles in Markdown format.
 * Each update creates a new row, providing full audit trail and versioning.
 */
export async function up(db: Kysely<any>): Promise<void> {
  // Create profiles table
  await db.schema
    .createTable('profiles')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('client_id', 'uuid', (col) =>
      col.notNull().references('users.id').onDelete('cascade')
    )
    .addColumn('profile', 'text', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute();

  // Create index for querying latest profile (most common query)
  await db.schema
    .createIndex('idx_profiles_client_created')
    .on('profiles')
    .columns(['client_id', 'created_at'])
    .execute();

  // Create index for client_id lookups
  await db.schema
    .createIndex('idx_profiles_client')
    .on('profiles')
    .column('client_id')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop indexes
  await db.schema.dropIndex('idx_profiles_client').execute();
  await db.schema.dropIndex('idx_profiles_client_created').execute();

  // Drop table
  await db.schema.dropTable('profiles').execute();
}
