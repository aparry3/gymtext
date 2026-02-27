#!/usr/bin/env tsx
/**
 * Fixture Capture CLI
 *
 * Captures agent test fixtures from agent_logs for the most recent run
 * of each persona.
 *
 * Usage:
 *   pnpm fixture:capture --user sarah-chen
 *   pnpm fixture:capture --all
 *   pnpm fixture:capture --all --overwrite
 *   pnpm fixture:capture --log-id abc-123
 */
import { Command } from 'commander';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { captureFixtures } from './lib/capturer';

const PERSONAS_DIR = path.resolve(__dirname, '../test-data/personas');

interface Persona {
  id: string;
  userData: { name: string; phone: string };
}

const program = new Command()
  .name('fixture:capture')
  .description('Capture agent test fixtures from agent_logs (most recent run)')
  .option('--user <persona>', 'Persona ID (e.g., sarah-chen)')
  .option('--all', 'Capture fixtures for all personas')
  .option('--log-id <id>', 'Specific agent log ID')
  .option('--overwrite', 'Overwrite existing fixtures', false)
  .parse();

const opts = program.opts();

function loadPersonas(): Persona[] {
  return fs.readdirSync(PERSONAS_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => JSON.parse(fs.readFileSync(path.join(PERSONAS_DIR, f), 'utf-8')) as Persona);
}

async function lookupUserId(db: Kysely<any>, phone: string): Promise<string | null> {
  const row = await db.selectFrom('users')
    .select('id')
    .where('phone_number', '=', phone)
    .executeTakeFirst() as { id: string } | undefined;
  return row?.id ?? null;
}

async function captureForPersona(db: Kysely<any>, persona: Persona): Promise<string[]> {
  const userId = await lookupUserId(db, persona.userData.phone);
  if (!userId) {
    console.log(`  Skipping ${persona.id} (no user found for ${persona.userData.phone})`);
    return [];
  }

  return captureFixtures({
    db,
    persona: persona.id,
    userId,
    overwrite: opts.overwrite,
  });
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('Error: DATABASE_URL must be set. Run: source .env.local');
    process.exit(1);
  }

  if (!opts.user && !opts.all && !opts.logId) {
    console.error('Error: --user, --all, or --log-id is required');
    process.exit(1);
  }

  const db = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: new Pool({ connectionString }),
    }),
  });

  try {
    let allWritten: string[] = [];

    if (opts.all) {
      const personas = loadPersonas();
      console.log(`Capturing fixtures for all ${personas.length} personas\n`);

      for (const persona of personas) {
        console.log(`${persona.id}:`);
        const written = await captureForPersona(db, persona);
        if (written.length > 0) {
          for (const f of written) {
            console.log(`  ${path.basename(f)}`);
          }
        }
        allWritten.push(...written);
      }
    } else if (opts.user) {
      console.log(`Capturing fixtures for persona: ${opts.user}\n`);

      const personas = loadPersonas();
      const persona = personas.find(p => p.id === opts.user);

      if (!persona) {
        console.error(`Error: persona '${opts.user}' not found in ${PERSONAS_DIR}`);
        process.exit(1);
      }

      allWritten = await captureForPersona(db, persona);
    } else if (opts.logId) {
      console.log(`Capturing fixture from log: ${opts.logId}\n`);
      allWritten = await captureFixtures({
        db,
        persona: 'manual',
        userId: '', // not used when logIds provided
        logIds: [opts.logId],
        overwrite: opts.overwrite,
      });
    }

    console.log(`\nCaptured ${allWritten.length} fixture(s) total`);
  } finally {
    await db.destroy();
  }
}

main().catch(err => {
  console.error('Capture failed:', err);
  process.exit(1);
});
