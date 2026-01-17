import { Kysely, PostgresDialect, sql } from 'kysely';
import { Pool } from 'pg';
import { promises as fs } from 'fs';
import { join } from 'path';
import * as readline from 'readline';

/**
 * Data Restore Script
 *
 * Restores user data from a SQL dump file.
 * The dump file should have been created by dump-data.ts.
 *
 * Usage: pnpm db:restore [dump_file]
 *
 * If no dump file is specified, uses the most recent dump in /backups/
 */

// Get database URL
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create database connection
const pool = new Pool({ connectionString: databaseUrl, max: 10 });
const db = new Kysely<any>({ dialect: new PostgresDialect({ pool }) });

/**
 * Find the most recent dump file
 */
async function findLatestDump(): Promise<string | null> {
  const backupsDir = join(process.cwd(), 'backups');

  try {
    const files = await fs.readdir(backupsDir);
    const dumpFiles = files
      .filter((f) => f.startsWith('data_dump_') && f.endsWith('.sql'))
      .sort()
      .reverse();

    if (dumpFiles.length === 0) {
      return null;
    }

    return join(backupsDir, dumpFiles[0]);
  } catch {
    return null;
  }
}

/**
 * Confirm with user before proceeding
 */
async function confirmRestore(dumpFile: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    console.log('\n⚠️  WARNING: This will restore data from:');
    console.log(`   ${dumpFile}`);
    console.log('\nThis may overwrite existing data (duplicate key errors will be logged but not halt restore).');
    console.log('');

    rl.question('Type "yes" to proceed: ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes');
    });
  });
}

/**
 * Execute a batch of SQL statements
 */
async function executeBatch(statements: string[]): Promise<{ success: number; errors: number }> {
  let success = 0;
  let errors = 0;

  for (const stmt of statements) {
    const trimmed = stmt.trim();
    if (!trimmed || trimmed.startsWith('--')) {
      continue;
    }

    try {
      await sql.raw(trimmed).execute(db);
      success++;
    } catch (error: any) {
      // Log duplicate key errors but don't fail
      if (error.code === '23505') {
        // Duplicate key violation - skip silently
        errors++;
      } else {
        console.error(`  Error: ${error.message}`);
        console.error(`  Statement: ${trimmed.substring(0, 100)}...`);
        errors++;
      }
    }
  }

  return { success, errors };
}

/**
 * Main restore function
 */
async function main() {
  // Get dump file from args or find latest
  let dumpFile = process.argv[2];

  if (!dumpFile) {
    dumpFile = await findLatestDump() as string;
    if (!dumpFile) {
      console.error('No dump file specified and no dumps found in /backups/');
      console.error('Usage: pnpm db:restore [dump_file]');
      process.exit(1);
    }
    console.log(`Using latest dump: ${dumpFile}`);
  }

  // Check file exists
  try {
    await fs.access(dumpFile);
  } catch {
    console.error(`Dump file not found: ${dumpFile}`);
    process.exit(1);
  }

  // Confirm with user
  const confirmed = await confirmRestore(dumpFile);
  if (!confirmed) {
    console.log('Restore cancelled.');
    process.exit(0);
  }

  console.log('\nStarting restore...\n');

  // Read dump file
  const content = await fs.readFile(dumpFile, 'utf-8');
  const lines = content.split('\n');

  // Parse statements (simple split on semicolons, handling multi-line)
  const statements: string[] = [];
  let currentStatement = '';

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith('--')) {
      continue;
    }

    currentStatement += ' ' + trimmed;

    if (trimmed.endsWith(';')) {
      statements.push(currentStatement.trim());
      currentStatement = '';
    }
  }

  if (currentStatement.trim()) {
    statements.push(currentStatement.trim());
  }

  console.log(`Found ${statements.length} statements to execute`);
  console.log('');

  // Execute in batches
  const BATCH_SIZE = 100;
  let totalSuccess = 0;
  let totalErrors = 0;

  for (let i = 0; i < statements.length; i += BATCH_SIZE) {
    const batch = statements.slice(i, i + BATCH_SIZE);
    const { success, errors } = await executeBatch(batch);
    totalSuccess += success;
    totalErrors += errors;

    const progress = Math.min(i + BATCH_SIZE, statements.length);
    process.stdout.write(`  Progress: ${progress}/${statements.length} (${totalSuccess} success, ${totalErrors} errors)\r`);
  }

  console.log('\n');
  console.log('Restore complete!');
  console.log(`  Successful: ${totalSuccess}`);
  console.log(`  Errors: ${totalErrors} (usually duplicate key violations)`);

  await db.destroy();
}

main().catch((err) => {
  console.error('Restore failed:', err);
  process.exit(1);
});
