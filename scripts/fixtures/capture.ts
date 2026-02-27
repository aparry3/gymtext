#!/usr/bin/env tsx
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
  .description('Capture agent test fixtures from agent_logs')
  .option('--user <persona>', 'Persona ID (e.g., sarah-chen)')
  .option('--all', 'Capture fixtures for all personas')
  .option('--since <time>', 'Time window (e.g., "5 minutes ago")', '10 minutes ago')
  .option('--log-id <id>', 'Specific agent log ID')
  .option('--user-id <id>', 'Filter by user ID in logs')
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

async function captureForPersona(
  db: Kysely<any>,
  persona: Persona,
  since: Date | undefined,
): Promise<string[]> {
  const userId = await lookupUserId(db, persona.userData.phone);
  if (!userId) {
    console.log(`  Skipping ${persona.id} (no user found for ${persona.userData.phone})`);
    return [];
  }

  return captureFixtures({
    db,
    persona: persona.id,
    since,
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
    const since = opts.since ? parseSince(opts.since) : undefined;
    let allWritten: string[] = [];

    if (opts.all) {
      const personas = loadPersonas();
      console.log(`Capturing fixtures for all ${personas.length} personas`);
      if (since) console.log(`  Since: ${since.toISOString()}`);

      for (const persona of personas) {
        console.log(`\n${persona.id}:`);
        const written = await captureForPersona(db, persona, since);
        allWritten.push(...written);
      }
    } else if (opts.user) {
      console.log(`Capturing fixtures for persona: ${opts.user}`);
      if (since) console.log(`  Since: ${since.toISOString()}`);

      // Try to find persona file for phone lookup
      const personas = loadPersonas();
      const persona = personas.find(p => p.id === opts.user);

      if (persona) {
        allWritten = await captureForPersona(db, persona, since);
      } else {
        // No persona file — use --user-id if provided, or capture without userId filter
        allWritten = await captureFixtures({
          db,
          persona: opts.user,
          since,
          userId: opts.userId,
          overwrite: opts.overwrite,
        });
      }
    } else if (opts.logId) {
      console.log(`Capturing fixture from log: ${opts.logId}`);
      allWritten = await captureFixtures({
        db,
        persona: opts.user || 'unknown',
        logIds: [opts.logId],
        overwrite: opts.overwrite,
      });
    }

    console.log(`\nCaptured ${allWritten.length} fixture(s):`);
    for (const f of allWritten) {
      console.log(`  ${f}`);
    }
  } finally {
    await db.destroy();
  }
}

function parseSince(sinceStr: string): Date {
  // Parse "N minutes ago", "N hours ago" etc.
  const match = sinceStr.match(/^(\d+)\s+(minute|hour|day|second)s?\s+ago$/i);
  if (match) {
    const amount = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();
    const now = Date.now();
    const msMap: Record<string, number> = {
      second: 1000,
      minute: 60_000,
      hour: 3_600_000,
      day: 86_400_000,
    };
    return new Date(now - amount * (msMap[unit] || 60_000));
  }
  // Try ISO date
  const d = new Date(sinceStr);
  if (isNaN(d.getTime())) {
    throw new Error(`Cannot parse time: ${sinceStr}`);
  }
  return d;
}

main().catch(err => {
  console.error('Capture failed:', err);
  process.exit(1);
});
