import { Kysely, sql } from 'kysely';

/**
 * Migration: Add day configs and uploaded images tables
 *
 * Creates tables for:
 * - day_configs: Store day-specific configuration (images, themes, etc.)
 * - uploaded_images: Image library for admin uploads
 */

export async function up(db: Kysely<unknown>): Promise<void> {
  // Create day_configs table with JSON-first approach for extensibility
  await db.schema
    .createTable('day_configs')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('date', 'date', (col) => col.notNull())
    .addColumn('scope_type', 'varchar(20)', (col) =>
      col.notNull().defaultTo('global')
    )
    .addColumn('scope_id', 'uuid')
    .addColumn('config', 'jsonb', (col) =>
      col.notNull().defaultTo(sql`'{}'::jsonb`)
    )
    .addColumn('created_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .addColumn('updated_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .addUniqueConstraint('day_configs_date_scope_unique', [
      'date',
      'scope_type',
      'scope_id',
    ])
    .execute();

  // Add index for efficient date lookups
  await db.schema
    .createIndex('day_configs_date_idx')
    .on('day_configs')
    .column('date')
    .execute();

  // Add index for scope lookups
  await db.schema
    .createIndex('day_configs_scope_idx')
    .on('day_configs')
    .columns(['scope_type', 'scope_id'])
    .execute();

  // Create uploaded_images table for image library
  await db.schema
    .createTable('uploaded_images')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('url', 'text', (col) => col.notNull())
    .addColumn('filename', 'varchar(255)', (col) => col.notNull())
    .addColumn('display_name', 'varchar(255)')
    .addColumn('content_type', 'varchar(100)', (col) => col.notNull())
    .addColumn('size_bytes', 'integer', (col) => col.notNull())
    .addColumn('category', 'varchar(50)', (col) => col.defaultTo('general'))
    .addColumn('tags', 'jsonb', (col) => col.defaultTo(sql`'[]'::jsonb`))
    .addColumn('uploaded_by', 'varchar(50)')
    .addColumn('created_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .execute();

  // Add index for category filtering
  await db.schema
    .createIndex('uploaded_images_category_idx')
    .on('uploaded_images')
    .column('category')
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  // Drop uploaded_images table and index
  await db.schema.dropIndex('uploaded_images_category_idx').execute();
  await db.schema.dropTable('uploaded_images').execute();

  // Drop day_configs table and indexes
  await db.schema.dropIndex('day_configs_scope_idx').execute();
  await db.schema.dropIndex('day_configs_date_idx').execute();
  await db.schema.dropTable('day_configs').execute();
}
