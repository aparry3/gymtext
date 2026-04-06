/**
 * Seed Agents
 *
 * Seeds agent_definitions table with default agents.
 * Uses upsert - idempotent (safe to run multiple times).
 *
 * This version uses the simplified schema from the consolidated agent system migration.
 * System prompts and user prompt templates are loaded from /prompts/*.md files
 * to ensure the seed always matches the canonical prompt definitions.
 *
 * Run: pnpm seed:agents
 */

import 'dotenv/config';
import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const PROMPTS_DIR = resolve(__dirname, '../../../prompts');

function loadPrompt(filename: string): string {
  return readFileSync(resolve(PROMPTS_DIR, filename), 'utf-8').trim();
}

interface AgentDefinition {
  agent_id: string;
  system_prompt: string;
  model: string;
  max_tokens: number;
  temperature: number;
  max_iterations: number;
  description: string;
  is_active: boolean;
  tool_ids: string[];
  user_prompt_template: string;
  examples: Record<string, unknown> | null;
  eval_rubric: string | null;
  output_schema: Record<string, unknown> | null;
  formatter_ids: string[] | null;
}

interface FormatterDefinition {
  formatter_id: string;
  content: string;
  description: string | null;
}

const FORMATTERS_DIR = resolve(PROMPTS_DIR, 'formatters');

function loadFormatter(filename: string): string {
  return readFileSync(resolve(FORMATTERS_DIR, filename), 'utf-8').trim();
}

const DEFAULT_FORMATTERS: FormatterDefinition[] = [
  {
    formatter_id: 'dossier:day-fence',
    content: loadFormatter('dossier-day-fence.md'),
    description: 'Day fence delimiter format for microcycle and workout modification agents',
  },
];

const DEFAULT_AGENTS: AgentDefinition[] = [
  // ─── Agents with canonical prompts in /prompts/*.md ───────────────────────

  {
    agent_id: 'profile:update',
    system_prompt: loadPrompt('01-profile-agent.md'),
    model: 'gpt-5-mini',
    max_tokens: 32000,
    temperature: 1,
    max_iterations: 3,
    description: 'Creates and updates user fitness profiles',
    is_active: true,
    tool_ids: [],
    user_prompt_template: loadPrompt('01-profile-agent-USER.md'),
    examples: null,
    eval_rubric: loadPrompt('eval-rubric-profile-update.md'),
    output_schema: null,
    formatter_ids: null,
  },
  {
    agent_id: 'plan:generate',
    system_prompt: loadPrompt('02-plan-agent.md'),
    model: 'gpt-5-mini',
    max_tokens: 32000,
    temperature: 1.0,
    max_iterations: 5,
    description: 'Generates comprehensive training programs based on user goals and profile',
    is_active: true,
    tool_ids: [],
    user_prompt_template: loadPrompt('02-plan-agent-USER.md'),
    examples: null,
    eval_rubric: loadPrompt('eval-rubric-plan-generate.md'),
    output_schema: null,
    formatter_ids: null,
  },
  {
    agent_id: 'week:generate',
    system_prompt: loadPrompt('03-microcycle-agent.md'),
    model: 'gpt-5-mini',
    max_tokens: 32000,
    temperature: 1.0,
    max_iterations: 4,
    description: 'Generates weekly microcycle workouts based on program phase',
    is_active: true,
    tool_ids: [],
    user_prompt_template: loadPrompt('03-microcycle-agent-USER.md'),
    examples: null,
    eval_rubric: loadPrompt('eval-rubric-week-generate.md'),
    output_schema: null,
    formatter_ids: ['dossier:day-fence'],
  },
  {
    agent_id: 'workout:format',
    system_prompt: loadPrompt('04-workout-message-agent.md'),
    model: 'gpt-5-mini',
    max_tokens: 32000,
    temperature: 1.0,
    max_iterations: 2,
    description: 'Formats daily workout as a concise text message',
    is_active: true,
    tool_ids: [],
    user_prompt_template: loadPrompt('04-workout-message-agent-USER.md'),
    examples: null,
    eval_rubric: loadPrompt('eval-rubric-workout-format.md'),
    output_schema: null,
  },

  // ─── Agents without canonical prompt files (inline prompts) ───────────────

  {
    agent_id: 'profile:user',
    system_prompt: `You are a user field extraction agent. Your role is to quickly extract simple user preferences and settings from messages.

## Your Role
1. Detect timezone mentions
2. Extract preferred workout times
3. Note name changes or preferences
4. Identify quick profile updates

## What to Extract
- Timezone (e.g., "I'm in EST", "PST")
- Preferred send times (e.g., "6am", "morning")
- Name changes
- Simple preferences

## Input Format
User messages that may contain:
- Timezone information
- Preferred workout/send times
- Name updates
- Simple preference changes

## Output Format
Return a JSON object with the extracted fields:
{
  "timezone": "America/New_York" | null,
  "preferredSendTime": "06:00" | null,
  "name": "New Name" | null,
  "preferences": {}
}

Only include fields that were explicitly mentioned.`,
    model: 'gpt-5-mini',
    max_tokens: 32000,
    temperature: 1,
    max_iterations: 1,
    description: 'Extracts simple user preferences and settings from messages',
    is_active: true,
    tool_ids: [],
    user_prompt_template: 'Extract user preferences from:\n\n{{input}}\n\nReturn JSON with timezone, preferredSendTime, name if mentioned.',
    examples: null,
    eval_rubric: null,
    output_schema: null,
    formatter_ids: null,
  },
  {
    agent_id: 'messaging:plan-summary',
    system_prompt: `You are a messaging agent. Your role is to generate brief, motivating SMS summaries of training plans.

## Your Goal
Create short, scannable messages that give users a clear view of their upcoming training.

## Format Guidelines
- Keep under 160 characters
- Highlight key points
- Be motivating but brief
- Focus on the week ahead

## Include
- Week focus or theme
- Number of workouts
- Key highlights
- Motivational tone`,
    model: 'gpt-5-mini',
    max_tokens: 32000,
    temperature: 1.0,
    max_iterations: 2,
    description: 'Generates SMS summaries of training plans',
    is_active: true,
    tool_ids: [],
    user_prompt_template: 'Generate a brief training plan summary:\n\n{{input}}\n\nKeep it under 160 characters, motivating, and focused on the week ahead.',
    examples: null,
    eval_rubric: null,
    output_schema: null,
    formatter_ids: null,
  },
  {
    agent_id: 'messaging:plan-ready',
    system_prompt: `You are a messaging agent. Your role is to generate "plan ready" notifications when a new training plan or phase is ready.

## Your Goal
Create exciting, motivating messages that get users pumped for their new training.

## Format Guidelines
- Enthusiastic but not over the top
- Clear about what's ready
- Brief call to action
- Keep under 160 characters

## Include
- What phase/week is ready
- Brief highlight
- Encouragement`,
    model: 'gpt-5-mini',
    max_tokens: 32000,
    temperature: 1.0,
    max_iterations: 2,
    description: 'Generates "plan ready" notification messages',
    is_active: true,
    tool_ids: [],
    user_prompt_template: 'Generate a "plan ready" notification:\n\n{{input}}\n\nKeep it under 160 characters, enthusiastic, and motivating.',
    examples: null,
    eval_rubric: null,
    output_schema: null,
    formatter_ids: null,
  },
  {
    agent_id: 'program:parse',
    system_prompt: `You are a program parsing agent. Your role is to extract structured training programs from raw text (e.g., copied from PDFs, websites, emails).

## Your Role
1. Parse unstructured program text
2. Extract structured workout data
3. Handle various formats
4. Validate completeness

## Input Format
Raw text that may include:
- Exercise names
- Sets and reps
- Weights or percentages
- Week/day structure
- Notes and cues

## Output Format
Provide the program in standard markdown format with:
1. Program overview
2. Phase structure
3. Weekly templates
4. Exercise details

Be flexible with input formats but output consistently.`,
    model: 'gpt-5-mini',
    max_tokens: 32000,
    temperature: 1,
    max_iterations: 3,
    description: 'Parses raw text into structured training programs',
    is_active: true,
    tool_ids: [],
    user_prompt_template: 'Parse this training program from raw text:\n\n{{input}}\n\nExtract structured workout data and format as a standard program.',
    examples: null,
    eval_rubric: null,
    output_schema: null,
    formatter_ids: null,
  },
  {
    agent_id: 'blog:metadata',
    system_prompt: `You are a blog metadata extraction agent. Your role is to extract metadata from blog content for categorization and SEO.

## Your Role
1. Analyze blog content
2. Extract relevant metadata
3. Categorize content
4. Generate tags

## Metadata to Extract
- Title (from content)
- Summary/description
- Category
- Tags
- Reading time estimate
- Key topics

## Input Format
Blog content (markdown or HTML)

## Output Format
Provide metadata as JSON:
{
  "title": "...",
  "summary": "...",
  "category": "...",
  "tags": ["...", "..."],
  "readingTime": 5,
  "keyTopics": ["...", "..."]
}`,
    model: 'gpt-5-mini',
    max_tokens: 32000,
    temperature: 1,
    max_iterations: 2,
    description: 'Extracts metadata from blog content',
    is_active: true,
    tool_ids: [],
    user_prompt_template: 'Extract metadata from this blog content:\n\n{{input}}\n\nReturn JSON with title, summary, category, tags, readingTime, keyTopics.',
    examples: null,
    eval_rubric: null,
    output_schema: null,
    formatter_ids: null,
  },
  {
    agent_id: 'plan:modify',
    system_prompt: loadPrompt('07-plan-modify-agent.md'),
    model: 'gpt-5-mini',
    max_tokens: 32000,
    temperature: 1.0,
    max_iterations: 5,
    description: 'Modifies the training program based on user feedback or changes in circumstances',
    is_active: true,
    tool_ids: [],
    user_prompt_template: loadPrompt('07-plan-modify-agent-USER.md'),
    examples: null,
    eval_rubric: null,
    output_schema: null,
    formatter_ids: null,
  },
  {
    agent_id: 'workout:modify',
    system_prompt: loadPrompt('06-workout-modify-agent.md'),
    model: 'gpt-5-mini',
    max_tokens: 32000,
    temperature: 1.0,
    max_iterations: 3,
    description: 'Modifies workouts and weekly schedules within a week dossier',
    is_active: true,
    tool_ids: [],
    user_prompt_template: loadPrompt('06-workout-modify-agent-USER.md'),
    examples: null,
    eval_rubric: null,
    output_schema: null,
    formatter_ids: ['dossier:day-fence'],
  },
  {
    agent_id: 'week:format',
    system_prompt: `You are a week formatting agent. Your role is to format a week's training as clean, readable markdown for the user's dossier.

## Your Goal
Create a well-structured markdown document that clearly shows:
1. The week's focus and theme
2. Each day's workout
3. Key metrics and progression
4. Notes and considerations

## Format Guidelines
- Use clear headings and structure
- Include relevant metadata (volume, intensity, focus)
- Highlight key exercises or progression points
- Keep it scannable and easy to read

## Include
- Week number and phase
- Daily focus areas
- Key exercises with sets/reps/weight
- Volume totals where relevant
- Any special notes or considerations`,
    model: 'gpt-5-mini',
    max_tokens: 32000,
    temperature: 1.0,
    max_iterations: 3,
    description: 'Formats a week of training as clean, readable markdown for the user dossier',
    is_active: true,
    tool_ids: [],
    user_prompt_template: `Format the following week dossier into a clean, readable summary:\n\n{{input}}`,
    examples: null,
    eval_rubric: null,
    output_schema: null,
    formatter_ids: null,
  },
  {
    agent_id: 'chat:generate',
    system_prompt: loadPrompt('08-chat-agent.md'),
    model: 'gpt-5-mini',
    max_tokens: 32000,
    temperature: 1,
    max_iterations: 3,
    description: 'Main chat agent for conversational responses',
    is_active: true,
    tool_ids: ['update_profile', 'get_workout', 'modify_workout', 'modify_plan'],
    user_prompt_template: '{{input}}',
    examples: null,
    eval_rubric: null,
    output_schema: null,
    formatter_ids: null,
  },

  // ─── Migration agents (data format conversion) ─────────────────────────────

  {
    agent_id: 'migrate:profile',
    system_prompt: loadPrompt('migrate-profile.md'),
    model: 'gpt-5-mini',
    max_tokens: 32000,
    temperature: 0.3,
    max_iterations: 1,
    description: 'Converts old-format fitness profiles to new standardized format',
    is_active: true,
    tool_ids: [],
    user_prompt_template: 'Convert this fitness profile to the new standardized format. Preserve all data exactly — only restructure and reformat.\n\n{{input}}',
    examples: null,
    eval_rubric: null,
    output_schema: null,
    formatter_ids: null,
  },
  {
    agent_id: 'migrate:plan',
    system_prompt: loadPrompt('migrate-plan.md'),
    model: 'gpt-5-mini',
    max_tokens: 32000,
    temperature: 0.3,
    max_iterations: 1,
    description: 'Converts old-format training plans to new standardized dossier format',
    is_active: true,
    tool_ids: [],
    user_prompt_template: 'Convert this training plan to the new standardized format. Preserve all data exactly — only restructure and reformat.\n\n{{input}}',
    examples: null,
    eval_rubric: null,
    output_schema: null,
    formatter_ids: null,
  },
  {
    agent_id: 'migrate:week',
    system_prompt: loadPrompt('migrate-week.md'),
    model: 'gpt-5-mini',
    max_tokens: 32000,
    temperature: 0.3,
    max_iterations: 1,
    description: 'Converts old-format microcycle dossiers to new format with day fences',
    is_active: true,
    tool_ids: [],
    user_prompt_template: 'Convert this weekly microcycle to the new standardized format with day fence delimiters. Preserve all data exactly — only restructure and reformat.\n\n{{input}}',
    examples: null,
    eval_rubric: null,
    output_schema: null,
    formatter_ids: ['dossier:day-fence'],
  },
];

export interface SeedAgentsOptions {
  overwrite?: boolean;
}

export async function seedAgents(options?: SeedAgentsOptions): Promise<void> {
  const { overwrite = false } = options || {};
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Seed formatters first (agents may reference them)
    console.log('Seeding formatters...');
    for (const formatter of DEFAULT_FORMATTERS) {
      const existing = await pool.query(
        `SELECT 1 FROM formatters WHERE formatter_id = $1 LIMIT 1`,
        [formatter.formatter_id]
      );

      if (existing.rows.length > 0 && !overwrite) {
        console.log(`  ⏭ ${formatter.formatter_id} — already exists`);
        continue;
      }

      // Insert new version (append-only)
      await pool.query(
        `INSERT INTO formatters (formatter_id, content, description)
         VALUES ($1, $2, $3)`,
        [formatter.formatter_id, formatter.content, formatter.description]
      );
      console.log(`  ✓ ${formatter.formatter_id}`);
    }
    console.log(`✅ Seeded ${DEFAULT_FORMATTERS.length} formatters`);

    console.log(`Seeding agent definitions${overwrite ? ' (overwrite mode)' : ''}...`);

    for (const agent of DEFAULT_AGENTS) {
      const existing = await pool.query(
        `SELECT 1 FROM agent_definitions WHERE agent_id = $1 LIMIT 1`,
        [agent.agent_id]
      );

      if (existing.rows.length > 0 && !overwrite) {
        console.log(`  ⏭ ${agent.description} (${agent.agent_id}) — already exists`);
        continue;
      }

      if (existing.rows.length > 0 && overwrite) {
        // Insert a new version (append-only table)
        await pool.query(
          `
          INSERT INTO agent_definitions (
            agent_id, system_prompt, model, max_tokens, temperature,
            max_iterations, description, is_active, tool_ids,
            user_prompt_template, examples, eval_rubric, output_schema,
            formatter_ids
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
          )
          `,
          [
            agent.agent_id,
            agent.system_prompt,
            agent.model,
            agent.max_tokens,
            agent.temperature,
            agent.max_iterations,
            agent.description,
            agent.is_active,
            agent.tool_ids,
            agent.user_prompt_template,
            agent.examples ? JSON.stringify(agent.examples) : null,
            agent.eval_rubric,
            agent.output_schema ? JSON.stringify(agent.output_schema) : null,
            agent.formatter_ids,
          ]
        );
        console.log(`  ↻ ${agent.description} (${agent.agent_id}) — new version inserted`);
        continue;
      }

      await pool.query(
        `
        INSERT INTO agent_definitions (
          agent_id, system_prompt, model, max_tokens, temperature,
          max_iterations, description, is_active, tool_ids,
          user_prompt_template, examples, eval_rubric, output_schema,
          formatter_ids
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
        )
        `,
        [
          agent.agent_id,
          agent.system_prompt,
          agent.model,
          agent.max_tokens,
          agent.temperature,
          agent.max_iterations,
          agent.description,
          agent.is_active,
          agent.tool_ids,
          agent.user_prompt_template,
          agent.examples ? JSON.stringify(agent.examples) : null,
          agent.eval_rubric,
          agent.output_schema ? JSON.stringify(agent.output_schema) : null,
          agent.formatter_ids,
        ]
      );
      console.log(`  ✓ ${agent.description} (${agent.agent_id})`);
    }

    console.log(`✅ Seeded ${DEFAULT_AGENTS.length} agents`);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  seedAgents()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
