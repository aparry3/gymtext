/**
 * Seed Exercise Database
 *
 * Populates the exercises and exercise_aliases tables from exercises.json.
 * Run: pnpm seed:exercise-db
 */

import { Kysely, PostgresDialect, sql } from 'kysely';
import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';
import { normalizeForSearch, normalizeForLex } from '../packages/shared/src/server/utils/exerciseNormalization';

// Types for exercises.json structure
interface ExerciseJson {
  name: string;
  slug: string;
  status: string;
  type: string;
  mechanics: string;
  training_groups: string[];
  movement_patterns: string[];
  primary_muscles: string[];
  secondary_muscles: string[];
  equipment: string[];
  modality: string;
  intensity: string;
  short_description: string;
  instructions: string;
  cues: string[];
  parent_exercise_slug: string;
  variation_label: string;
  aliases: string[];
  popularity: number;
  movement_slug?: string;
}

interface ExercisesFile {
  exercises: ExerciseJson[];
}

// Connect to database
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set. Run: source .env.local');
}

const pool = new Pool({ connectionString: databaseUrl, max: 10 });
const db = new Kysely<unknown>({
  dialect: new PostgresDialect({ pool }),
});

async function main() {
  console.log('Reading exercises.json...');
  const filePath = join(process.cwd(), 'data', 'exercises.json');
  const raw = readFileSync(filePath, 'utf-8');
  const data: ExercisesFile = JSON.parse(raw);
  const exercises = data.exercises;
  console.log(`Found ${exercises.length} exercises`);

  // Load movements for slug -> id lookup
  const movementRows = await sql<{ id: string; slug: string }>`SELECT id, slug FROM movements`.execute(db);
  const movementMap = new Map(movementRows.rows.map(m => [m.slug, m.id]));
  console.log(`Loaded ${movementRows.rows.length} movements`);

  // Clear existing data
  console.log('Truncating exercises (cascade)...');
  await sql`TRUNCATE exercises CASCADE`.execute(db);

  // Insert exercises in batches
  const BATCH_SIZE = 50;
  let totalAliases = 0;

  for (let i = 0; i < exercises.length; i += BATCH_SIZE) {
    const batch = exercises.slice(i, i + BATCH_SIZE);

    for (const ex of batch) {
      // Resolve movement_id from slug
      const movementId = ex.movement_slug ? (movementMap.get(ex.movement_slug) || null) : null;

      // Insert exercise
      const result = await sql`
        INSERT INTO exercises (
          name, slug, status, type, mechanics,
          training_groups, movement_patterns, primary_muscles, secondary_muscles,
          equipment, modality, intensity, short_description, instructions,
          cues, aliases, popularity, is_active, movement_id
        ) VALUES (
          ${ex.name},
          ${ex.slug},
          ${ex.status},
          ${ex.type},
          ${ex.mechanics || null},
          ${sql.raw(`ARRAY[${ex.training_groups.map(v => `'${v.replace(/'/g, "''")}'`).join(',')}]::text[]`)},
          ${sql.raw(`ARRAY[${ex.movement_patterns.map(v => `'${v.replace(/'/g, "''")}'`).join(',')}]::text[]`)},
          ${sql.raw(`ARRAY[${ex.primary_muscles.map(v => `'${v.replace(/'/g, "''")}'`).join(',')}]::text[]`)},
          ${sql.raw(`ARRAY[${ex.secondary_muscles.map(v => `'${v.replace(/'/g, "''")}'`).join(',')}]::text[]`)},
          ${sql.raw(`ARRAY[${ex.equipment.map(v => `'${v.replace(/'/g, "''")}'`).join(',')}]::text[]`)},
          ${ex.modality},
          ${ex.intensity},
          ${ex.short_description},
          ${ex.instructions},
          ${sql.raw(`ARRAY[${ex.cues.map(v => `'${v.replace(/'/g, "''")}'`).join(',')}]::text[]`)},
          ${sql.raw(`ARRAY[${ex.aliases.map(v => `'${v.replace(/'/g, "''")}'`).join(',')}]::text[]`)},
          ${ex.popularity},
          ${ex.status === 'active'},
          ${movementId}
        )
        RETURNING id
      `.execute(db);

      const exerciseId = (result.rows[0] as { id: string }).id;

      // Build aliases for this exercise
      const aliasRows: { exerciseId: string; alias: string; aliasNormalized: string; aliasLex: string; source: string; isDefault: boolean }[] = [];
      const seenNormalized = new Set<string>();

      // Default alias = exercise name
      const nameNormalized = normalizeForSearch(ex.name);
      if (nameNormalized && !seenNormalized.has(nameNormalized)) {
        seenNormalized.add(nameNormalized);
        aliasRows.push({
          exerciseId,
          alias: ex.name,
          aliasNormalized: nameNormalized,
          aliasLex: normalizeForLex(ex.name),
          source: 'default',
          isDefault: true,
        });
      }

      // Additional aliases from the aliases array
      for (const alias of ex.aliases) {
        const normalized = normalizeForSearch(alias);
        if (normalized && !seenNormalized.has(normalized)) {
          seenNormalized.add(normalized);
          aliasRows.push({
            exerciseId,
            alias,
            aliasNormalized: normalized,
            aliasLex: normalizeForLex(alias),
            source: 'seed',
            isDefault: false,
          });
        }
      }

      // Insert aliases with ON CONFLICT DO NOTHING for global uniqueness
      for (const row of aliasRows) {
        await sql`
          INSERT INTO exercise_aliases (exercise_id, alias, alias_normalized, alias_lex, source, is_default)
          VALUES (${row.exerciseId}, ${row.alias}, ${row.aliasNormalized}, ${row.aliasLex}, ${row.source}, ${row.isDefault})
          ON CONFLICT (alias_normalized) DO NOTHING
        `.execute(db);
      }

      totalAliases += aliasRows.length;
    }

    console.log(`  Inserted exercises ${i + 1}-${Math.min(i + BATCH_SIZE, exercises.length)}`);
  }

  // Verify counts
  const exerciseCount = await sql<{ count: string }>`SELECT count(*) as count FROM exercises`.execute(db);
  const aliasCount = await sql<{ count: string }>`SELECT count(*) as count FROM exercise_aliases`.execute(db);

  console.log('\n--- Summary ---');
  console.log(`Exercises in DB: ${exerciseCount.rows[0].count}`);
  console.log(`Aliases in DB: ${aliasCount.rows[0].count}`);
  console.log(`Aliases attempted: ${totalAliases}`);
  console.log('Done!');

  await db.destroy();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
