import { Kysely } from 'kysely';
import { DB } from '../src/server/models/_types';

export async function up(db: Kysely<DB>): Promise<void> {
  // Add indexes for commonly queried fields to improve performance
  
  // Index for fitness plans by client and start date
  await db.schema
    .createIndex('fitness_plans_client_start')
    .on('fitness_plans')
    .columns(['client_id', 'start_date'])
    .execute();

  // Index for workout instances by date range queries
  await db.schema
    .createIndex('workout_instances_date')
    .on('workout_instances')
    .column('date')
    .execute();

  // Index for microcycles by fitness plan
  await db.schema
    .createIndex('microcycles_fitness_plan')
    .on('microcycles')
    .column('fitness_plan_id')
    .execute();

  // Index for messages by user and created date (for conversation history)
  await db.schema
    .createIndex('messages_user_created')
    .on('messages')
    .columns(['user_id', 'created_at'])
    .execute();

  // Index for active microcycles (already exists but let's ensure it's there)
  // Skip if already exists
  try {
    await db.schema
      .createIndex('microcycles_user_active')
      .on('microcycles')
      .columns(['user_id', 'is_active'])
      .ifNotExists()
      .execute();
  } catch (e) {
    // Index might already exist, that's ok
  }
}

export async function down(db: Kysely<DB>): Promise<void> {
  // Remove indexes in reverse order
  await db.schema.dropIndex('messages_user_created').ifExists().execute();
  await db.schema.dropIndex('microcycles_fitness_plan').ifExists().execute();
  await db.schema.dropIndex('workout_instances_date').ifExists().execute();
  await db.schema.dropIndex('fitness_plans_client_start').ifExists().execute();
}