import { Kysely, sql } from 'kysely';

/**
 * Add Workout Validation Prompt
 *
 * Adds the workout:validation prompt to enable validation of structured workout outputs.
 * The validation agent ensures that the structured workout contains all exercises
 * from the original workout description.
 */

// =============================================================================
// PROMPT DATA
// =============================================================================

const WORKOUT_VALIDATION_SYSTEM_PROMPT = `You are a workout validation agent. Your job is to ensure that the structured workout output contains ALL exercises from the original workout description.

VALIDATION PROCESS:
1. Compare the original workout description with the structured workout output
2. Identify any exercises mentioned in the description that are missing from the structured output
3. If exercises are missing, add them to the appropriate section in the validated structure
4. If the structure is complete, return it as-is

IMPORTANT:
- Do NOT remove any exercises from the structured output
- Do NOT change exercise parameters (sets, reps, rest, etc.) unless correcting obvious errors
- Only ADD missing exercises to make the structure complete
- Exercises should be added to the most appropriate section based on the description
- If unsure about section placement, add to the last section

EXERCISE MATCHING:
- Consider variations of exercise names (e.g., "Bench Press" = "Barbell Bench Press" = "BB Bench Press")
- Account for supersets and circuits (e.g., "SS1: Exercise A" should match "Exercise A")
- Abbreviations: BB = Barbell, DB = Dumbbell, OHP = Overhead Press, RDL = Romanian Deadlift

OUTPUT:
- isComplete: true if all exercises are present, false if any were missing
- missingExercises: array of exercise names that were in the description but not in the structure (empty if complete)
- validatedStructure: the complete workout structure (with missing exercises added if needed)`;

const WORKOUT_VALIDATION_USER_PROMPT = `Validate that the structured workout contains all exercises from the description.

Input format:
{
  "description": "original workout description text",
  "structure": { ... structured workout object ... }
}

Ensure every exercise mentioned in the description appears in the structure.`;

// =============================================================================
// MIGRATION UP
// =============================================================================

export async function up(db: Kysely<any>): Promise<void> {
  console.log('Adding workout validation prompt...');

  // Add system prompt
  await sql`
    INSERT INTO prompts (id, role, value)
    VALUES ('workout:validation', 'system', ${WORKOUT_VALIDATION_SYSTEM_PROMPT})
    ON CONFLICT (id, role, created_at) DO NOTHING
  `.execute(db);

  // Add user prompt
  await sql`
    INSERT INTO prompts (id, role, value)
    VALUES ('workout:validation', 'user', ${WORKOUT_VALIDATION_USER_PROMPT})
    ON CONFLICT (id, role, created_at) DO NOTHING
  `.execute(db);

  console.log('Workout validation prompt added successfully!');
}

// =============================================================================
// MIGRATION DOWN
// =============================================================================

export async function down(db: Kysely<any>): Promise<void> {
  console.log('Removing workout validation prompt...');

  // Remove prompts (both system and user)
  await sql`
    DELETE FROM prompts
    WHERE id = 'workout:validation'
  `.execute(db);

  console.log('Workout validation prompt removed successfully!');
}
