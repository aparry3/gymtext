import { Kysely, sql } from 'kysely';

/**
 * Migration: Seed day format prompts for dynamic context injection
 *
 * These prompts contain formatting rules for different day types (TRAINING, ACTIVE_RECOVERY, REST)
 * and are fetched dynamically by the ContextService based on the day's activityType.
 */

const TRAINING_FORMAT = `A) TRAINING
- Allowed section headers (0-2, in this order if present):
  Workout:
  Conditioning:
- ALWAYS omit warmup and cooldown.
- Each item is a bullet starting with "- ".
- Use standard exercise formatting.
- Training: "- BB Bench Press: 4x8-10"
- Abbreviations: Barbell -> BB, Dumbbell -> DB, Overhead Press -> OHP, Romanian Deadlift -> RDL, Single-Leg -> SL
- Supersets use "SS1", "SS2".
- Circuits use "C1", "C2".`;

const ACTIVE_RECOVERY_FORMAT = `B) ACTIVE_RECOVERY (CRITICAL - NO HEADERS)
- DO NOT use any section headers ("Workout:", "Optional:", etc.).
- Output EXACTLY 1-2 bullet lines total.
- Bullets must be:
  - Simple
  - Non-prescriptive
  - Constraint-based (time + easy effort)

Required first bullet:
- Easy activity with duration and non-exhaustive examples.

Exact format:
- "- Easy activity: ~30m (walk, bike, jog, row, swim, etc.)"

Optional second bullet (if stretching or mobility is mentioned in source):
- Keep it supportive, not instructional.
- Do NOT list specific stretches.
- Do NOT imply requirement.

Allowed format:
- "- Stretching: 5-10m (let me know if you need stretches)"

Avoid for ACTIVE_RECOVERY:
- Section headers
- Checklists
- Multiple activity bullets
- Listing individual mobility movements
- Language implying obligation

ACTIVE_RECOVERY reads as permissive, not prescriptive.`;

const REST_FORMAT = `C) REST
- No section headers.
- Output at most 1 bullet line.
- Gentle, optional movement only.

Example:
- "- Optional easy walk: 5-15m"`;

const PROMPTS = [
  { id: 'workout:message:format:training', role: 'context', value: TRAINING_FORMAT },
  { id: 'workout:message:format:active_recovery', role: 'context', value: ACTIVE_RECOVERY_FORMAT },
  { id: 'workout:message:format:rest', role: 'context', value: REST_FORMAT },
];

export async function up(db: Kysely<unknown>): Promise<void> {
  console.log('Seeding day format prompts...');

  for (const prompt of PROMPTS) {
    await sql`
      INSERT INTO prompts (id, role, value)
      VALUES (${prompt.id}, ${prompt.role}, ${prompt.value})
    `.execute(db);
  }

  console.log('Day format prompts seeded successfully');
}

export async function down(db: Kysely<unknown>): Promise<void> {
  const ids = PROMPTS.map(p => p.id);

  for (const id of ids) {
    await sql`DELETE FROM prompts WHERE id = ${id}`.execute(db);
  }

  console.log('Day format prompts removed');
}
