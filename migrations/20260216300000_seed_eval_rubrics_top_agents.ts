import { Kysely, sql } from 'kysely';

/**
 * Seed eval rubrics for the top 5 agents
 *
 * Adds eval_prompt to: chat:generate, workout:generate, workout:message,
 * microcycle:generate, plan:generate
 *
 * Each eval receives JSON: { agentId, input, response }
 * Must return a score as "Score: X/10" for automatic extraction.
 */

const RUBRICS: Array<{ agentId: string; evalPrompt: string; evalModel: string }> = [
  {
    agentId: 'chat:generate',
    evalModel: 'gpt-4.1-nano',
    evalPrompt: `You are an eval judge for a fitness coaching chatbot. Rate the response on a 1-10 scale.

## Criteria (equal weight)
1. **Relevance** — Does the response directly address the user's message?
2. **Accuracy** — Is the fitness/nutrition advice correct and safe?
3. **Tone** — Is it encouraging, personal, and coach-like (not robotic)?
4. **Conciseness** — Is it appropriately concise for SMS? No walls of text.
5. **Actionability** — Does it give the user something concrete to do or understand?

## Scoring
- 9-10: Excellent — natural, accurate, perfectly tailored
- 7-8: Good — solid response with minor issues
- 5-6: Adequate — gets the job done but feels generic or slightly off
- 3-4: Poor — misses the point, wrong tone, or bad advice
- 1-2: Failing — harmful advice, completely irrelevant, or broken

## Output Format
Briefly explain strengths and weaknesses (2-3 sentences), then:
Score: X/10`,
  },
  {
    agentId: 'workout:generate',
    evalModel: 'gpt-4.1-nano',
    evalPrompt: `You are an eval judge for a workout generation agent. The agent produces a full workout description given a user profile and day context. Rate 1-10.

## Criteria
1. **Structure** (2pts) — Clear warm-up, main work, cooldown. Logical exercise ordering.
2. **Specificity** (2pts) — Includes sets, reps, rest periods, intensity cues. Not vague.
3. **Appropriateness** (2pts) — Matches the day's goal (training/recovery/etc), user's level, and available equipment.
4. **Volume** (2pts) — Reasonable total volume for the session type. Not too much or too little.
5. **Safety** (2pts) — No dangerous progressions, proper movement selection for experience level.

## Deductions
- -2 for exercises that don't match stated equipment/constraints
- -2 for ignoring the day's activity type (e.g., heavy lifting on a recovery day)
- -1 for missing warm-up or cooldown
- -1 for no rest period guidance

## Output Format
Brief analysis (2-3 sentences), then:
Score: X/10`,
  },
  {
    agentId: 'workout:message',
    evalModel: 'gpt-4.1-nano',
    evalPrompt: `You are an eval judge for a workout message formatting agent. It converts a workout description into an SMS-friendly message. Rate 1-10.

## Criteria
1. **Readability** (2pts) — Clean formatting, scannable structure, good use of line breaks and symbols.
2. **Completeness** (2pts) — All key exercises, sets, reps are included. Nothing important dropped.
3. **Length** (2pts) — Appropriate for SMS (~300-800 chars). Not too short to be useless, not too long to be overwhelming.
4. **Tone** (2pts) — Motivating, personal, coach-like. Not sterile or robotic.
5. **Accuracy** (2pts) — Message faithfully represents the input workout description.

## Deductions
- -2 for messages over 1200 characters (too long for SMS)
- -2 for dropping major exercises from the workout
- -1 for generic filler ("Let's crush it!" without substance)
- -1 for confusing formatting

## Output Format
Brief analysis (2-3 sentences), then:
Score: X/10`,
  },
  {
    agentId: 'microcycle:generate',
    evalModel: 'gpt-4.1-nano',
    evalPrompt: `You are an eval judge for a microcycle (weekly training plan) generation agent. It produces a 7-day training schedule. Rate 1-10.

## Criteria
1. **Balance** (2pts) — Appropriate mix of training, rest, and recovery days. Muscle groups distributed well.
2. **Progression** (2pts) — Fits within the larger plan context (week number, phase). Intensity matches the training block.
3. **Specificity** (2pts) — Each day has a clear, distinct purpose. Day descriptions are meaningful, not generic.
4. **Recovery** (2pts) — Adequate rest between intense sessions. Hard sessions not back-to-back.
5. **Personalization** (2pts) — Reflects user's experience level, goals, and schedule constraints.

## Deductions
- -2 for same muscle groups on consecutive days without recovery
- -2 for ignoring the user's stated availability/schedule
- -1 for vague day descriptions ("Upper body" without more detail)
- -1 for 7 training days with no rest

## Output Format
Brief analysis (2-3 sentences), then:
Score: X/10`,
  },
  {
    agentId: 'plan:generate',
    evalModel: 'gpt-4.1-nano',
    evalPrompt: `You are an eval judge for a fitness plan generation agent. It creates a multi-week training plan overview. Rate 1-10.

## Criteria
1. **Goal Alignment** (2pts) — Plan directly targets the user's stated goals (strength, weight loss, etc).
2. **Periodization** (2pts) — Clear phases with progressive overload. Deload weeks where appropriate.
3. **Realism** (2pts) — Achievable given the user's experience level, schedule, and constraints.
4. **Completeness** (2pts) — Covers all necessary aspects: frequency, intensity progression, key focuses per phase.
5. **Clarity** (2pts) — Well-organized, easy to understand overview. User knows what to expect.

## Deductions
- -2 for plans that ignore stated injuries or limitations
- -2 for no periodization (flat intensity for 12+ weeks)
- -1 for plans that don't scale to the user's experience level
- -1 for missing timeline or phase structure

## Output Format
Brief analysis (2-3 sentences), then:
Score: X/10`,
  },
];

export async function up(db: Kysely<unknown>): Promise<void> {
  console.log('Seeding eval rubrics for top 5 agents...');

  for (const { agentId, evalPrompt, evalModel } of RUBRICS) {
    await sql`
      INSERT INTO agent_definitions (
        agent_id, system_prompt, user_prompt, model,
        temperature, max_tokens, max_iterations, max_retries,
        description, is_active,
        tool_ids, context_types, schema_json, validation_rules,
        user_prompt_template, examples, sub_agents,
        eval_prompt, eval_model, default_extensions
      )
      SELECT
        agent_id, system_prompt, user_prompt, model,
        temperature, max_tokens, max_iterations, max_retries,
        description, is_active,
        tool_ids, context_types, schema_json, validation_rules,
        user_prompt_template, examples, sub_agents,
        ${evalPrompt}, ${evalModel}, default_extensions
      FROM agent_definitions
      WHERE agent_id = ${agentId}
      ORDER BY created_at DESC
      LIMIT 1
    `.execute(db);
    console.log(`  Seeded eval rubric for ${agentId}`);
  }

  console.log('Migration complete!');
}

export async function down(db: Kysely<unknown>): Promise<void> {
  console.log('Rolling back eval rubrics...');

  for (const { agentId } of RUBRICS) {
    await sql`
      DELETE FROM agent_definitions
      WHERE version_id = (
        SELECT version_id FROM agent_definitions
        WHERE agent_id = ${agentId}
        ORDER BY created_at DESC
        LIMIT 1
      )
    `.execute(db);
    console.log(`  Removed latest version for ${agentId}`);
  }

  console.log('Rollback complete!');
}
