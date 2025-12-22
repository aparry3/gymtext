import { Kysely, sql } from 'kysely';

/**
 * Migration: Rename prompt IDs to colon-separated format
 *
 * Changes format from dash/underscore to colon-separated hierarchical format
 * for better readability and consistency.
 */

const ID_MAPPING: Array<[string, string]> = [
  // Chat
  ['chat', 'chat:generate'],

  // Profile
  ['profile', 'profile:fitness'],
  ['profile-structured', 'profile:structured'],
  ['user-fields', 'profile:user'],

  // Fitness Plans
  ['fitness-plan', 'plan:generate'],
  ['fitness-plan-structured', 'plan:structured'],
  ['fitness-plan-message', 'plan:message'],
  ['modify-fitness-plan', 'plan:modify'],

  // Workouts
  ['workout', 'workout:generate'],
  ['workout-structured', 'workout:structured'],
  ['workout-message', 'workout:message'],
  ['modify-workout', 'workout:modify'],

  // Microcycles
  ['microcycle', 'microcycle:generate'],
  ['microcycle-structured', 'microcycle:structured'],
  ['microcycle-message', 'microcycle:message'],
  ['modify-microcycle', 'microcycle:modify'],

  // Modifications
  ['modifications', 'modifications:router'],

  // Day format context prompts
  ['workout-message-format-training', 'workout:message:format:training'],
  ['workout-message-format-active_recovery', 'workout:message:format:active_recovery'],
  ['workout-message-format-rest', 'workout:message:format:rest'],
];

export async function up(db: Kysely<unknown>): Promise<void> {
  console.log('Renaming prompt IDs to colon-separated format...');

  for (const [oldId, newId] of ID_MAPPING) {
    await sql`UPDATE prompts SET id = ${newId} WHERE id = ${oldId}`.execute(db);
  }

  console.log(`Renamed ${ID_MAPPING.length} prompt IDs`);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  console.log('Reverting prompt IDs to original format...');

  for (const [oldId, newId] of ID_MAPPING) {
    await sql`UPDATE prompts SET id = ${oldId} WHERE id = ${newId}`.execute(db);
  }

  console.log(`Reverted ${ID_MAPPING.length} prompt IDs`);
}
