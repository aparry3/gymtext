/**
 * Agent Definition CLI
 *
 * Manage agent definitions directly via the database (no migrations needed).
 *
 * Usage:
 *   pnpm agent:upsert <agent-id> <json-file>
 *   pnpm agent:upsert <agent-id> --inline '{"systemPrompt": "..."}'
 *   pnpm agent:get <agent-id>
 *   pnpm agent:list
 *
 * Requires DATABASE_URL (or SANDBOX_DATABASE_URL) to be set.
 * Run: source .env.local before using.
 */

import * as fs from 'fs/promises';
import { Kysely, PostgresDialect, sql } from 'kysely';
import { Pool } from 'pg';

const [, , command, agentId, ...rest] = process.argv;

function usage() {
  console.log(`Usage:
  pnpm agent:upsert <agent-id> <json-file>
  pnpm agent:upsert <agent-id> --inline '{"systemPrompt": "..."}'
  pnpm agent:get <agent-id>
  pnpm agent:list`);
  process.exit(1);
}

// Column name mapping: camelCase (code) → snake_case (DB)
const COLUMN_MAP: Record<string, string> = {
  agentId: 'agent_id',
  systemPrompt: 'system_prompt',
  userPrompt: 'user_prompt',
  maxTokens: 'max_tokens',
  maxIterations: 'max_iterations',
  maxRetries: 'max_retries',
  isActive: 'is_active',
  toolIds: 'tool_ids',
  contextTypes: 'context_types',
  subAgents: 'sub_agents',
  schemaJson: 'schema_json',
  validationRules: 'validation_rules',
  userPromptTemplate: 'user_prompt_template',
  versionId: 'version_id',
  createdAt: 'created_at',
  evalPrompt: 'eval_prompt',
  evalModel: 'eval_model',
};

function toSnakeCase(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[COLUMN_MAP[key] || key] = value;
  }
  return result;
}

function toCamelCase(obj: Record<string, unknown>): Record<string, unknown> {
  const reverseMap: Record<string, string> = {};
  for (const [camel, snake] of Object.entries(COLUMN_MAP)) {
    reverseMap[snake] = camel;
  }
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[reverseMap[key] || key] = value;
  }
  return result;
}

// text[] columns need array syntax; jsonb columns need ::jsonb cast
const TEXT_ARRAY_COLS = new Set(['tool_ids', 'context_types']);
const JSONB_COLS = new Set(['sub_agents', 'schema_json', 'validation_rules', 'examples']);

function castValue(col: string, v: unknown) {
  if (v === null || v === undefined) return sql`${null}`;
  if (TEXT_ARRAY_COLS.has(col)) {
    // pg driver handles JS arrays as postgres arrays natively
    return sql`${Array.isArray(v) ? v : [v]}`;
  }
  if (JSONB_COLS.has(col)) {
    return sql`${JSON.stringify(v)}::jsonb`;
  }
  return sql`${v}`;
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
    switch (command) {
      case 'upsert': {
        if (!agentId) {
          console.error('Error: agent-id is required');
          usage();
        }

        let definition: Record<string, unknown>;
        if (rest[0] === '--inline') {
          const json = rest.slice(1).join(' ');
          if (!json) {
            console.error('Error: inline JSON is required after --inline');
            usage();
          }
          definition = JSON.parse(json);
        } else if (rest[0]) {
          const content = await fs.readFile(rest[0], 'utf-8');
          definition = JSON.parse(content);
        } else {
          console.error('Error: provide a JSON file path or --inline JSON');
          usage();
          return;
        }

        // Get current version to merge
        const existing = await sql<Record<string, unknown>>`
          SELECT * FROM agent_definitions
          WHERE agent_id = ${agentId} AND is_active = true
          ORDER BY created_at DESC LIMIT 1
        `.execute(db);

        const snakeDef = toSnakeCase(definition);

        if (existing.rows.length > 0) {
          const current = existing.rows[0];
          // Merge: new values override current
          const merged: Record<string, unknown> = { ...current };
          for (const [key, value] of Object.entries(snakeDef)) {
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
            RETURNING *
          `.execute(db);

          const row = toCamelCase(result.rows[0]);
          console.log(`Updated agent ${agentId} (version ${row.versionId})`);
        } else {
          snakeDef.agent_id = agentId;
          const cols = Object.keys(snakeDef);
          const vals = Object.values(snakeDef);
          const placeholders = vals.map((v, i) => castValue(cols[i], v));

          const result = await sql<Record<string, unknown>>`
            INSERT INTO agent_definitions (${sql.raw(cols.join(', '))})
            VALUES (${sql.join(placeholders)})
            RETURNING *
          `.execute(db);

          const row = toCamelCase(result.rows[0]);
          console.log(`Created agent ${agentId} (version ${row.versionId})`);
        }
        break;
      }
      case 'get': {
        if (!agentId) {
          console.error('Error: agent-id is required');
          usage();
        }

        const result = await sql<Record<string, unknown>>`
          SELECT * FROM agent_definitions
          WHERE agent_id = ${agentId} AND is_active = true
          ORDER BY created_at DESC LIMIT 1
        `.execute(db);

        if (result.rows.length === 0) {
          console.error(`Agent not found: ${agentId}`);
          process.exit(1);
        }
        console.log(JSON.stringify(toCamelCase(result.rows[0]), null, 2));
        break;
      }
      case 'list': {
        const result = await sql<Record<string, unknown>>`
          SELECT DISTINCT ON (agent_id) agent_id, version_id, description
          FROM agent_definitions
          WHERE is_active = true
          ORDER BY agent_id, created_at DESC
        `.execute(db);

        if (result.rows.length === 0) {
          console.log('No active agent definitions found.');
        } else {
          for (const d of result.rows) {
            console.log(`${d.agent_id} (v${d.version_id}) - ${d.description || 'no description'}`);
          }
        }
        break;
      }
      default:
        console.error(`Unknown command: ${command || '(none)'}`);
        usage();
    }
  } finally {
    await db.destroy();
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
