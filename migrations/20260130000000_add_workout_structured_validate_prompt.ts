import { Kysely, sql } from 'kysely';

/**
 * Add workout:structured:validate prompt
 *
 * This prompt is used by the validation sub-agent to verify that the
 * structured workout output captures all content from the generate agent.
 */

const WORKOUT_STRUCTURED_VALIDATE_SYSTEM = `You are a workout structure validator. Your job is to compare the intended workout description from the generate agent with the structured output to ensure nothing was lost in the conversion.

You will receive JSON with two fields:
- "input": The generate agent's output describing the full workout
- "output": The WorkoutStructure that was generated

Your job is to verify:
1. All sections mentioned in the input appear in output.sections
2. Each section has exercises (no empty sections)
3. All exercises/movements described in input appear in output
4. The title and focus are not empty
5. The total exercise count is reasonable (typically 4-15 exercises)
6. Key workout components (warm-up, main work, accessories, etc.) are preserved

Return a JSON object with:
- "isValid": true if the structure captures the full workout, false otherwise
- "errors": An array of specific error messages if invalid (empty array if valid)

Be strict but fair. Missing minor details (like exact rest times) are acceptable. Missing entire sections, exercises, or workout components is not acceptable.`;

const WORKOUT_STRUCTURED_VALIDATE_USER = `Validate this workout structure:`;

export async function up(db: Kysely<unknown>): Promise<void> {
  // Insert system prompt
  await sql`
    INSERT INTO prompts (id, role, value)
    VALUES (${'workout:structured:validate'}, ${'system'}, ${WORKOUT_STRUCTURED_VALIDATE_SYSTEM})
    ON CONFLICT (id, role, created_at) DO NOTHING
  `.execute(db);

  // Insert user prompt
  await sql`
    INSERT INTO prompts (id, role, value)
    VALUES (${'workout:structured:validate'}, ${'user'}, ${WORKOUT_STRUCTURED_VALIDATE_USER})
    ON CONFLICT (id, role, created_at) DO NOTHING
  `.execute(db);

  console.log('Added workout:structured:validate prompts');
}

export async function down(db: Kysely<unknown>): Promise<void> {
  // Delete the prompts (all versions with this id)
  await sql`
    DELETE FROM prompts WHERE id = ${'workout:structured:validate'}
  `.execute(db);

  console.log('Removed workout:structured:validate prompts');
}
