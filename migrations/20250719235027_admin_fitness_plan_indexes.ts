import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Index on users.phone_number for quick phone number lookups
  await db.schema
    .createIndex('users_phone_number_idx')
    .on('users')
    .column('phone_number')
    .execute();

  // Index on fitness_plans.client_id for user's fitness plans
  await db.schema
    .createIndex('fitness_plans_client_id_idx')
    .on('fitness_plans')
    .column('client_id')
    .execute();

  // Index on mesocycles.fitness_plan_id for plan's mesocycles
  await db.schema
    .createIndex('mesocycles_fitness_plan_id_idx')
    .on('mesocycles')
    .column('fitness_plan_id')
    .execute();

  // Index on microcycles.mesocycle_id for mesocycle's microcycles
  await db.schema
    .createIndex('microcycles_mesocycle_id_idx')
    .on('microcycles')
    .column('mesocycle_id')
    .execute();

  // Index on workout_instances.microcycle_id for microcycle's workouts
  await db.schema
    .createIndex('workout_instances_microcycle_id_idx')
    .on('workout_instances')
    .column('microcycle_id')
    .execute();

  // Composite index on workout_instances for efficient hierarchical queries
  await db.schema
    .createIndex('workout_instances_plan_meso_micro_idx')
    .on('workout_instances')
    .columns(['fitness_plan_id', 'mesocycle_id', 'microcycle_id'])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex('users_phone_number_idx').execute();
  await db.schema.dropIndex('fitness_plans_client_id_idx').execute();
  await db.schema.dropIndex('mesocycles_fitness_plan_id_idx').execute();
  await db.schema.dropIndex('microcycles_mesocycle_id_idx').execute();
  await db.schema.dropIndex('workout_instances_microcycle_id_idx').execute();
  await db.schema.dropIndex('workout_instances_plan_meso_micro_idx').execute();
}
