/**
 * Database Snapshot Restore
 *
 * Restores a database from a saved snapshot.
 * 
 * Usage:
 *   pnpm db:snapshot:restore <name>
 *   pnpm db:snapshot:restore staging-system
 *   pnpm db:snapshot:restore staging-system-latest
 *
 * Requires DATABASE_URL environment variable.
 * WARNING: This will overwrite all data in the database!
 */

import 'dotenv/config';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const SNAPSHOT_DIR = path.join(process.cwd(), 'db', 'snapshots');

function usage() {
  console.log(`Usage: pnpm db:snapshot:restore <name>

Restores a snapshot from db/snapshots/<name>.sql.gz

Examples:
  pnpm db:snapshot:restore staging-system
  pnpm db:snapshot:restore staging-system-latest
  pnpm db:snapshot:restore 2024-01-15-backup

WARNING: This will overwrite all data in the database!
`);
  process.exit(1);
}

async function main() {
  const name = process.argv[2];

  if (!name) {
    console.error('Error: name is required\n');
    usage();
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('Error: DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  // Find the snapshot file
  let filename: string;
  
  // Check if it's a full filename
  if (name.endsWith('.sql.gz') && fs.existsSync(path.join(SNAPSHOT_DIR, name))) {
    filename = name;
  } 
  // Check for -latest suffix
  else if (fs.existsSync(path.join(SNAPSHOT_DIR, `${name}-latest.sql.gz`))) {
    filename = `${name}-latest.sql.gz`;
  }
  // Try to find a matching snapshot
  else {
    const files = fs.readdirSync(SNAPSHOT_DIR).filter(f => f.startsWith(name));
    if (files.length === 0) {
      console.error(`Error: No snapshot found matching "${name}"`);
      console.log(`\nAvailable snapshots:`);
      listSnapshots();
      process.exit(1);
    }
    // Use the most recent one
    files.sort().reverse();
    filename = files[0];
  }

  const filepath = path.join(SNAPSHOT_DIR, filename);
  
  // Extract database name from URL
  const dbMatch = dbUrl.match(/\/([^?]+)(\?|$)/);
  const dbName = dbMatch ? dbMatch[1] : 'database';

  console.log(`🔄 Restoring snapshot: ${filename}`);
  console.log(`   Database: ${dbName}`);
  console.log(`   Source: ${filepath}`);
  console.log('');

  // Confirmation prompt would go here in interactive mode
  // For now, we proceed directly but warn
  console.log('⚠️  WARNING: This will overwrite all data in the database!');
  console.log('');

  try {
    // Drop all connections to the database first
    console.log('Dropping connections...');
    const adminUrl = dbUrl.replace(/\/[^/]+$/, '/postgres');
    execSync(`psql "${adminUrl}" -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${dbName}' AND pid <> pg_backend_pid()"`, { stdio: 'inherit' });

    // Drop and recreate database
    console.log('Recreating database...');
    execSync(`psql "${adminUrl}" -c "DROP DATABASE IF EXISTS ${dbName}"`, { stdio: 'inherit' });
    execSync(`psql "${adminUrl}" -c "CREATE DATABASE ${dbName}"`, { stdio: 'inherit' });

    // Restore from snapshot
    console.log('Restoring data...');
    execSync(`pg_restore --dbname="${dbUrl}" --jobs=4 --clean --if-exists "${filepath}"`, { stdio: 'inherit' });

    console.log(`\n✅ Snapshot restored successfully!`);
    console.log(`   Restored from: ${filename}`);

  } catch (error) {
    console.error('\n❌ Failed to restore snapshot:', error);
    process.exit(1);
  }
}

function listSnapshots() {
  if (!fs.existsSync(SNAPSHOT_DIR)) {
    console.log('  No snapshots directory found');
    return;
  }

  const files = fs.readdirSync(SNAPSHOT_DIR)
    .filter(f => f.endsWith('.sql.gz'))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.log('  No snapshots found');
    return;
  }

  for (const file of files.slice(0, 10)) {
    const stats = fs.statSync(path.join(SNAPSHOT_DIR, file));
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    const date = stats.mtime.toISOString().slice(0, 10);
    console.log(`  ${file} (${sizeMB} MB, ${date})`);
  }
}

main();
