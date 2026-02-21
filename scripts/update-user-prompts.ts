#!/usr/bin/env tsx
/**
 * Update User Prompts from Constants
 *
 * This script updates user_prompt_template in agent_definitions table
 * using clean, simple templates.
 *
 * Usage:
 *   pnpm agent:update-user-prompts           # Run for real
 *   pnpm agent:update-user-prompts:dry       # Preview changes
 *
 * Requires DATABASE_URL to be set.
 * Run: source .env.local before using.
 */

import { Kysely, PostgresDialect, sql } from 'kysely';
import { Pool } from 'pg';

// Clean user prompt templates
const USER_PROMPTS: Record<string, string> = {
  'profile:update': `Create or update a fitness profile based on:

{{input}}

Use the standard profile format with IDENTITY, GOALS, TRAINING CONTEXT, METRICS, and LOG sections.
Validate all fields and ensure data consistency.`,

  'plan:generate': `Design a training program based on:

{{input}}

Use the standard program format with Program Philosophy, Phase structure, Progression Strategy, and Phase Cycling.
Consider the user's goals, constraints, and schedule.`,

  'week:generate': `Generate a microcycle (weekly workout plan) based on:

{{input}}

Use the standard microcycle format with Schedule, Week Overview, daily Workouts, and Weekly Summary.
Include warm-up, main workout, and cool down for each session.`,

  'workout:format': `Convert this workout into a daily text message:

{{input}}

Use the standard message format: Session title, warm-up (brief), workout (sets×reps@weight), notes (1-2 sentences).
Keep it concise and coach-like.`,

  'week:modify': `Modify the existing microcycle based on:

{{input}}

Use the standard microcycle format. Show changes with strikethrough for original → new.
Append a LOG section documenting this modification (date, context, changes, rationale).`,
};

const JSONB_COLS = new Set(['sub_agents', 'schema_json', 'validation_rules', 'examples']);

function castValue(col: string, v: unknown) {
  if (v === null || v === undefined) return sql`${null}`;
  if (JSONB_COLS.has(col)) {
    return sql`${JSON.stringify(v)}::jsonb`;
  }
  return sql`${v}`;
}

async function upsertUserPrompt(
  db: Kysely<unknown>,
  agentId: string,
  userPrompt: string,
  dryRun: boolean
) {
  if (dryRun) {
    console.log(`[DRY RUN] Would update user_prompt_template for ${agentId}`);
    console.log(`  New prompt: ${userPrompt.substring(0, 80)}...`);
    return;
  }

  const existing = await sql<Record<string, unknown>>`
    SELECT * FROM agent_definitions
    WHERE agent_id = ${agentId} AND is_active = true
    ORDER BY created_at DESC LIMIT 1
  `.execute(db);

  const newData: Record<string, unknown> = {
    agent_id: agentId,
    user_prompt_template: userPrompt,
    is_active: true,
  };

  if (existing.rows.length > 0) {
    const current = existing.rows[0];
    const merged: Record<string, unknown> = { ...current };
    for (const [key, value] of Object.entries(newData)) {
      if (value !== undefined) merged[key] = value;
    }
    delete merged.version_id;
    delete merged.created_at;

    const cols = Object.keys(merged);
    const vals = Object.values(merged);
    const placeholders = vals.map((v, i) => castValue(cols[i], v));

    const result = await sql<Record<string, unknown>>`
      INSERT INTO agent_definitions (${sql.raw(cols.join(', '))})
      VALUES (${sql.join(placeholders)})
      RETURNING version_id
    `.execute(db);

    const versionId = result.rows[0].version_id;
    console.log(`✓ Updated ${agentId} (version ${versionId})`);
  } else {
    console.warn(`⚠ Agent ${agentId} not found in database, skipping`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  if (dryRun) {
    console.log('🔍 Running in DRY RUN mode - no changes will be made\n');
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('Error: DATABASE_URL must be set. Run: source .env.local');
    process.exit(1);
  }

  const db = new Kysely<unknown>({
    dialect: new PostgresDialect({
      pool: new Pool({ connectionString }),
    }),
  });

  try {
    console.log('Updating user prompt templates...\n');

    for (const [agentId, userPrompt] of Object.entries(USER_PROMPTS)) {
      await upsertUserPrompt(db, agentId, userPrompt, dryRun);
    }

    if (dryRun) {
      console.log('\n🔍 Dry run complete. Run without --dry-run to apply changes.');
    } else {
      console.log('\n✅ All user prompts updated successfully!');
    }
  } catch (error) {
    console.error('Error updating user prompts:', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }

  process.exit(0);
}

main();
