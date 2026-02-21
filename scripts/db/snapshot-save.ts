/**
 * Database Snapshot Save
 *
 * Saves a snapshot of the current database state using pg_dump.
 * 
 * Usage:
 *   pnpm db:snapshot:save <name>
 *   pnpm db:snapshot:save staging-system
 *
 * Requires DATABASE_URL environment variable.
 */

import 'dotenv/config';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const SNAPSHOT_DIR = path.join(process.cwd(), 'db', 'snapshots');

function usage() {
  console.log(`Usage: pnpm db:snapshot:save <name>

Saves a snapshot of the database to db/snapshots/<name>.sql.gz

Example:
  pnpm db:snapshot:save staging-system
  pnpm db:snapshot:save pre-migration
`);
  process.exit(1);
}

async function main() {
  const name = process.argv[2];

  if (!name) {
    console.error('Error: name is required\n');
    usage();
  }

  // Ensure snapshot directory exists
  if (!fs.existsSync(SNAPSHOT_DIR)) {
    fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('Error: DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  // Extract database name from URL
  const dbMatch = dbUrl.match(/\/([^?]+)(\?|$)/);
  const dbName = dbMatch ? dbMatch[1] : 'database';

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `${name}-${timestamp}.sql.gz`;
  const filepath = path.join(SNAPSHOT_DIR, filename);

  console.log(`📸 Saving snapshot: ${name}`);
  console.log(`   Database: ${dbName}`);
  console.log(`   Output: ${filepath}`);

  try {
    // pg_dump with compression
    // Exclude specific tables if needed (like large log tables)
    const excludeTable = '--exclude-table-data=event_logs --exclude-table-data=agent_logs';
    
    const command = `pg_dump "${dbUrl}" --format=custom --compress=9 --file="${filepath}" ${excludeTable}`;
    
    execSync(command, { stdio: 'inherit' });

    // Get file size
    const stats = fs.statSync(filepath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log(`\n✅ Snapshot saved successfully!`);
    console.log(`   File: ${filename}`);
    console.log(`   Size: ${sizeMB} MB`);

    // Create a symlink with just the name for easy access
    const latestLink = path.join(SNAPSHOT_DIR, `${name}-latest.sql.gz`);
    if (fs.existsSync(latestLink)) {
      fs.unlinkSync(latestLink);
    }
    fs.symlinkSync(filename, latestLink);
    console.log(`   Latest: ${name}-latest.sql.gz -> ${filename}`);

  } catch (error) {
    console.error('\n❌ Failed to save snapshot:', error);
    process.exit(1);
  }
}

main();
