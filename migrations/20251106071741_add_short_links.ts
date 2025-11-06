import { Kysely, sql } from 'kysely';

/**
 * Migration: Add short_links table
 *
 * Creates a table to store short links for SMS messages and other content.
 * Supports automatic authentication via link click and collision handling via upsert.
 */

export async function up(db: Kysely<any>): Promise<void> {
  // Create short_links table
  await db.schema
    .createTable('short_links')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`uuid_generate_v4()`)
    )
    .addColumn('code', 'varchar(5)', (col) => col.notNull().unique())
    .addColumn('target_path', 'text', (col) => col.notNull())
    .addColumn('user_id', 'uuid', (col) =>
      col.references('users.id').onDelete('cascade')
    )
    .addColumn('expires_at', 'timestamptz')
    .addColumn('created_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .addColumn('last_accessed_at', 'timestamptz')
    .addColumn('access_count', 'integer', (col) =>
      col.notNull().defaultTo(0)
    )
    .execute();

  // Add indexes for efficient lookup
  await db.schema
    .createIndex('short_links_code_idx')
    .on('short_links')
    .column('code')
    .execute();

  await db.schema
    .createIndex('short_links_user_id_idx')
    .on('short_links')
    .column('user_id')
    .execute();

  await db.schema
    .createIndex('short_links_expires_at_idx')
    .on('short_links')
    .column('expires_at')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop indexes
  await db.schema
    .dropIndex('short_links_code_idx')
    .execute();

  await db.schema
    .dropIndex('short_links_user_id_idx')
    .execute();

  await db.schema
    .dropIndex('short_links_expires_at_idx')
    .execute();

  // Drop table
  await db.schema
    .dropTable('short_links')
    .execute();
}
