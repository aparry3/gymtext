import { Kysely, PostgresDialect, CamelCasePlugin } from 'kysely';
import { Pool } from 'pg';
import { DB } from '@/server/models';
import { initializeModel } from '@/server/agents/base';
import { _MesocycleSchema, _FitnessPlanSchema } from '@/server/models/fitnessPlan/schema';
import { _StructuredMicrocycleSchema } from '@/server/models/microcycle/schema';
import { _EnhancedWorkoutInstanceSchema } from '@/server/models/workout/schema';
import { writeFileSync } from 'fs';

/**
 * Data Migration Script: Legacy to New Schema Format
 *
 * Transforms existing fitness plans, mesocycles, microcycles, and workout instances
 * from old JSON schemas to new structured schemas using LLM transformations.
 *
 * Usage:
 *   source .env.local && tsx scripts/migrations/data-migration-schema-update.ts [--dry-run] [--force]
 */

// ============================================================================
// Configuration & Setup
// ============================================================================

const isDryRun = process.argv.includes('--dry-run');
const isForce = process.argv.includes('--force');

// Database connection
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({ connectionString: databaseUrl, max: 10 });
const db = new Kysely<DB>({
  dialect: new PostgresDialect({ pool }),
  plugins: [new CamelCasePlugin()]
});

// ============================================================================
// Format Detection Helpers
// ============================================================================

function isOldMesocycleFormat(mesocycle: any): boolean {
  // Old format: { name, weeks, focus, deload }
  // New format: { name, objective, durationWeeks, startWeek, endWeek, ... }
  return !mesocycle.objective && !mesocycle.durationWeeks && !mesocycle.startWeek;
}

function isOldMicrocycleFormat(pattern: any): boolean {
  // Old format: missing key fields or incomplete day structure
  // New format: { weekIndex, weekFocus, objectives, averageSessionDuration, isDeload, days: [...], weeklyNotes }

  // Check for required top-level fields
  if (!pattern.weekFocus || !pattern.objectives || !pattern.averageSessionDuration) {
    return true;
  }

  if (pattern.isDeload === undefined) {
    return true;
  }

  if (!pattern.days || !Array.isArray(pattern.days) || pattern.days.length === 0) {
    return true;
  }

  // Check if days have complete structure
  const firstDay = pattern.days[0];
  if (!firstDay) return true;

  // New format requires: day, theme, load, primaryMuscleGroups, sessionFocus, intensity, volumeTarget, conditioning, sessionDuration, notes
  const hasCompleteDay = firstDay.day &&
                         firstDay.theme &&
                         firstDay.primaryMuscleGroups !== undefined &&
                         firstDay.sessionFocus !== undefined &&
                         firstDay.intensity !== undefined &&
                         firstDay.volumeTarget !== undefined &&
                         firstDay.conditioning !== undefined &&
                         firstDay.sessionDuration !== undefined;

  return !hasCompleteDay;
}

function isOldWorkoutFormat(details: any): boolean {
  // Old format variations:
  // 1. { sessionType, details: [{ label, activities }], targets }
  // 2. { theme, blocks: [{ name, items }] } - missing work structure and metadata

  // Check for completely old format with sessionType
  if (details.sessionType && !details.theme) {
    return true;
  }

  // Check for incomplete new format (has theme and blocks, but missing required structure)
  if (details.blocks && Array.isArray(details.blocks) && details.blocks.length > 0) {
    const firstBlock = details.blocks[0];

    // Old/incomplete format uses "items", new format uses "work"
    if (firstBlock.items && !firstBlock.work) {
      return true;
    }
  }

  // Check for missing required new format fields
  if (!details.sessionContext || !details.targetMetrics || !details.summary) {
    return true;
  }

  // If blocks exist, verify they have the work structure
  if (details.blocks && Array.isArray(details.blocks) && details.blocks.length > 0) {
    const firstBlock = details.blocks[0];
    if (!firstBlock.work || !Array.isArray(firstBlock.work)) {
      return true;
    }
  }

  return false;
}

// ============================================================================
// Transformation Prompts
// ============================================================================

const MESOCYCLE_TRANSFORMATION_PROMPT = `You are transforming a mesocycle from an old schema format to a new structured format.

The old format may have simple fields like: { name, weeks, focus, deload }

You must transform it to the new _MesocycleSchema format with:
- name: string (keep original)
- objective: string (infer from context, e.g., "Build volume base", "Increase strength intensity")
- focus: array of strings (key focus areas, e.g., ["hypertrophy", "volume tolerance"])
- durationWeeks: number (calculate from the old "weeks" field or infer)
- startWeek: number (infer logical start week, typically sequential)
- endWeek: number (startWeek + durationWeeks - 1)
- volumeTrend: "increasing" | "stable" | "decreasing" (infer from context)
- intensityTrend: "increasing" | "stable" | "taper" (infer from context)
- conditioningFocus: string | null (any conditioning notes)
- weeklyVolumeTargets: record of muscle group → hard sets per week (e.g., { chest: 14, back: 16 })
- avgRIRRange: [min, max] RIR range (e.g., [1, 2])
- keyThemes: array of strings (important themes, e.g., ["deload at week 6", "RIR progression"])
- longFormDescription: string (comprehensive explanation of the mesocycle's purpose, trends, adaptations)
- microcycles: array of strings (one long-form description per week in this mesocycle)

IMPORTANT: Be intelligent about inferring missing data. Use fitness training knowledge to fill in reasonable defaults.
If old format has a "deload" field, incorporate that into keyThemes and adjust volumeTrend accordingly.`;

const MICROCYCLE_TRANSFORMATION_PROMPT = `You are transforming a microcycle pattern from an old schema to a new structured format.

Transform it to the new _StructuredMicrocycleSchema format with:
- weekIndex: number (week number within mesocycle, 0-based)
- weekFocus: string (theme/focus of the week)
- objectives: string (overall goals for this week)
- averageSessionDuration: string (e.g., "60 min")
- isDeload: boolean (whether this is a deload week)
- days: array of structured day objects with:
  - day: "MONDAY" | "TUESDAY" | ... | "SUNDAY"
  - theme: string (training theme, e.g., "Upper Strength", "Lower Hypertrophy")
  - load: "light" | "moderate" | "heavy" | null
  - primaryMuscleGroups: array of strings
  - secondaryMuscleGroups: array of strings
  - sessionFocus: string
  - intensity: { percent1RM?: string, rir?: string }
  - volumeTarget: { setsPerMuscle?: string, totalSetsEstimate?: number }
  - conditioning: string
  - sessionDuration: string
  - notes: string
- weeklyNotes: string (summary notes for the week)

Infer and structure all fields intelligently from the old format.`;

const WORKOUT_TRANSFORMATION_PROMPT = `You are transforming a workout instance from an old schema to a new enhanced format.

Old format: { sessionType, details: [{ label, activities: [...] }], targets: [...] }

Transform to new _EnhancedWorkoutInstanceSchema format with:
- theme: string (overall workout theme, infer from sessionType and content)
- sessionContext: { phaseName, weekNumber, dayIndex, goal, durationEstimateMin, environment, clientConstraints }
- blocks: array of workout blocks with:
  - name: string (e.g., "Warm-Up", "Main Lift", "Accessory")
  - goal: string (purpose of block)
  - durationMin: number
  - notes: string
  - work: array of work items (straight/superset/circuit) with:
    - structureType: "straight" | "superset" | "circuit"
    - exercises: array of exercise items with detailed fields (type, exercise, sets, reps, RPE, rir, equipment, etc.)
    - restBetweenExercisesSec, restAfterSetSec, rounds, notes
- modifications: array (can be empty)
- targetMetrics: { totalVolume, totalReps, totalSets, totalDuration, averageRPE, averageIntensity }
- summary: { adaptations, coachingNotes, progressionNotes, recoveryFocus }
- notes: string

Convert the old "details" blocks and "activities" into the new structured block format with proper exercise specifications.
Infer reasonable values for missing fields (RPE, RIR, tempo, equipment, etc.) based on exercise type and context.`;

// ============================================================================
// Transformation Functions
// ============================================================================

async function transformMesocycle(oldMesocycle: any, index: number): Promise<any> {
  console.log(`    Transforming mesocycle ${index + 1}...`);

  const model = initializeModel(_MesocycleSchema);

  const result = await model.invoke([
    { role: 'system', content: MESOCYCLE_TRANSFORMATION_PROMPT },
    { role: 'user', content: `Transform this mesocycle:\n\n${JSON.stringify(oldMesocycle, null, 2)}` }
  ]);

  return result;
}

async function transformMicrocycle(oldPattern: any, index: number, total: number): Promise<any> {
  console.log(`    [${index}/${total}] Transforming microcycle pattern...`);

  const model = initializeModel(_StructuredMicrocycleSchema);

  const result = await model.invoke([
    { role: 'system', content: MICROCYCLE_TRANSFORMATION_PROMPT },
    { role: 'user', content: `Transform this microcycle pattern:\n\n${JSON.stringify(oldPattern, null, 2)}` }
  ]);

  return result;
}

async function transformWorkout(oldDetails: any, index: number, total: number): Promise<any> {
  console.log(`    [${index}/${total}] Transforming workout instance...`);

  const model = initializeModel(_EnhancedWorkoutInstanceSchema);

  const result = await model.invoke([
    { role: 'system', content: WORKOUT_TRANSFORMATION_PROMPT },
    { role: 'user', content: `Transform this workout:\n\n${JSON.stringify(oldDetails, null, 2)}` }
  ]);

  return result;
}

// ============================================================================
// Migration Functions
// ============================================================================

async function migrateFitnessPlans() {
  console.log('\nMigrating Fitness Plans...');

  const plans = await db
    .selectFrom('fitnessPlans')
    .selectAll()
    .execute();

  let transformedCount = 0;
  let skippedCount = 0;

  for (const plan of plans) {
    const planId = plan.id.substring(0, 8);

    // Check if mesocycles need migration
    const mesocycles = plan.mesocycles as any;

    if (!mesocycles || !Array.isArray(mesocycles)) {
      console.log(`  Plan ${planId}: [NO MESOCYCLES] → Skipped`);
      skippedCount++;
      continue;
    }

    // Check if any mesocycle is in old format
    const needsMigration = isForce || mesocycles.some((m: any) => isOldMesocycleFormat(m));

    if (!needsMigration) {
      console.log(`  Plan ${planId}: [NEW FORMAT] → Skipped`);
      skippedCount++;
      continue;
    }

    console.log(`  Plan ${planId}: [OLD FORMAT] → Transforming...`);

    // Transform each mesocycle
    const transformedMesocycles = [];
    for (let i = 0; i < mesocycles.length; i++) {
      const mesocycle = mesocycles[i];
      if (isOldMesocycleFormat(mesocycle) || isForce) {
        const transformed = await transformMesocycle(mesocycle, i);
        transformedMesocycles.push(transformed);
      } else {
        // Already in new format, keep as-is
        transformedMesocycles.push(mesocycle);
      }
    }

    // Update database
    if (!isDryRun) {
      await db
        .updateTable('fitnessPlans')
        .set({ mesocycles: JSON.stringify(transformedMesocycles) as any })
        .where('id', '=', plan.id)
        .execute();
    }

    console.log(`  Plan ${planId}: ✓`);
    transformedCount++;
  }

  return { transformedCount, skippedCount };
}

async function migrateMicrocycles() {
  console.log('\nMigrating Microcycles...');

  const microcycles = await db
    .selectFrom('microcycles')
    .selectAll()
    .execute();

  const total = microcycles.length;
  console.log(`Found ${total} microcycle(s) to check\n`);

  let transformedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < microcycles.length; i++) {
    const microcycle = microcycles[i];
    const microcycleId = microcycle.id.substring(0, 8);
    const pattern = microcycle.pattern as any;

    const needsMigration = isForce || isOldMicrocycleFormat(pattern);

    if (!needsMigration) {
      console.log(`  [${i + 1}/${total}] Microcycle ${microcycleId}: [NEW FORMAT] → Skipped`);
      skippedCount++;
      continue;
    }

    console.log(`  [${i + 1}/${total}] Microcycle ${microcycleId}: [OLD FORMAT] → Transforming...`);

    const transformedPattern = await transformMicrocycle(pattern, i + 1, total);

    if (!isDryRun) {
      await db
        .updateTable('microcycles')
        .set({ pattern: JSON.stringify(transformedPattern) as any })
        .where('id', '=', microcycle.id)
        .execute();
    }

    console.log(`  [${i + 1}/${total}] Microcycle ${microcycleId}: ✓`);
    transformedCount++;
  }

  return { transformedCount, skippedCount };
}

async function migrateWorkoutInstances() {
  console.log('\nMigrating Workout Instances...');

  const workouts = await db
    .selectFrom('workoutInstances')
    .selectAll()
    .execute();

  const total = workouts.length;
  console.log(`Found ${total} workout(s) to check\n`);

  let transformedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < workouts.length; i++) {
    const workout = workouts[i];
    const workoutId = workout.id.substring(0, 8);
    const details = workout.details as any;

    const needsMigration = isForce || isOldWorkoutFormat(details);

    if (!needsMigration) {
      console.log(`  [${i + 1}/${total}] Workout ${workoutId}: [NEW FORMAT] → Skipped`);
      skippedCount++;
      continue;
    }

    console.log(`  [${i + 1}/${total}] Workout ${workoutId}: [OLD FORMAT] → Transforming...`);

    const transformedDetails = await transformWorkout(details, i + 1, total);

    if (!isDryRun) {
      await db
        .updateTable('workoutInstances')
        .set({ details: JSON.stringify(transformedDetails) as any })
        .where('id', '=', workout.id)
        .execute();
    }

    console.log(`  [${i + 1}/${total}] Workout ${workoutId}: ✓`);
    transformedCount++;
  }

  return { transformedCount, skippedCount };
}

// ============================================================================
// Backup Functionality
// ============================================================================

async function createBackup() {
  if (isDryRun) {
    console.log('Skipping backup (dry-run mode)');
    return null;
  }

  console.log('Creating backup...');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
  const filename = `backup-${timestamp}.json`;

  const plans = await db.selectFrom('fitnessPlans').selectAll().execute();
  const microcycles = await db.selectFrom('microcycles').selectAll().execute();
  const workouts = await db.selectFrom('workoutInstances').selectAll().execute();

  const backup = {
    timestamp: new Date().toISOString(),
    fitness_plans: plans,
    microcycles: microcycles,
    workout_instances: workouts
  };

  writeFileSync(filename, JSON.stringify(backup, null, 2));
  console.log(`Backup created: ${filename} ✓\n`);

  return filename;
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  console.log('='.repeat(60));
  console.log('Data Migration: Legacy to New Schema Format');
  console.log('='.repeat(60));

  if (isDryRun) {
    console.log('⚠️  DRY-RUN MODE: No changes will be made to the database\n');
  }

  if (isForce) {
    console.log('⚠️  FORCE MODE: All records will be re-transformed\n');
  }

  // Create backup before migration
  const backupFile = await createBackup();

  try {
    // Run migrations
    const plansResult = await migrateFitnessPlans();
    const microcyclesResult = await migrateMicrocycles();
    const workoutsResult = await migrateWorkoutInstances();

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('Migration Complete!');
    console.log('='.repeat(60));
    console.log(`Fitness Plans: ${plansResult.transformedCount} transformed, ${plansResult.skippedCount} skipped`);
    console.log(`Microcycles: ${microcyclesResult.transformedCount} transformed, ${microcyclesResult.skippedCount} skipped`);
    console.log(`Workouts: ${workoutsResult.transformedCount} transformed, ${workoutsResult.skippedCount} skipped`);

    if (backupFile) {
      console.log(`Backup: ${backupFile}`);
    }

    if (isDryRun) {
      console.log('\n⚠️  Dry-run completed. No changes were made to the database.');
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    await db.destroy();
  }
}

// Run migration
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
