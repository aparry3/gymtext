import { Kysely, sql } from 'kysely';

/**
 * Migration: Add user_auth_codes table
 *
 * Creates a table to store verification codes for phone-based user authentication.
 * Codes expire after 10 minutes and are cleaned up periodically.
 */

export async function up(db: Kysely<any>): Promise<void> {
  // Create user_auth_codes table
  await db.schema
    .createTable('user_auth_codes')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`uuid_generate_v4()`)
    )
    .addColumn('phone_number', 'text', (col) => col.notNull())
    .addColumn('code', 'varchar(6)', (col) => col.notNull())
    .addColumn('expires_at', 'timestamptz', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .execute();

  // Add indexes for efficient lookup
  await db.schema
    .createIndex('user_auth_codes_phone_code_idx')
    .on('user_auth_codes')
    .columns(['phone_number', 'code', 'expires_at'])
    .execute();

  // Add index for cleanup queries
  await db.schema
    .createIndex('user_auth_codes_expires_at_idx')
    .on('user_auth_codes')
    .column('expires_at')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop indexes
  await db.schema
    .dropIndex('user_auth_codes_phone_code_idx')
    .execute();

  await db.schema
    .dropIndex('user_auth_codes_expires_at_idx')
    .execute();

  // Drop table
  await db.schema
    .dropTable('user_auth_codes')
    .execute();
}
