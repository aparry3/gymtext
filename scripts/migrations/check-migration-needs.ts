import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { DB } from '@/server/models';

/**
 * Quick check script to see what needs migration without running LLM calls
 */

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({ connectionString: databaseUrl, max: 10 });
const db = new Kysely<DB>({ dialect: new PostgresDialect({ pool }) });

function isOldMesocycleFormat(mesocycle: any): boolean {
  return !mesocycle.objective && !mesocycle.durationWeeks && !mesocycle.startWeek;
}

function isOldMicrocycleFormat(pattern: any): boolean {
  if (!pattern.weekFocus || !pattern.objectives || !pattern.averageSessionDuration) {
    return true;
  }
  if (pattern.isDeload === undefined) {
    return true;
  }
  if (!pattern.days || !Array.isArray(pattern.days) || pattern.days.length === 0) {
    return true;
  }
  const firstDay = pattern.days[0];
  if (!firstDay) return true;
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
  if (details.sessionType && !details.theme) {
    return true;
  }
  if (details.blocks && Array.isArray(details.blocks) && details.blocks.length > 0) {
    const firstBlock = details.blocks[0];
    if (firstBlock.items && !firstBlock.work) {
      return true;
    }
  }
  if (!details.sessionContext || !details.targetMetrics || !details.summary) {
    return true;
  }
  if (details.blocks && Array.isArray(details.blocks) && details.blocks.length > 0) {
    const firstBlock = details.blocks[0];
    if (!firstBlock.work || !Array.isArray(firstBlock.work)) {
      return true;
    }
  }
  return false;
}

async function main() {
  console.log('Checking migration needs...\n');

  // Check fitness plans
  const plans = await db.selectFrom('fitnessPlans').selectAll().execute();
  let plansMigrationNeeded = 0;
  for (const plan of plans) {
    const mesocycles = plan.mesocycles as any;
    if (mesocycles && Array.isArray(mesocycles)) {
      const needsMigration = mesocycles.some((m: any) => isOldMesocycleFormat(m));
      if (needsMigration) plansMigrationNeeded++;
    }
  }

  // Check microcycles
  const microcycles = await db.selectFrom('microcycles').selectAll().execute();
  let microcyclesMigrationNeeded = 0;
  for (const mc of microcycles) {
    if (isOldMicrocycleFormat(mc.pattern as any)) {
      microcyclesMigrationNeeded++;
    }
  }

  // Check workouts
  const workouts = await db.selectFrom('workoutInstances').selectAll().execute();
  let workoutsMigrationNeeded = 0;
  for (const wo of workouts) {
    if (isOldWorkoutFormat(wo.details as any)) {
      workoutsMigrationNeeded++;
    }
  }

  console.log('='.repeat(60));
  console.log('Migration Needs Summary');
  console.log('='.repeat(60));
  console.log(`Fitness Plans: ${plansMigrationNeeded}/${plans.length} need migration`);
  console.log(`Microcycles: ${microcyclesMigrationNeeded}/${microcycles.length} need migration`);
  console.log(`Workouts: ${workoutsMigrationNeeded}/${workouts.length} need migration`);
  console.log('='.repeat(60));

  await db.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
