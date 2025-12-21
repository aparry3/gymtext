import { Kysely, sql } from 'kysely';

// Import all system prompts from the prompts directory
import { CHAT_SYSTEM_PROMPT } from '../src/server/services/agents/prompts/chat';
import {
  MODIFICATIONS_SYSTEM_PROMPT,
} from '../src/server/services/agents/prompts/modifications';
import {
  PROFILE_UPDATE_SYSTEM_PROMPT,
  USER_FIELDS_SYSTEM_PROMPT,
  STRUCTURED_PROFILE_SYSTEM_PROMPT,
} from '../src/server/services/agents/prompts/profile';
import {
  FITNESS_PLAN_SYSTEM_PROMPT,
  FITNESS_PLAN_MODIFY_SYSTEM_PROMPT,
  PLAN_SUMMARY_MESSAGE_SYSTEM_PROMPT,
  STRUCTURED_PLAN_SYSTEM_PROMPT,
} from '../src/server/services/agents/prompts/plans';
import {
  DAILY_WORKOUT_SYSTEM_PROMPT,
  MODIFY_WORKOUT_SYSTEM_PROMPT,
  WORKOUT_SMS_FORMATTER_SYSTEM_PROMPT,
  STRUCTURED_WORKOUT_SYSTEM_PROMPT,
} from '../src/server/services/agents/prompts/workouts';
import {
  MICROCYCLE_SYSTEM_PROMPT,
  MICROCYCLE_MODIFY_SYSTEM_PROMPT,
  MICROCYCLE_MESSAGE_SYSTEM_PROMPT,
  STRUCTURED_MICROCYCLE_SYSTEM_PROMPT,
} from '../src/server/services/agents/prompts/microcycles';

/**
 * Static user prompts extracted from builder functions
 *
 * These are the "task" portions of user prompts that remain static.
 * Dynamic context (date, profile, etc.) is now passed via ContextService.
 */
const PROFILE_UPDATE_USER_PROMPT = `## YOUR TASK

1. Review the current profile from CONTEXT.
2. **FIRST: Determine if this message contains PERMANENT profile information.**
   - If it's only a transient request (like "switch today to X", "can I do Y instead"), return wasUpdated: false.
   - Look for keywords: "today", "this time", "can we", "let's" = TRANSIENT (don't record)
   - Look for keywords: "I like", "I prefer", "I always", "from now on" = PERMANENT (do record)
3. Check for [ACTIVE] constraints that have expired and remove them.
4. Extract any PERMANENT preferences (scheduling, exercise, workout style).
5. Update EQUIPMENT details if the user mentions gym type, specific equipment, or limitations.
6. Update other sections based on the message. **Carefully distinguish between "Fixed Anchors" (Classes/Sports) and "Current Habits" (General routine).**
7. Return the COMPLETE updated profile (or unchanged if wasUpdated: false).`;

const USER_FIELDS_USER_PROMPT = `## TASK
Analyze the message above. Extract any requested changes to timezone, send time, or name.
Return null for fields not being changed.`;

const STRUCTURED_PROFILE_USER_PROMPT = `## YOUR TASK
Parse this profile into the structured format. Extract all relevant information following the rules above.`;

const MODIFICATIONS_USER_PROMPT = `## TASK
Select the appropriate tool based on the user's request. All parameters (userId, date, targetDay, etc.) are automatically provided from context.`;

const MODIFY_WORKOUT_USER_PROMPT = `## TASK
Using the workout overview, fitness profile, and requested changes above, decide whether the workout needs to be modified.
- Follow the reasoning and modification rules from the system instructions.
- Preserve the original training intent and structure as much as possible.
- Apply substitutions or adjustments only when needed based on the user's request and profile.`;

const STRUCTURED_WORKOUT_USER_PROMPT = `## TASK
Parse this workout into a structured JSON format for storage.`;

const STRUCTURED_PLAN_USER_PROMPT = `## TASK
Parse this fitness plan into a structured JSON format for storage.`;

const STRUCTURED_MICROCYCLE_USER_PROMPT = `## TASK
Parse this microcycle into a structured JSON format for storage.`;

// All prompts to seed
const PROMPTS: Array<{ id: string; role: string; value: string }> = [
  // Chat agent (system only - uses tools, no user prompt)
  { id: 'chat', role: 'system', value: CHAT_SYSTEM_PROMPT },

  // Modifications agent
  { id: 'modifications', role: 'system', value: MODIFICATIONS_SYSTEM_PROMPT },
  { id: 'modifications', role: 'user', value: MODIFICATIONS_USER_PROMPT },

  // Profile agents
  { id: 'profile-update', role: 'system', value: PROFILE_UPDATE_SYSTEM_PROMPT },
  { id: 'profile-update', role: 'user', value: PROFILE_UPDATE_USER_PROMPT },
  { id: 'user-fields', role: 'system', value: USER_FIELDS_SYSTEM_PROMPT },
  { id: 'user-fields', role: 'user', value: USER_FIELDS_USER_PROMPT },
  { id: 'structured-profile', role: 'system', value: STRUCTURED_PROFILE_SYSTEM_PROMPT },
  { id: 'structured-profile', role: 'user', value: STRUCTURED_PROFILE_USER_PROMPT },

  // Fitness plan agents
  { id: 'fitness-plan', role: 'system', value: FITNESS_PLAN_SYSTEM_PROMPT },
  { id: 'fitness-plan-modify', role: 'system', value: FITNESS_PLAN_MODIFY_SYSTEM_PROMPT },
  { id: 'plan-summary-message', role: 'system', value: PLAN_SUMMARY_MESSAGE_SYSTEM_PROMPT },
  { id: 'structured-plan', role: 'system', value: STRUCTURED_PLAN_SYSTEM_PROMPT },
  { id: 'structured-plan', role: 'user', value: STRUCTURED_PLAN_USER_PROMPT },

  // Workout agents
  { id: 'workout-generate', role: 'system', value: DAILY_WORKOUT_SYSTEM_PROMPT },
  { id: 'workout-modify', role: 'system', value: MODIFY_WORKOUT_SYSTEM_PROMPT },
  { id: 'workout-modify', role: 'user', value: MODIFY_WORKOUT_USER_PROMPT },
  { id: 'workout-message', role: 'system', value: WORKOUT_SMS_FORMATTER_SYSTEM_PROMPT },
  { id: 'structured-workout', role: 'system', value: STRUCTURED_WORKOUT_SYSTEM_PROMPT },
  { id: 'structured-workout', role: 'user', value: STRUCTURED_WORKOUT_USER_PROMPT },

  // Microcycle agents
  { id: 'microcycle', role: 'system', value: MICROCYCLE_SYSTEM_PROMPT },
  { id: 'microcycle-modify', role: 'system', value: MICROCYCLE_MODIFY_SYSTEM_PROMPT },
  { id: 'microcycle-message', role: 'system', value: MICROCYCLE_MESSAGE_SYSTEM_PROMPT },
  { id: 'structured-microcycle', role: 'system', value: STRUCTURED_MICROCYCLE_SYSTEM_PROMPT },
  { id: 'structured-microcycle', role: 'user', value: STRUCTURED_MICROCYCLE_USER_PROMPT },
];

export async function up(db: Kysely<unknown>): Promise<void> {
  console.log(`Seeding ${PROMPTS.length} prompts...`);

  // Insert all prompts using raw SQL since Kysely<unknown> doesn't know the schema
  for (const prompt of PROMPTS) {
    await sql`INSERT INTO prompts (id, role, value) VALUES (${prompt.id}, ${prompt.role}, ${prompt.value})`.execute(db);
  }

  console.log('Prompts seeded successfully');
}

export async function down(db: Kysely<unknown>): Promise<void> {
  // Get all unique IDs we seeded
  const seedIds = [...new Set(PROMPTS.map(p => p.id))];

  // Delete all prompts for these IDs using raw SQL
  for (const id of seedIds) {
    await sql`DELETE FROM prompts WHERE id = ${id}`.execute(db);
  }

  console.log(`Removed prompts for ${seedIds.length} agents`);
}
