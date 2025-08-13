import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Step 1: Add new columns to fitness_plans
  await db.schema
    .alterTable('fitness_plans')
    .addColumn('mesocycles', 'json')
    .addColumn('length_weeks', 'integer')
    .addColumn('notes', 'text')
    .addColumn('current_mesocycle_index', 'integer', (col) => col.defaultTo(0))
    .addColumn('current_microcycle_week', 'integer', (col) => col.defaultTo(1))
    .addColumn('cycle_start_date', 'timestamp')
    .execute();

  // Step 2: Convert existing fitness plans
  const existingPlans = await db
    .selectFrom('fitness_plans')
    .selectAll()
    .execute();

  for (const plan of existingPlans) {
    const macrocycles = typeof plan.macrocycles === 'string' 
      ? JSON.parse(plan.macrocycles) 
      : plan.macrocycles;
    
    const firstMacrocycle = macrocycles[0] || { mesocycles: [], durationWeeks: 12 };
    
    // Extract and simplify mesocycles
    const simplifiedMesocycles = firstMacrocycle.mesocycles.map((meso: any) => ({
      name: meso.phase || 'Training Phase',
      weeks: meso.weeks || 4,
      focus: extractFocusAreas(meso),
      deload: meso.microcycleOverviews?.some((m: any) => m.deload) || false
    }));

    await db
      .updateTable('fitness_plans')
      .set({
        mesocycles: JSON.stringify(simplifiedMesocycles),
        length_weeks: firstMacrocycle.durationWeeks,
        notes: null,
        cycle_start_date: new Date()
      })
      .where('id', '=', plan.id)
      .execute();
  }

  // Step 3: DROP all existing training data and tables (clean slate)
  console.log('Deleting all workout instances...');
  await db.deleteFrom('workout_instances').execute();
  
  console.log('Dropping microcycles table...');
  await db.schema.dropTable('microcycles').cascade().execute();
  
  console.log('Dropping mesocycles table...');
  await db.schema.dropTable('mesocycles').cascade().execute();
  
  console.log('Clean slate migration complete - training tables dropped');

  // Step 4: Drop old column
  await db.schema
    .alterTable('fitness_plans')
    .dropColumn('macrocycles')
    .execute();
}

// Helper function for data conversion
function extractFocusAreas(mesocycle: any): string[] {
  const focus = [];
  const phase = mesocycle.phase?.toLowerCase() || '';
  
  if (phase.includes('accumulation') || phase.includes('base')) {
    focus.push('volume', 'technique');
  }
  if (phase.includes('intensification') || phase.includes('strength')) {
    focus.push('intensity');
  }
  if (phase.includes('peaking') || phase.includes('peak')) {
    focus.push('performance');
  }
  if (phase.includes('endurance')) {
    focus.push('endurance', 'aerobic');
  }
  if (phase.includes('power')) {
    focus.push('power', 'explosiveness');
  }
  if (phase.includes('recovery') || phase.includes('deload')) {
    focus.push('recovery');
  }
  
  if (focus.length === 0) {
    focus.push('general');
  }
  
  return focus;
}

export async function down(db: Kysely<any>): Promise<void> {
  // This is a one-way migration - no going back
  // All training data has been deleted and cannot be restored
  throw new Error('This migration cannot be reversed. Restore from backup if needed.');
}