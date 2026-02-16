/**
 * Update Context Templates
 *
 * Migrates context templates from XML wrappers to narrative briefing format
 * and updates the chat:generate agent definition with the full context_types list.
 *
 * This script is idempotent: it checks for existing narrative templates before
 * inserting duplicates, and checks the current chat:generate context_types
 * before inserting a new agent version.
 *
 * Usage:
 *   source .env.local && npx tsx scripts/update-context-templates.ts
 */

import { Kysely, PostgresDialect, sql } from 'kysely';
import { Pool } from 'pg';

// ─── Narrative Templates ────────────────────────────────────────────────────

const NARRATIVE_TEMPLATES: Array<{ contextType: string; template: string }> = [
  {
    contextType: 'user',
    template:
      'Client: {{#if user.name}}{{user.name}}{{else}}Unknown{{/if}}{{#if user.gender}} ({{user.gender}}){{/if}}{{#if user.age}}, age {{user.age}}{{/if}}',
  },
  {
    contextType: 'userProfile',
    template: 'Here is everything we know about this client:\n\n{{content}}',
  },
  {
    contextType: 'dateContext',
    template: 'Today is {{formattedDate}} ({{timezone}}).',
  },
  {
    contextType: 'fitnessPlan',
    template: 'Their current training program:\n\n{{content}}',
  },
  {
    contextType: 'dayOverview',
    template: "Today's training focus:\n\n{{content}}",
  },
  {
    contextType: 'currentWorkout',
    template:
      "Today's scheduled workout:\n\n{{#if workout.description}}{{workout.description}}{{else}}{{#if workout.sessionType}}{{workout.sessionType}}{{else}}No workout details available{{/if}}{{/if}}",
  },
  {
    contextType: 'currentMicrocycle',
    template:
      "This week's training plan (Week {{microcycle.absoluteWeek}}):\n\n{{#if microcycle.description}}{{microcycle.description}}\n\n{{/if}}Monday: {{microcycle.days.0}}\nTuesday: {{microcycle.days.1}}\nWednesday: {{microcycle.days.2}}\nThursday: {{microcycle.days.3}}\nFriday: {{microcycle.days.4}}\nSaturday: {{microcycle.days.5}}\nSunday: {{microcycle.days.6}}",
  },
  {
    contextType: 'upcomingMicrocycle',
    template:
      "Next week's training plan (Week {{microcycle.absoluteWeek}}):\n\n{{#if microcycle.description}}{{microcycle.description}}\n\n{{/if}}Monday: {{microcycle.days.0}}\nTuesday: {{microcycle.days.1}}\nWednesday: {{microcycle.days.2}}\nThursday: {{microcycle.days.3}}\nFriday: {{microcycle.days.4}}\nSaturday: {{microcycle.days.5}}\nSunday: {{microcycle.days.6}}",
  },
  {
    contextType: 'programVersion',
    template: 'Program template:\n\n{{content}}',
  },
  {
    contextType: 'availableExercises',
    template:
      'Available exercises:\n{{#each exercises separator="\\n"}}- {{name}}{{/each}}',
  },
];

// The desired context_types for chat:generate
const CHAT_GENERATE_CONTEXT_TYPES = [
  'user',
  'userProfile',
  'fitnessPlan',
  'currentMicrocycle',
  'upcomingMicrocycle',
  'recentWorkouts',
  'dateContext',
  'currentWorkout',
];

// The desired tool_ids for chat:generate
const CHAT_GENERATE_TOOL_IDS = [
  'update_profile',
  'modify_workout',
  'modify_week',
  'modify_plan',
  'get_workout',
];

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('Error: DATABASE_URL is not set. Run: source .env.local');
    process.exit(1);
  }

  const db = new Kysely<unknown>({
    dialect: new PostgresDialect({
      pool: new Pool({ connectionString }),
    }),
  });

  try {
    console.log('Connecting to database...\n');

    // ─── Step 1: Update context_templates table ───────────────────────────

    console.log('--- Step 1: Update context templates ---');

    let templatesInserted = 0;
    let templatesSkipped = 0;

    for (const { contextType, template } of NARRATIVE_TEMPLATES) {
      // Check if the latest template for this context type already matches
      const existing = await sql<{ template: string }>`
        SELECT template FROM context_templates
        WHERE context_type = ${contextType} AND variant = 'default'
        ORDER BY created_at DESC
        LIMIT 1
      `.execute(db);

      if (existing.rows.length > 0 && existing.rows[0].template === template) {
        console.log(`  Skipped (already current): ${contextType}`);
        templatesSkipped++;
        continue;
      }

      await sql`
        INSERT INTO context_templates (context_type, variant, template)
        VALUES (${contextType}, 'default', ${template})
      `.execute(db);
      templatesInserted++;
      console.log(`  Updated: ${contextType}`);
    }

    console.log(`\nTemplates inserted: ${templatesInserted}, skipped: ${templatesSkipped}\n`);

    // ─── Step 2: Update chat:generate agent definition ────────────────────

    console.log('--- Step 2: Update chat:generate agent definition ---');

    // Get the current active chat:generate definition
    const current = await sql<Record<string, unknown>>`
      SELECT * FROM agent_definitions
      WHERE agent_id = 'chat:generate' AND is_active = true
      ORDER BY created_at DESC
      LIMIT 1
    `.execute(db);

    if (current.rows.length === 0) {
      console.log('  Warning: No active chat:generate agent found. Skipping agent update.');
    } else {
      const row = current.rows[0];
      const currentContextTypes = row.context_types as string[] | null;
      const currentToolIds = row.tool_ids as string[] | null;

      // Check if context_types and tool_ids already match
      const contextAlreadyCurrent =
        currentContextTypes &&
        JSON.stringify(currentContextTypes.sort()) ===
          JSON.stringify([...CHAT_GENERATE_CONTEXT_TYPES].sort());

      const toolsAlreadyCurrent =
        currentToolIds &&
        JSON.stringify(currentToolIds.sort()) ===
          JSON.stringify([...CHAT_GENERATE_TOOL_IDS].sort());

      if (contextAlreadyCurrent && toolsAlreadyCurrent) {
        console.log('  Skipped (context_types and tool_ids already current)');
      } else {
        // Build a new row by copying all columns from the current version
        // and overriding context_types and tool_ids
        const merged: Record<string, unknown> = { ...row };
        merged.context_types = CHAT_GENERATE_CONTEXT_TYPES;
        merged.tool_ids = CHAT_GENERATE_TOOL_IDS;
        // Remove auto-generated fields so DB creates new ones
        delete merged.version_id;
        delete merged.created_at;

        const cols = Object.keys(merged);

        // Build value expressions with proper casts
        const TEXT_ARRAY_COLS = new Set(['tool_ids', 'context_types']);
        const JSONB_COLS = new Set(['sub_agents', 'schema_json', 'validation_rules', 'examples']);

        const placeholders = cols.map((col) => {
          const v = merged[col];
          if (v === null || v === undefined) return sql`${null}`;
          if (TEXT_ARRAY_COLS.has(col)) return sql`${Array.isArray(v) ? v : [v]}`;
          if (JSONB_COLS.has(col)) return sql`${JSON.stringify(v)}::jsonb`;
          return sql`${v}`;
        });

        await sql`
          INSERT INTO agent_definitions (${sql.raw(cols.join(', '))})
          VALUES (${sql.join(placeholders)})
        `.execute(db);

        console.log(`  Inserted new chat:generate version with context_types: ${JSON.stringify(CHAT_GENERATE_CONTEXT_TYPES)}, tool_ids: ${JSON.stringify(CHAT_GENERATE_TOOL_IDS)}`);
      }
    }

    console.log('\nDone!');
  } catch (error) {
    console.error('Update failed:', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

main();
