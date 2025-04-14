import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const migrationsDir = join(process.cwd(), 'src/db/migrations');

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