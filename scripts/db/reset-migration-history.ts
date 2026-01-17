import { Kysely, PostgresDialect, sql } from 'kysely';
import { Pool } from 'pg';

/**
 * Resets the kysely_migration table for consolidated schema migration.
 *
 * This script:
 * 1. Deletes all existing migration records
 * 2. Inserts a record for the consolidated migration as already applied
 *
 * Use this ONLY on databases that already have the full schema.
 * The consolidated migration is idempotent, so this is safe.
 *
 * Usage: pnpm db:reset-migrations
 */

const CONSOLIDATED_MIGRATION_NAME = '20260117000000_consolidated_schema';

// Get database URL
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create database connection
const pool = new Pool({ connectionString: databaseUrl, max: 10 });
const db = new Kysely<any>({ dialect: new PostgresDialect({ pool }) });

async function main() {
  console.log('Resetting kysely_migration table...\n');

  // Check if the table exists
  const tableExists = await sql<{ exists: boolean }>`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_name = 'kysely_migration'
    )
  `.execute(db);

  if (!tableExists.rows[0]?.exists) {
    console.log('kysely_migration table does not exist. Creating it...');
    await sql`
      CREATE TABLE IF NOT EXISTS kysely_migration (
        name VARCHAR(255) PRIMARY KEY,
        timestamp TIMESTAMP NOT NULL
      )
    `.execute(db);
  }

  // Get current migration records for logging
  const currentMigrations = await sql<{ name: string }>`
    SELECT name FROM kysely_migration ORDER BY name
  `.execute(db);

  console.log(`Current migration records: ${currentMigrations.rows.length}`);
  if (currentMigrations.rows.length > 0) {
    console.log('  Existing migrations:');
    currentMigrations.rows.forEach((m) => console.log(`    - ${m.name}`));
  }

  // Delete all existing records
  console.log('\nDeleting all migration records...');
  const deleteResult = await sql`
    DELETE FROM kysely_migration
  `.execute(db);
  console.log(`  Deleted ${deleteResult.numAffectedRows || 0} records`);

  // Insert the consolidated migration record
  console.log(`\nInserting consolidated migration: ${CONSOLIDATED_MIGRATION_NAME}`);
  await sql`
    INSERT INTO kysely_migration (name, timestamp)
    VALUES (${CONSOLIDATED_MIGRATION_NAME}, NOW())
  `.execute(db);

  // Verify
  const verification = await sql<{ name: string; timestamp: Date }>`
    SELECT name, timestamp FROM kysely_migration
  `.execute(db);

  console.log('\nVerification - current migration records:');
  verification.rows.forEach((m) => console.log(`  - ${m.name} (${m.timestamp})`));

  console.log('\nMigration history reset complete!');
  console.log('You can now run `pnpm migrate:up` to verify no migrations are pending.');

  await db.destroy();
}

main().catch((err) => {
  console.error('Reset failed:', err);
  process.exit(1);
});
