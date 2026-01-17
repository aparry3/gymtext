import { Kysely, PostgresDialect, sql } from 'kysely';
import { Pool } from 'pg';
import { promises as fs } from 'fs';
import { join } from 'path';

/**
 * Data Dump Script
 *
 * Exports user data to SQL INSERT statements for backup/restore.
 * Excludes system config (prompts, AI program data) which is seeded by migration.
 *
 * Usage: pnpm db:dump
 */

// System data IDs to exclude
const AI_OWNER_ID = '00000000-0000-0000-0000-000000000001';
const AI_PROGRAM_ID = '00000000-0000-0000-0000-000000000002';
const AI_VERSION_ID = '00000000-0000-0000-0000-000000000003';

// Tables to export in FK-safe order (for restore)
const TABLES_TO_EXPORT = [
  // Tier 1: No FKs
  'users',
  'page_visits',
  'uploaded_images',
  // Tier 2: Depends on users
  'profiles',
  'profile_updates',
  'subscriptions',
  'messages',
  'microcycles',
  'workout_instances',
  'user_onboarding',
  'short_links',
  'admin_activity_logs',
  'referrals',
  'day_configs',
  'message_queues',
  // Tier 3: Program-related (user-created only)
  'program_owners',
  'programs',
  'program_versions',
  'program_families',
  'program_family_programs',
  'fitness_plans',
  'program_enrollments',
];

// Chunk size for large tables
const CHUNK_SIZE = 1000;

// Get database URL
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create database connection
const pool = new Pool({ connectionString: databaseUrl, max: 10 });
const db = new Kysely<any>({ dialect: new PostgresDialect({ pool }) });

/**
 * Escape a value for SQL INSERT
 */
function escapeValue(value: any): string {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE';
  }
  if (typeof value === 'number') {
    return String(value);
  }
  if (value instanceof Date) {
    return `'${value.toISOString()}'`;
  }
  if (typeof value === 'object') {
    // JSON/JSONB
    return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
  }
  if (Array.isArray(value)) {
    // Array type
    const escaped = value.map((v) => escapeValue(v)).join(',');
    return `ARRAY[${escaped}]`;
  }
  // String - escape single quotes
  return `'${String(value).replace(/'/g, "''")}'`;
}

/**
 * Convert camelCase to snake_case
 */
function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Generate INSERT statement for a row
 */
function generateInsert(tableName: string, row: Record<string, any>): string {
  const columns = Object.keys(row).map(toSnakeCase);
  const values = Object.values(row).map(escapeValue);
  return `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')});`;
}

/**
 * Export a table to SQL INSERT statements
 */
async function exportTable(tableName: string): Promise<string[]> {
  const statements: string[] = [];

  // Build query with exclusions for system data
  let query = db.selectFrom(tableName).selectAll();

  // Exclude system data based on table
  if (tableName === 'program_owners') {
    query = query.where('id', '!=', AI_OWNER_ID);
  } else if (tableName === 'programs') {
    query = query.where('id', '!=', AI_PROGRAM_ID);
  } else if (tableName === 'program_versions') {
    query = query.where('id', '!=', AI_VERSION_ID);
  } else if (tableName === 'fitness_plans') {
    // Exclude plans linked to AI program (they'll be recreated via enrollments)
    query = query.where((eb) =>
      eb.or([eb('program_id', '!=', AI_PROGRAM_ID), eb('program_id', 'is', null)])
    );
  } else if (tableName === 'program_enrollments') {
    // Exclude AI program enrollments (they can be recreated)
    query = query.where('program_id', '!=', AI_PROGRAM_ID);
  }

  // Get count for progress
  const countResult = await db
    .selectFrom(tableName)
    .select(sql<number>`count(*)`.as('count'))
    .executeTakeFirst();
  const totalRows = Number(countResult?.count || 0);

  if (totalRows === 0) {
    console.log(`  ${tableName}: 0 rows (skipping)`);
    return statements;
  }

  console.log(`  ${tableName}: ${totalRows} rows`);

  // Export in chunks for large tables
  let offset = 0;
  while (offset < totalRows) {
    const rows = await query.limit(CHUNK_SIZE).offset(offset).execute();

    for (const row of rows) {
      statements.push(generateInsert(tableName, row));
    }

    offset += CHUNK_SIZE;
    if (offset < totalRows) {
      process.stdout.write(`    Exported ${Math.min(offset, totalRows)}/${totalRows}...\r`);
    }
  }

  return statements;
}

/**
 * Main dump function
 */
async function main() {
  console.log('Starting data dump...\n');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const outputPath = join(process.cwd(), 'backups', `data_dump_${timestamp}.sql`);

  // Ensure backups directory exists
  await fs.mkdir(join(process.cwd(), 'backups'), { recursive: true });

  const allStatements: string[] = [];

  // Header
  allStatements.push('-- GymText Data Dump');
  allStatements.push(`-- Generated: ${new Date().toISOString()}`);
  allStatements.push('-- This file contains user data only (excludes system config)');
  allStatements.push('');
  allStatements.push('BEGIN;');
  allStatements.push('');

  // Disable FK checks temporarily for restore
  allStatements.push('-- Disable triggers during restore for performance');
  allStatements.push('SET session_replication_role = replica;');
  allStatements.push('');

  // Export each table
  for (const tableName of TABLES_TO_EXPORT) {
    try {
      allStatements.push(`-- Table: ${tableName}`);
      const tableStatements = await exportTable(tableName);
      allStatements.push(...tableStatements);
      allStatements.push('');
    } catch (error) {
      console.error(`  Error exporting ${tableName}:`, error);
    }
  }

  // Re-enable triggers
  allStatements.push('-- Re-enable triggers');
  allStatements.push('SET session_replication_role = DEFAULT;');
  allStatements.push('');
  allStatements.push('COMMIT;');

  // Write to file
  await fs.writeFile(outputPath, allStatements.join('\n'), 'utf-8');

  console.log(`\nDump complete! Output: ${outputPath}`);
  console.log(`Total statements: ${allStatements.length}`);

  await db.destroy();
}

main().catch((err) => {
  console.error('Dump failed:', err);
  process.exit(1);
});
