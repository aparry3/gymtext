/**
 * Seed Exercises
 *
 * Seeds exercises table with default exercises.
 * Uses upsert - idempotent (safe to run multiple times).
 *
 * Note: For full exercise seeding with embeddings, use:
 *   pnpm seed:exercise-db (full database)
 *   pnpm seed:embeddings (vector embeddings)
 *
 * This seeder provides basic exercises for testing.
 *
 * Run: pnpm seed:exercises
 */

import 'dotenv/config';
import { Pool } from 'pg';

interface Exercise {
  slug: string;
  name: string;
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
  aliases: string[];
  popularity: number;
}

const DEFAULT_EXERCISES: Exercise[] = [
  {
    slug: 'barbell-bench-press',
    name: 'Barbell Bench Press',
    status: 'active',
    type: 'compound',
    mechanics: 'push',
    training_groups: ['chest', 'triceps', 'shoulders'],
    movement_patterns: ['horizontal_push'],
    primary_muscles: ['pectoralis_major'],
    secondary_muscles: ['triceps', 'anterior_deltoid'],
    equipment: ['barbell', 'bench'],
    modality: 'weights',
    intensity: 'high',
    short_description: 'Classic chest exercise using a barbell on a flat bench',
    instructions: '1. Lie on flat bench with feet on floor\n2. Grip bar slightly wider than shoulder width\n3. Lower bar to mid-chest\n4. Press bar back up to start\n5. Keep shoulder blades retracted',
    cues: ['Keep elbows at 45 degrees', 'Drive through your chest', 'Maintain arch in lower back'],
    aliases: ['bench_press', 'bb_bench', 'bench press'],
    popularity: 100,
  },
  {
    slug: 'overhead-press',
    name: 'Overhead Press',
    status: 'active',
    type: 'compound',
    mechanics: 'push',
    training_groups: ['shoulders', 'triceps'],
    movement_patterns: ['vertical_push'],
    primary_muscles: ['deltoid'],
    secondary_muscles: ['triceps', 'upper_pec'],
    equipment: ['barbell'],
    modality: 'weights',
    intensity: 'high',
    short_description: 'Standing or seated press for shoulder development',
    instructions: '1. Stand with bar at shoulder height\n2. Grip slightly wider than shoulders\n3. Press bar overhead\n4. Lock out arms at top\n5. Lower with control',
    cues: ['Keep core tight', 'Don\'t arch lower back', 'Move head back as bar passes'],
    aliases: ['ohp', 'military_press', 'overhead press'],
    popularity: 95,
  },
  {
    slug: 'barbell-row',
    name: 'Barbell Row',
    status: 'active',
    type: 'compound',
    mechanics: 'pull',
    training_groups: ['back', 'biceps'],
    movement_patterns: ['horizontal_pull'],
    primary_muscles: ['latissimus_dorsi', 'rhomboids'],
    secondary_muscles: ['biceps', 'rear_deltoid'],
    equipment: ['barbell'],
    modality: 'weights',
    intensity: 'high',
    short_description: 'Bent-over row for back thickness',
    instructions: '1. Hinge at hips, keep back flat\n2. Grip bar shoulder width\n3. Pull bar to lower chest\n4. Squeeze shoulder blades\n5. Lower with control',
    cues: ['Keep torso parallel to floor', 'Pull to your chest, not stomach', 'Lead with elbows'],
    aliases: ['bb_row', 'bent_over_row', 'barbell row'],
    popularity: 98,
  },
  {
    slug: 'pull-up',
    name: 'Pull-Up',
    status: 'active',
    type: 'compound',
    mechanics: 'pull',
    training_groups: ['back', 'biceps'],
    movement_patterns: ['vertical_pull'],
    primary_muscles: ['latissimus_dorsi'],
    secondary_muscles: ['biceps', 'rear_deltoid'],
    equipment: ['pull_up_bar'],
    modality: 'bodyweight',
    intensity: 'high',
    short_description: 'Classic bodyweight vertical pull for back and biceps',
    instructions: '1. Hang from bar with overhand grip\n2. Pull body up until chin over bar\n3. Lower with control\n4. Full range of motion',
    cues: ['Engage lats first', 'Keep elbows close to body', 'Avoid swinging'],
    aliases: ['chin_up', 'pullup', 'pull up'],
    popularity: 99,
  },
  {
    slug: 'barbell-squat',
    name: 'Barbell Squat',
    status: 'active',
    type: 'compound',
    mechanics: 'push',
    training_groups: ['quadriceps', 'glutes', 'hamstrings'],
    movement_patterns: ['squat'],
    primary_muscles: ['quadriceps', 'gluteus_maximus'],
    secondary_muscles: ['hamstrings', 'core'],
    equipment: ['barbell', 'squat_rack'],
    modality: 'weights',
    intensity: 'high',
    short_description: 'King of leg exercises - barbell back squat',
    instructions: '1. Position bar on upper back\n2. Feet shoulder width apart\n3. Brace core\n4. Descend until thighs parallel\n5. Drive up through heels',
    cues: ['Keep chest up', 'Knees track over toes', 'Push knees out'],
    aliases: ['squat', 'bb_squat', 'back squat'],
    popularity: 100,
  },
  {
    slug: 'barbell-deadlift',
    name: 'Barbell Deadlift',
    status: 'active',
    type: 'compound',
    mechanics: 'hinge',
    training_groups: ['back', 'glutes', 'hamstrings'],
    movement_patterns: ['hip_hinge'],
    primary_muscles: ['gluteus_maximus', 'hamstrings', 'erector_spinae'],
    secondary_muscles: ['quadriceps', 'core', 'lats'],
    equipment: ['barbell'],
    modality: 'weights',
    intensity: 'high',
    short_description: 'Fundamental hip hinge movement for posterior chain',
    instructions: '1. Stand with feet hip width\n2. Grip bar outside knees\n3. Keep back flat, chest up\n4. Drive through heels\n5. Stand tall, squeeze glutes',
    cues: ['Keep bar close to body', 'Engage lats', 'Lead with hips not shoulders'],
    aliases: ['dl', 'conventional_deadlift', 'deadlift'],
    popularity: 100,
  },
  {
    slug: 'barbell-curl',
    name: 'Barbell Curl',
    status: 'active',
    type: 'isolation',
    mechanics: 'pull',
    training_groups: ['biceps'],
    movement_patterns: ['elbow_flexion'],
    primary_muscles: ['biceps_brachii'],
    secondary_muscles: ['brachialis', 'forearms'],
    equipment: ['barbell'],
    modality: 'weights',
    intensity: 'moderate',
    short_description: 'Classic bicep builder',
    instructions: '1. Stand with barbell, arms extended\n2. Curl bar up\n3. Squeeze at top\n4. Lower with control',
    cues: ['Keep elbows at sides', 'Don\'t swing', 'Full range of motion'],
    aliases: ['bb_curl', 'bicep_curl', 'curl'],
    popularity: 85,
  },
  {
    slug: 'tricep-pushdown',
    name: 'Tricep Pushdown',
    status: 'active',
    type: 'isolation',
    mechanics: 'push',
    training_groups: ['triceps'],
    movement_patterns: ['elbow_extension'],
    primary_muscles: ['triceps'],
    secondary_muscles: [],
    equipment: ['cable', 'rope_attachment'],
    modality: 'weights',
    intensity: 'moderate',
    short_description: 'Cable exercise for tricep development',
    instructions: '1. Face cable machine\n2. Grip rope or bar\n3. Push down until arms straight\n4. Control the return',
    cues: ['Keep elbows at sides', 'Squeeze at bottom', 'Don\'t lean forward'],
    aliases: ['pushdown', 'tricep_pushdown', 'tricep pushdown'],
    popularity: 80,
  },
  {
    slug: 'plank',
    name: 'Plank',
    status: 'active',
    type: 'isolation',
    mechanics: 'anti_extension',
    training_groups: ['core'],
    movement_patterns: ['core_stability'],
    primary_muscles: ['rectus_abdominis', 'transverse_abdominis'],
    secondary_muscles: ['obliques', 'shoulders'],
    equipment: ['bodyweight'],
    modality: 'bodyweight',
    intensity: 'moderate',
    short_description: 'Isometric core stabilization exercise',
    instructions: '1. Forearms on ground\n2. Body in straight line\n3. Engage core\n4. Hold position',
    cues: ['Don\'t let hips sag', 'Squeeze glutes', 'Breathe normally'],
    aliases: ['front_plank', 'hover', 'plank hold'],
    popularity: 90,
  },
];

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

    for (const exercise of DEFAULT_EXERCISES) {
      await pool.query(
        `INSERT INTO exercises (
          slug, name, status, type, mechanics,
          training_groups, movement_patterns,
          primary_muscles, secondary_muscles, equipment,
          modality, intensity, short_description,
          instructions, cues, aliases, popularity
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name, status = EXCLUDED.status, type = EXCLUDED.type,
          mechanics = EXCLUDED.mechanics, training_groups = EXCLUDED.training_groups,
          movement_patterns = EXCLUDED.movement_patterns, primary_muscles = EXCLUDED.primary_muscles,
          secondary_muscles = EXCLUDED.secondary_muscles, equipment = EXCLUDED.equipment,
          modality = EXCLUDED.modality, intensity = EXCLUDED.intensity,
          short_description = EXCLUDED.short_description, instructions = EXCLUDED.instructions,
          cues = EXCLUDED.cues, aliases = EXCLUDED.aliases,
          popularity = EXCLUDED.popularity, updated_at = NOW()
        `,
        [
          exercise.slug, exercise.name, exercise.status, exercise.type, exercise.mechanics,
          exercise.training_groups, exercise.movement_patterns, exercise.primary_muscles,
          exercise.secondary_muscles, exercise.equipment, exercise.modality, exercise.intensity,
          exercise.short_description, exercise.instructions, exercise.cues,
          exercise.aliases, exercise.popularity
        ]
      );
      console.log(`  ✓ ${exercise.name}`);
    }

    console.log(`✅ Seeded ${DEFAULT_EXERCISES.length} exercises`);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  seedExercises()
    .then(() => process.exit(0))
    .catch((err) => { console.error(err); process.exit(1); });
}
