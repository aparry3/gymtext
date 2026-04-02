import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const migrationsDir = join(process.cwd(), 'migrations');

// Ensure migrations directory exists
if (!existsSync(migrationsDir)) {
  mkdirSync(migrationsDir, { recursive: true });
}

// Get migration name from command line args
const migrationName = process.argv[2];
if (!migrationName) {
  console.error('Please provide a migration name');
  process.exit(1);
}

// Guard: feature branches can only have one migration
const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
const protectedBranches = ['main', 'staging', 'new-agent-system'];

if (!protectedBranches.includes(branch)) {
  try {
    const addedMigrations = execSync(
      'git diff --name-only main --diff-filter=A -- migrations/',
      { encoding: 'utf-8' }
    ).trim();

    if (addedMigrations) {
      const files = addedMigrations.split('\n').filter(Boolean);
      console.error('');
      console.error('ERROR: This branch already has a migration:');
      files.forEach(f => console.error(`  → ${f}`));
      console.error('');
      console.error('Feature branches must have at most ONE migration file.');
      console.error('Update the existing migration instead of creating a new one.');
      console.error('');
      process.exit(1);
    }
  } catch {
    // git diff may fail if main doesn't exist locally — skip the check
  }
}

// Create timestamp
const now = new Date();
const timestamp = now.getFullYear().toString() +
  (now.getMonth() + 1).toString().padStart(2, '0') +
  now.getDate().toString().padStart(2, '0') +
  now.getHours().toString().padStart(2, '0') +
  now.getMinutes().toString().padStart(2, '0') +
  now.getSeconds().toString().padStart(2, '0');

// Create migration file name
const fileName = `${timestamp}_${migrationName}.ts`;

// Create migration file content
const content = `import { Migration } from 'kysely';

export const up: Migration = async (db) => {
  // Write your up migration here
};

export const down: Migration = async (db) => {
  // Write your down migration here
};
`;

// Write the file
const filePath = join(migrationsDir, fileName);
writeFileSync(filePath, content);

console.log(`Created migration: ${fileName}`);
