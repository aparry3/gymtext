#!/usr/bin/env tsx
/**
 * Agent Prompt Migration Script
 *
 * Migrates agent prompts from markdown files to the agent_definitions table.
 * This is Option 2 from the agent-prompt-migration-plan.md.
 *
 * Usage:
 *   pnpm migrate:prompts              # Migrate all prompts
 *   pnpm migrate:prompts --dry-run    # Test without writing to DB
 *   pnpm migrate:prompts --agent=<id> # Migrate specific agent only
 *
 * Environment:
 *   DATABASE_URL or SANDBOX_DATABASE_URL must be set.
 *   The script will automatically load .env.local if available.
 */

import * as dotenv from 'dotenv';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Kysely, PostgresDialect, sql } from 'kysely';
import { Pool } from 'pg';

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// ============================================================================
// Configuration
// ============================================================================

/**
 * Mapping of agent IDs to their markdown file paths.
 * Each entry specifies the system prompt file and optional user prompt file.
 */
const AGENT_MAPPINGS: Array<{
  agentId: string;
  description: string;
  systemPromptFile: string;
  userPromptFile?: string;
}> = [
  {
    agentId: 'profile:create',
    description: 'Creates and maintains detailed fitness profiles',
    systemPromptFile: '01-profile-agent.md',
    userPromptFile: '01-profile-agent-USER.md',
  },
  {
    agentId: 'plan:create',
    description: 'Designs comprehensive periodized training programs',
    systemPromptFile: '02-plan-agent.md',
    userPromptFile: '02-plan-agent-USER.md',
  },
  {
    agentId: 'microcycle:create',
    description: 'Creates specific, executable workouts for one week',
    systemPromptFile: '03-microcycle-agent.md',
    userPromptFile: '03-microcycle-agent-USER.md',
  },
  {
    agentId: 'message:workout',
    description: 'Formats daily workout messages for text delivery',
    systemPromptFile: '04-workout-message-agent.md',
    userPromptFile: '04-workout-message-agent-USER.md',
  },
  {
    agentId: 'microcycle:modify',
    description: 'Modifies existing microcycles based on user feedback',
    systemPromptFile: '05-microcycle-modify-agent.md',
    userPromptFile: '05-microcycle-modify-agent-USER.md',
  },
];

// ============================================================================
// Prompt Parsing
// ============================================================================

/**
 * Extracts the actual prompt content from a markdown file.
 *
 * Strips:
 * - First heading (title like "# Profile Agent Prompt")
 * - Any frontmatter-like sections before the prompt content
 *
 * The actual prompt content typically starts from "## Role" heading.
 */
function extractPromptContent(markdown: string): string {
  const lines = markdown.split('\n');

  // Find the first content line (skip the title heading)
  let startIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Skip empty lines at the start
    if (line === '') {
      continue;
    }
    // Skip the first heading (title like "# Agent Name Prompt")
    if (line.startsWith('# ') && !line.startsWith('## ')) {
      startIndex = i + 1;
      continue;
    }
    // Found actual content
    break;
  }

  // Skip any leading empty lines after the title
  while (startIndex < lines.length && lines[startIndex].trim() === '') {
    startIndex++;
  }

  return lines.slice(startIndex).join('\n').trim();
}

// ============================================================================
// Database Operations
// ============================================================================

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

async function readPromptFile(filename: string, promptsDir: string): Promise<string> {
  const filePath = path.join(promptsDir, filename);
  const content = await fs.readFile(filePath, 'utf-8');
  return extractPromptContent(content);
}

interface MigrationResult {
  agentId: string;
  status: 'created' | 'updated' | 'skipped' | 'error';
  versionId?: number;
  error?: string;
}

async function migrateAgent(
  db: Kysely<unknown>,
  mapping: typeof AGENT_MAPPINGS[0],
  dryRun: boolean
): Promise<MigrationResult> {
  const { agentId, description, systemPromptFile, userPromptFile } = mapping;

  try {
    // Read prompt files
    const promptsDir = path.join(process.cwd(), 'prompts');
    const systemPrompt = await readPromptFile(systemPromptFile, promptsDir);
    const userPrompt = userPromptFile
      ? await readPromptFile(userPromptFile, promptsDir)
      : null;

    if (dryRun) {
      console.log(`  [DRY-RUN] Would update ${agentId}`);
      console.log(`    System prompt: ${systemPrompt.substring(0, 50)}...`);
      if (userPrompt) {
        console.log(`    User prompt: ${userPrompt.substring(0, 50)}...`);
      }
      return { agentId, status: 'skipped' };
    }

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

    let versionId: number;

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

      versionId = result.rows[0].version_id as number;
      console.log(`  ✓ Updated ${agentId} (version ${versionId})`);
    } else {
      const cols = Object.keys(newData);
      const vals = Object.values(newData);
      const placeholders = vals.map((v, i) => castValue(cols[i], v));

      const result = await sql<Record<string, unknown>>`
        INSERT INTO agent_definitions (${sql.raw(cols.join(', '))})
        VALUES (${sql.join(placeholders)})
        RETURNING version_id
      `.execute(db);

      versionId = result.rows[0].version_id as number;
      console.log(`  ✓ Created ${agentId} (version ${versionId})`);
    }

    return { agentId, status: existing.rows.length > 0 ? 'updated' : 'created', versionId };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`  ✗ Error migrating ${agentId}: ${errorMessage}`);
    return { agentId, status: 'error', error: errorMessage };
  }
}

// ============================================================================
// CLI
// ============================================================================

function parseArgs(): { dryRun: boolean; agentId: string | null } {
  const args = process.argv.slice(2);
  let dryRun = false;
  let agentId: string | null = null;

  for (const arg of args) {
    if (arg === '--dry-run' || arg === '-n') {
      dryRun = true;
    } else if (arg.startsWith('--agent=')) {
      agentId = arg.replace('--agent=', '');
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Agent Prompt Migration Script

Usage:
  pnpm migrate:prompts [options]

Options:
  --dry-run, -n    Run without writing to database
  --agent=<id>     Migrate specific agent only
  --help, -h       Show this help message

Examples:
  pnpm migrate:prompts                 # Migrate all prompts
  pnpm migrate:prompts --dry-run       # Test without writing
  pnpm migrate:prompts --agent=profile:create  # Migrate single agent
`);
      process.exit(0);
    }
  }

  return { dryRun, agentId };
}

async function main() {
  const { dryRun, agentId } = parseArgs();

  console.log('\n📦 Agent Prompt Migration');
  console.log('=========================\n');

  if (dryRun) {
    console.log('⚠️  DRY RUN MODE - No changes will be made to the database\n');
  }

  // Filter mappings based on --agent flag
  const mappingsToProcess = agentId
    ? AGENT_MAPPINGS.filter((m) => m.agentId === agentId)
    : AGENT_MAPPINGS;

  if (mappingsToProcess.length === 0) {
    if (agentId) {
      console.error(`Error: Agent '${agentId}' not found in mappings.`);
      console.log('\nAvailable agents:');
      for (const m of AGENT_MAPPINGS) {
        console.log(`  - ${m.agentId}`);
      }
    }
    process.exit(1);
  }

  console.log(`Processing ${mappingsToProcess.length} agent(s):`);
  for (const m of mappingsToProcess) {
    console.log(`  - ${m.agentId}`);
  }
  console.log('');

  // Connect to database
  const connectionString = process.env.DATABASE_URL || process.env.SANDBOX_DATABASE_URL;
  if (!connectionString) {
    console.error('Error: DATABASE_URL or SANDBOX_DATABASE_URL must be set.');
    console.error('Run: source .env.local');
    process.exit(1);
  }

  const db = new Kysely<unknown>({
    dialect: new PostgresDialect({
      pool: new Pool({ connectionString }),
    }),
  });

  try {
    let results: MigrationResult[];

    if (dryRun) {
      // In dry-run mode, just simulate the work without a transaction
      results = [];
      for (const mapping of mappingsToProcess) {
        const result = await migrateAgent(db, mapping, dryRun);
        results.push(result);
      }
    } else {
      // Run migrations in a transaction for safety
      results = await db.transaction().execute(async (tx) => {
        const txResults: MigrationResult[] = [];
        for (const mapping of mappingsToProcess) {
          const result = await migrateAgent(tx, mapping, dryRun);
          txResults.push(result);
        }
        return txResults;
      });
    }

    // Summary
    console.log('\n📊 Summary');
    console.log('----------');
    const created = results.filter((r) => r.status === 'created').length;
    const updated = results.filter((r) => r.status === 'updated').length;
    const skipped = results.filter((r) => r.status === 'skipped').length;
    const errors = results.filter((r) => r.status === 'error').length;

    if (!dryRun) {
      console.log(`  Created: ${created}`);
      console.log(`  Updated: ${updated}`);
    } else {
      console.log(`  Would create: ${created}`);
      console.log(`  Would update: ${updated}`);
    }
    console.log(`  Skipped: ${skipped}`);
    console.log(`  Errors: ${errors}`);

    if (errors > 0) {
      console.log('\n❌ Migration completed with errors.');
      process.exit(1);
    } else {
      console.log('\n✅ Migration completed successfully!');
    }
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }

  process.exit(0);
}

main();
