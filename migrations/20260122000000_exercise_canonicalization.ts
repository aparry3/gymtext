import { Kysely, sql } from 'kysely';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Exercise Canonicalization Migration
 *
 * Creates tables for canonical exercises and their aliases to enable:
 * - Stable progress tracking across workouts
 * - Exercise resolution from various naming conventions
 * - Rich exercise metadata for UI and analysis
 *
 * Tables:
 * - exercises: Canonical exercise definitions with metadata
 * - exercise_aliases: Normalized aliases for fast lookup
 *
 * Seeds 873 exercises from exercises.json with their canonical names as initial aliases.
 */

interface ExerciseJson {
  name: string;
  force: string | null;
  level: string;
  mechanic: string | null;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  category: string;
}

interface ExercisesFile {
  exercises: ExerciseJson[];
}

/**
 * Normalize an exercise name for consistent matching
 * Duplicated from exerciseNormalization.ts to avoid import issues in migration
 */
function normalizeExerciseName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function up(db: Kysely<unknown>): Promise<void> {
  console.log('Starting exercise canonicalization migration...');

  // Step 1: Create exercises table
  await sql`
    CREATE TABLE exercises (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name varchar(200) NOT NULL UNIQUE,
      aliases text[],
      primary_muscles text[],
      secondary_muscles text[],
      force varchar(20),
      level varchar(20) NOT NULL,
      mechanic varchar(20),
      equipment varchar(50),
      category varchar(50) NOT NULL,
      instructions text[],
      description text,
      tips text[],
      is_active boolean NOT NULL DEFAULT true,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `.execute(db);

  console.log('Created exercises table');

  // Step 2: Create exercise_aliases table
  await sql`
    CREATE TABLE exercise_aliases (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      exercise_id uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
      alias varchar(200) NOT NULL,
      alias_normalized varchar(200) NOT NULL UNIQUE,
      source varchar(50) NOT NULL DEFAULT 'seed',
      confidence_score decimal(3,2),
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `.execute(db);

  console.log('Created exercise_aliases table');

  // Step 3: Create indexes
  await sql`CREATE INDEX idx_exercises_name ON exercises(name)`.execute(db);
  await sql`CREATE INDEX idx_exercises_category ON exercises(category)`.execute(db);
  await sql`CREATE INDEX idx_exercise_aliases_exercise_id ON exercise_aliases(exercise_id)`.execute(db);
  // Note: alias_normalized already has UNIQUE constraint which creates an index

  console.log('Created indexes');

  // Step 4: Seed data from exercises.json
  const exercisesPath = path.join(process.cwd(), 'exercises.json');

  if (!fs.existsSync(exercisesPath)) {
    console.log('exercises.json not found, skipping seed data');
    return;
  }

  const exercisesFile: ExercisesFile = JSON.parse(fs.readFileSync(exercisesPath, 'utf-8'));
  const exercises = exercisesFile.exercises;

  console.log(`Seeding ${exercises.length} exercises...`);

  // Track normalized aliases to detect duplicates
  const seenNormalized = new Set<string>();
  let exerciseCount = 0;
  let aliasCount = 0;

  for (const exercise of exercises) {
    // Insert exercise
    const result = await sql`
      INSERT INTO exercises (
        name,
        aliases,
        primary_muscles,
        secondary_muscles,
        force,
        level,
        mechanic,
        equipment,
        category,
        instructions
      ) VALUES (
        ${exercise.name},
        ${sql.raw(`ARRAY[${exercise.name ? `'${exercise.name.replace(/'/g, "''")}'` : ''}]::text[]`)},
        ${sql.raw(`ARRAY[${exercise.primaryMuscles.map(m => `'${m.replace(/'/g, "''")}'`).join(',')}]::text[]`)},
        ${sql.raw(`ARRAY[${exercise.secondaryMuscles.map(m => `'${m.replace(/'/g, "''")}'`).join(',')}]::text[]`)},
        ${exercise.force},
        ${exercise.level},
        ${exercise.mechanic},
        ${exercise.equipment},
        ${exercise.category},
        ${sql.raw(`ARRAY[${exercise.instructions.map(i => `'${i.replace(/'/g, "''")}'`).join(',')}]::text[]`)}
      )
      RETURNING id
    `.execute(db);

    const exerciseId = (result.rows[0] as { id: string }).id;
    exerciseCount++;

    // Create normalized alias for the canonical name
    const normalized = normalizeExerciseName(exercise.name);

    if (!seenNormalized.has(normalized)) {
      await sql`
        INSERT INTO exercise_aliases (
          exercise_id,
          alias,
          alias_normalized,
          source,
          confidence_score
        ) VALUES (
          ${exerciseId}::uuid,
          ${exercise.name},
          ${normalized},
          'seed',
          1.00
        )
      `.execute(db);

      seenNormalized.add(normalized);
      aliasCount++;
    } else {
      console.log(`Skipping duplicate normalized alias: "${normalized}" (from: "${exercise.name}")`);
    }
  }

  console.log(`Seeded ${exerciseCount} exercises with ${aliasCount} aliases`);
  console.log('Exercise canonicalization migration complete!');
}

export async function down(db: Kysely<unknown>): Promise<void> {
  console.log('Rolling back exercise canonicalization...');

  // Drop tables (indexes are dropped automatically)
  await sql`DROP TABLE IF EXISTS exercise_aliases`.execute(db);
  await sql`DROP TABLE IF EXISTS exercises`.execute(db);

  console.log('Rollback complete');
}
