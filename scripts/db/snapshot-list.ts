/**
 * Database Snapshot List
 *
 * Lists all available database snapshots.
 * 
 * Usage:
 *   pnpm db:snapshot:list
 */

import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';

const SNAPSHOT_DIR = path.join(process.cwd(), 'db', 'snapshots');

async function main() {
  console.log('📸 Available Snapshots\n');
  console.log(`   Directory: ${SNAPSHOT_DIR}\n`);

  if (!fs.existsSync(SNAPSHOT_DIR)) {
    console.log('   No snapshots found (directory does not exist)');
    return;
  }

  const files = fs.readdirSync(SNAPSHOT_DIR)
    .filter(f => f.endsWith('.sql.gz'))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.log('   No snapshots found');
    return;
  }

  console.log('   Filename                                    Size     Date');
  console.log('   '.padEnd(70, '-'));

  for (const file of files) {
    const filepath = path.join(SNAPSHOT_DIR, file);
    const stats = fs.statSync(filepath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(1).padStart(6);
    const date = stats.mtime.toISOString().slice(0, 10);
    const isLatest = file.includes('-latest');
    const latestFlag = isLatest ? ' (latest)' : '';
    
    console.log(`   ${file.padEnd(45)} ${sizeMB} MB  ${date}${latestFlag}`);
  }

  console.log('');
  console.log('Usage:');
  console.log('  pnpm db:snapshot:save <name>    - Save a new snapshot');
  console.log('  pnpm db:snapshot:restore <name> - Restore a snapshot');
  console.log('');
}

main();
