import { Kysely } from 'kysely';

/**
 * Migration to clean all existing fitness data
 * This prepares the database for regenerating fitness plans with the new schema
 */
export async function up(db: Kysely<any>): Promise<void> {
  console.log('Cleaning fitness data...');

  // Delete all workout instances
  const workouts = await db
    .deleteFrom('workout_instances')
    .executeTakeFirst();
  console.log(`Deleted ${workouts.numDeletedRows} workout instances`);

  // Delete all microcycles
  const microcycles = await db
    .deleteFrom('microcycles')
    .executeTakeFirst();
  console.log(`Deleted ${microcycles.numDeletedRows} microcycles`);

  // Delete all mesocycles (new table from migrations)
  const mesocycles = await db
    .deleteFrom('mesocycles')
    .executeTakeFirst();
  console.log(`Deleted ${mesocycles.numDeletedRows} mesocycles`);

  // Delete all fitness plans
  const plans = await db
    .deleteFrom('fitness_plans')
    .executeTakeFirst();
  console.log(`Deleted ${plans.numDeletedRows} fitness plans`);

  console.log('Fitness data cleanup complete');
}

export async function down(db: Kysely<any>): Promise<void> {
  // This migration cannot be reversed as we're deleting data
  console.log('Cannot reverse fitness data cleanup - data has been deleted');
}
