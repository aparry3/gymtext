import { Kysely, sql } from 'kysely';

/**
 * Migration: Create page_visits table for anonymous visitor tracking
 *
 * Tracks visitors landing on the home page with source attribution,
 * UTM parameters, and basic visitor metadata.
 */
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('page_visits')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('page', 'varchar(100)', (col) => col.notNull())
    .addColumn('ip_address', 'varchar(45)') // IPv6 max length
    .addColumn('user_agent', 'text')
    .addColumn('referrer', 'text')
    .addColumn('source', 'varchar(100)') // Custom source param
    .addColumn('utm_source', 'varchar(255)')
    .addColumn('utm_medium', 'varchar(255)')
    .addColumn('utm_campaign', 'varchar(255)')
    .addColumn('utm_content', 'varchar(255)')
    .addColumn('utm_term', 'varchar(255)')
    .addColumn('created_at', 'timestamptz', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute();

  // Index for querying by source
  await db.schema
    .createIndex('idx_page_visits_source')
    .on('page_visits')
    .column('source')
    .execute();

  // Index for querying by date range
  await db.schema
    .createIndex('idx_page_visits_created_at')
    .on('page_visits')
    .column('created_at')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex('idx_page_visits_created_at').execute();
  await db.schema.dropIndex('idx_page_visits_source').execute();
  await db.schema.dropTable('page_visits').execute();
}
