/**
 * Seed Exercises
 *
 * Seeds exercises and exercise_aliases tables from exercises.json.
 * Uses upsert - idempotent (safe to run multiple times).
 *
 * Note: For full exercise seeding with embeddings, use:
 *   pnpm seed:exercise-db (full database)
 *   pnpm seed:embeddings (vector embeddings)
 *
 * Run: pnpm seed:exercises
 */

import 'dotenv/config';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

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

// Normalize function for search (matches exerciseNormalization.ts)
function normalizeForSearch(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Normalize function for Lex (full text search)
function normalizeForLex(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .join(' ');
}

export async function seedExercises(): Promise<void> {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || process.env.SANDBOX_DATABASE_URL,
  });

  try {
    console.log('Seeding exercises...');

    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'exercises'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('⚠️  exercises table does not exist. Run migrations first.');
      return;
    }

    // Load exercises from exercises.json
    const exercisesPath = path.join(__dirname, '../../..', 'exercises.json');
    const exercisesData: ExercisesFile = JSON.parse(fs.readFileSync(exercisesPath, 'utf-8'));
    const exercises = exercisesData.exercises;
    console.log(`Loaded ${exercises.length} exercises from exercises.json`);

    // Clear existing data (cascade will handle aliases)
    console.log('Clearing existing exercises...');
    await pool.query('TRUNCATE exercises CASCADE');

    let totalAliases = 0;

    for (const exercise of exercises) {
      // Insert exercise with ON CONFLICT DO UPDATE
      await pool.query(
        `INSERT INTO exercises (
          slug, name, status, type, mechanics,
          training_groups, movement_patterns,
          primary_muscles, secondary_muscles, equipment,
          modality, intensity, short_description,
          instructions, cues, aliases, popularity, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name, status = EXCLUDED.status, type = EXCLUDED.type,
          mechanics = EXCLUDED.mechanics, training_groups = EXCLUDED.training_groups,
          movement_patterns = EXCLUDED.movement_patterns, primary_muscles = EXCLUDED.primary_muscles,
          secondary_muscles = EXCLUDED.secondary_muscles, equipment = EXCLUDED.equipment,
          modality = EXCLUDED.modality, intensity = EXCLUDED.intensity,
          short_description = EXCLUDED.short_description, instructions = EXCLUDED.instructions,
          cues = EXCLUDED.cues, aliases = EXCLUDED.aliases,
          popularity = EXCLUDED.popularity, is_active = EXCLUDED.is_active, updated_at = NOW()
        `,
        [
          exercise.slug, exercise.name, exercise.status, exercise.type, exercise.mechanics,
          exercise.training_groups, exercise.movement_patterns, exercise.primary_muscles,
          exercise.secondary_muscles, exercise.equipment, exercise.modality, exercise.intensity,
          exercise.short_description, exercise.instructions, exercise.cues,
          exercise.aliases, exercise.popularity, exercise.status === 'active'
        ]
      );

      // Get the inserted exercise ID
      const result = await pool.query('SELECT id FROM exercises WHERE slug = $1', [exercise.slug]);
      const exerciseId = result.rows[0]?.id;

      if (!exerciseId) {
        console.log(`  ⚠️  Failed to get ID for ${exercise.name}`);
        continue;
      }

      // Insert aliases
      const seenNormalized = new Set<string>();

      // Default alias = exercise name
      const nameNormalized = normalizeForSearch(exercise.name);
      if (nameNormalized && !seenNormalized.has(nameNormalized)) {
        seenNormalized.add(nameNormalized);
        await pool.query(
          `INSERT INTO exercise_aliases (exercise_id, alias, alias_normalized, alias_lex, source, is_default)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (alias_normalized) DO NOTHING`,
          [exerciseId, exercise.name, nameNormalized, normalizeForLex(exercise.name), 'default', true]
        );
        totalAliases++;
      }

      // Additional aliases from the aliases array
      for (const alias of exercise.aliases) {
        const normalized = normalizeForSearch(alias);
        if (normalized && !seenNormalized.has(normalized)) {
          seenNormalized.add(normalized);
          await pool.query(
            `INSERT INTO exercise_aliases (exercise_id, alias, alias_normalized, alias_lex, source, is_default)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (alias_normalized) DO NOTHING`,
            [exerciseId, alias, normalized, normalizeForLex(alias), 'seed', false]
          );
          totalAliases++;
        }
      }

      console.log(`  ✓ ${exercise.name} (${exercise.aliases.length + 1} aliases)`);
    }

    console.log(`✅ Seeded ${exercises.length} exercises and ${totalAliases} aliases`);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  seedExercises()
    .then(() => process.exit(0))
    .catch((err) => { console.error(err); process.exit(1); });
}
