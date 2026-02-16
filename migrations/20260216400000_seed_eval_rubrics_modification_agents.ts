import { Kysely, sql } from 'kysely';

/**
 * Seed eval rubrics for modification agents
 *
 * Adds eval_prompt to: workout:modify, microcycle:modify
 */

const RUBRICS: Array<{ agentId: string; evalPrompt: string; evalModel: string }> = [
  {
    agentId: 'workout:modify',
    evalModel: 'gpt-4.1-nano',
    evalPrompt: `You are an eval judge for a workout modification agent. It takes a user's change request and produces a modified workout description. Rate 1-10.

## Criteria
1. **Request Fulfillment** (3pts) — Does the modified workout actually address the user's change request? The #1 job is doing what was asked.
2. **Preservation** (2pts) — Are unrelated parts of the workout preserved? Only the requested changes should differ.
3. **Coherence** (2pts) — Does the modified workout still make sense as a complete session? Logical exercise order, appropriate volume.
4. **Safety** (2pts) — No dangerous substitutions. Modifications respect the user's level and constraints.
5. **wasModified Flag** (1pt) — Is the wasModified boolean correct? True when changes were made, false when the request doesn't warrant changes.

## Deductions
- -3 for ignoring the change request entirely
- -2 for rewriting the entire workout when only a small change was requested
- -2 for unsafe exercise substitutions (e.g., replacing machine work with heavy barbell for a beginner)
- -1 for losing the workout's theme or focus unnecessarily

## Output Format
Brief analysis (2-3 sentences), then:
Score: X/10`,
  },
  {
    agentId: 'microcycle:modify',
    evalModel: 'gpt-4.1-nano',
    evalPrompt: `You are an eval judge for a microcycle (weekly schedule) modification agent. It restructures a 7-day training plan based on a user's request. Rate 1-10.

## Criteria
1. **Request Fulfillment** (3pts) — Does the modified schedule address what the user asked for? (e.g., "move legs to Thursday", "add a rest day")
2. **Minimal Disruption** (2pts) — Are unaffected days left unchanged? Don't restructure the whole week for a single-day change.
3. **Balance** (2pts) — Is the modified schedule still well-balanced? No back-to-back heavy sessions on the same muscle groups.
4. **Day Descriptions** (2pts) — Are day descriptions specific and meaningful? Each day should have a clear purpose.
5. **7-Day Completeness** (1pt) — Are all 7 days present with descriptions?

## Deductions
- -3 for not addressing the user's request
- -2 for removing rest days without being asked
- -2 for creating an unsafe schedule (e.g., 7 heavy training days)
- -1 for vague day descriptions after modification
- -1 for changing days that weren't part of the request

## Output Format
Brief analysis (2-3 sentences), then:
Score: X/10`,
  },
];

export async function up(db: Kysely<unknown>): Promise<void> {
  console.log('Seeding eval rubrics for modification agents...');

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
  console.log('Rolling back modification agent eval rubrics...');

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
  }

  console.log('Rollback complete!');
}
