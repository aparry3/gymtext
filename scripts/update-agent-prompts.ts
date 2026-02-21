#!/usr/bin/env tsx
/**
 * Update Agent Prompts from Markdown Files
 *
 * This script reads the prompt markdown files from the prompts/ directory
 * and updates the agent_definitions table with the new prompts.
 *
 * Usage:
 *   pnpm update-prompts
 *
 * Requires DATABASE_URL to be set.
 * Run: source .env.local before using.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { Kysely, PostgresDialect, sql } from 'kysely';
import { Pool } from 'pg';

// Mapping of prompt files to agent IDs
const AGENT_MAPPINGS = [
  {
    agentId: 'profile:update',
    description: 'Creates and maintains detailed fitness profiles',
    systemPromptFile: '01-profile-agent.md',
    userPromptFile: '01-profile-agent-USER.md',
  },
  {
    agentId: 'plan:generate',
    description: 'Designs comprehensive periodized training programs',
    systemPromptFile: '02-plan-agent.md',
    userPromptFile: '02-plan-agent-USER.md',
  },
  {
    agentId: 'week:generate',
    description: 'Creates specific, executable workouts for one week',
    systemPromptFile: '03-microcycle-agent.md',
    userPromptFile: '03-microcycle-agent-USER.md',
  },
  {
    agentId: 'workout:format',
    description: 'Formats daily workout messages for text delivery',
    systemPromptFile: '04-workout-message-agent.md',
    userPromptFile: '04-workout-message-agent-USER.md',
  },
  {
    agentId: 'week:modify',
    description: 'Modifies existing weekly training schedules',
    systemPromptFile: '05-week-modify-agent.md',
    userPromptFile: '05-week-modify-agent-USER.md',
  },
];

const TEXT_ARRAY_COLS = new Set(['tool_ids', 'context_types']);
const JSONB_COLS = new Set(['sub_agents', 'schema_json', 'validation_rules', 'examples']);

function castValue(col: string, v: unknown) {
  if (v === null || v === undefined) return sql`${null}`;
  if (TEXT_ARRAY_COLS.has(col)) {
    return sql`${Array.isArray(v) ? v : [v]}`;
  }
  if (JSONB_COLS.has(col)) {
    return sql`${JSON.stringify(v)}::jsonb`;
  }
  return sql`${v}`;
}

async function readPromptFile(filename: string): Promise<string> {
  const promptsDir = path.join(process.cwd(), 'prompts');
  const filePath = path.join(promptsDir, filename);
  return await fs.readFile(filePath, 'utf-8');
}

async function upsertAgent(
  db: Kysely<unknown>,
  agentId: string,
  description: string,
  systemPrompt: string,
  userPrompt: string
) {
  // Get current version to merge
  const existing = await sql<Record<string, unknown>>`
    SELECT * FROM agent_definitions
    WHERE agent_id = ${agentId} AND is_active = true
    ORDER BY created_at DESC LIMIT 1
  `.execute(db);

  const newData: Record<string, unknown> = {
    agent_id: agentId,
    description,
    system_prompt: systemPrompt,
    user_prompt_template: userPrompt,
    is_active: true,
  };

  if (existing.rows.length > 0) {
    const current = existing.rows[0];
    // Merge: new values override current
    const merged: Record<string, unknown> = { ...current };
    for (const [key, value] of Object.entries(newData)) {
      if (value !== undefined) merged[key] = value;
    }
    // Remove auto-generated fields
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
    const cols = Object.keys(newData);
    const vals = Object.values(newData);
    const placeholders = vals.map((v, i) => castValue(cols[i], v));

    const result = await sql<Record<string, unknown>>`
      INSERT INTO agent_definitions (${sql.raw(cols.join(', '))})
      VALUES (${sql.join(placeholders)})
      RETURNING version_id
    `.execute(db);

    const versionId = result.rows[0].version_id;
    console.log(`✓ Created ${agentId} (version ${versionId})`);
  }
}

async function main() {
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
    console.log('Reading prompt files from prompts/...\n');

    for (const mapping of AGENT_MAPPINGS) {
      const systemPrompt = await readPromptFile(mapping.systemPromptFile);
      const userPrompt = await readPromptFile(mapping.userPromptFile);

      await upsertAgent(
        db,
        mapping.agentId,
        mapping.description,
        systemPrompt,
        userPrompt
      );
    }

    console.log('\n✅ All agent prompts updated successfully!');
  } catch (error) {
    console.error('Error updating agent prompts:', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }

  process.exit(0);
}

main();
