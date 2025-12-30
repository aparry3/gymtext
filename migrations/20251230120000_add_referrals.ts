import { Kysely, sql } from 'kysely';

/**
 * Migration: Add referral system
 *
 * Adds referral_code to users table and creates referrals table
 * to track referral relationships and credit application.
 */

export async function up(db: Kysely<unknown>): Promise<void> {
  // Add referral_code column to users table
  await db.schema
    .alterTable('users')
    .addColumn('referral_code', 'varchar(8)', (col) => col.unique())
    .execute();

  // Create referrals table
  await db.schema
    .createTable('referrals')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn('referrer_id', 'uuid', (col) =>
      col.notNull().references('users.id').onDelete('cascade')
    )
    .addColumn('referee_id', 'uuid', (col) =>
      col.notNull().unique().references('users.id').onDelete('cascade')
    )
    .addColumn('credit_applied', 'boolean', (col) =>
      col.notNull().defaultTo(false)
    )
    .addColumn('credit_amount_cents', 'integer', (col) =>
      col.defaultTo(0)
    )
    .addColumn('created_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
    )
    .addColumn('credited_at', 'timestamptz')
    .execute();

  // Add index for efficient referrer lookups
  await db.schema
    .createIndex('referrals_referrer_id_idx')
    .on('referrals')
    .column('referrer_id')
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  // Drop index
  await db.schema.dropIndex('referrals_referrer_id_idx').execute();

  // Drop referrals table
  await db.schema.dropTable('referrals').execute();

  // Remove referral_code column from users
  await db.schema
    .alterTable('users')
    .dropColumn('referral_code')
    .execute();
}
