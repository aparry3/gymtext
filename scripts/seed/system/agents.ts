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
}

const DEFAULT_AGENTS: AgentDefinition[] = [
  // ─── Agents with canonical prompts in /prompts/*.md ───────────────────────

  {
    agent_id: 'profile:update',
    system_prompt: loadPrompt('01-profile-agent.md'),
    model: 'gpt-5.2',
    max_tokens: 16000,
    temperature: 0.7,
    max_iterations: 3,
    description: 'Creates and updates user fitness profiles',
    is_active: true,
    tool_ids: [],
    user_prompt_template: loadPrompt('01-profile-agent-USER.md'),
    examples: null,
    eval_rubric: null,
    output_schema: null,
  },
  {
    agent_id: 'plan:generate',
    system_prompt: loadPrompt('02-plan-agent.md'),
    model: 'gpt-5.2',
    max_tokens: 16000,
    temperature: 1.0,
    max_iterations: 5,
    description: 'Generates comprehensive training programs based on user goals and profile',
    is_active: true,
    tool_ids: [],
    user_prompt_template: loadPrompt('02-plan-agent-USER.md'),
    examples: null,
    eval_rubric: null,
    output_schema: null,
  },
  {
    agent_id: 'week:generate',
    system_prompt: loadPrompt('03-microcycle-agent.md'),
    model: 'gpt-5.2',
    max_tokens: 16000,
    temperature: 1.0,
    max_iterations: 4,
    description: 'Generates weekly microcycle workouts based on program phase',
    is_active: true,
    tool_ids: [],
    user_prompt_template: loadPrompt('03-microcycle-agent-USER.md'),
    examples: null,
    eval_rubric: null,
    output_schema: null,
  },
  {
    agent_id: 'workout:format',
    system_prompt: loadPrompt('04-workout-message-agent.md'),
    model: 'gpt-5.2',
    max_tokens: 16000,
    temperature: 1.0,
    max_iterations: 2,
    description: 'Formats daily workout as a concise text message',
    is_active: true,
    tool_ids: [],
    user_prompt_template: loadPrompt('04-workout-message-agent-USER.md'),
    examples: null,
    eval_rubric: null,
    output_schema: null,
  },
  {
    agent_id: 'week:modify',
    system_prompt: loadPrompt('05-week-modify-agent.md'),
    model: 'gpt-5.2',
    max_tokens: 16000,
    temperature: 1.0,
    max_iterations: 3,
    description: 'Modifies an existing week in the training program based on user feedback',
    is_active: true,
    tool_ids: [],
    user_prompt_template: loadPrompt('05-week-modify-agent-USER.md'),
    examples: null,
    eval_rubric: null,
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
    model: 'gpt-5.2',
    max_tokens: 16000,
    temperature: 0.3,
    max_iterations: 1,
    description: 'Extracts simple user preferences and settings from messages',
    is_active: true,
    tool_ids: [],
    user_prompt_template: 'Extract user preferences from:\n\n{{input}}\n\nReturn JSON with timezone, preferredSendTime, name if mentioned.',
    examples: null,
    eval_rubric: null,
    output_schema: null,
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
    model: 'gpt-5.2',
    max_tokens: 16000,
    temperature: 1.0,
    max_iterations: 2,
    description: 'Generates SMS summaries of training plans',
    is_active: true,
    tool_ids: [],
    user_prompt_template: 'Generate a brief training plan summary:\n\n{{input}}\n\nKeep it under 160 characters, motivating, and focused on the week ahead.',
    examples: null,
    eval_rubric: null,
    output_schema: null,
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
    model: 'gpt-5.2',
    max_tokens: 16000,
    temperature: 1.0,
    max_iterations: 2,
    description: 'Generates "plan ready" notification messages',
    is_active: true,
    tool_ids: [],
    user_prompt_template: 'Generate a "plan ready" notification:\n\n{{input}}\n\nKeep it under 160 characters, enthusiastic, and motivating.',
    examples: null,
    eval_rubric: null,
    output_schema: null,
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
    model: 'gpt-5.2',
    max_tokens: 16000,
    temperature: 0.5,
    max_iterations: 3,
    description: 'Parses raw text into structured training programs',
    is_active: true,
    tool_ids: [],
    user_prompt_template: 'Parse this training program from raw text:\n\n{{input}}\n\nExtract structured workout data and format as a standard program.',
    examples: null,
    eval_rubric: null,
    output_schema: null,
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
    model: 'gpt-5.2',
    max_tokens: 16000,
    temperature: 0.5,
    max_iterations: 2,
    description: 'Extracts metadata from blog content',
    is_active: true,
    tool_ids: [],
    user_prompt_template: 'Extract metadata from this blog content:\n\n{{input}}\n\nReturn JSON with title, summary, category, tags, readingTime, keyTopics.',
    examples: null,
    eval_rubric: null,
    output_schema: null,
  },
  {
    agent_id: 'workout:details',
    system_prompt: `You are a structured workout generator. Your role is to extract workout information from a week's training dossier and format it as simple, clean JSON for UI display.

## Your Goal
Generate JSON that can be directly displayed in a mobile app or web UI. This is NOT for LLM consumption—it's for end users to view their workout.

## Key Principles
1. SIMPLICITY IS KING - Complexity degrades LLM accuracy. Keep output simple and clean.
2. UI-FOCUSED - Not for LLM consumption, for human display
3. CONCISE - Names, descriptions, key metrics only
4. ACCURATE - Extract exactly what the user is supposed to do

## Output Format
Return clean JSON matching this schema:
{
  "date": "2026-02-16",
  "dayOfWeek": "Monday",
  "focus": "Upper Strength",
  "title": "Upper Strength",
  "description": "Week 3 — push compounds to top of RPE range, add reps to accessories.",
  "estimatedDuration": 55,
  "location": "Home gym",
  "exercises": [
    {
      "name": "Barbell Bench Press",
      "description": "Main compound lift - chest, shoulders, triceps",
      "type": "strength",
      "sets": "4",
      "reps": "5",
      "weight": "155 lb",
      "notes": "Up 5 lb from last week. Last set ground to a 4.",
      "rest": "3 minutes"
    }
  ]
}

## Exercise Types
- warmup - Warm-up movements
- strength - Main compound lifts
- accessory - Accessory exercises
- cardio - Cardio movements
- mobility - Mobility work
- finisher - Finisher movements

## What to Include
For each exercise: name, description, type, sets, reps, weight (optional), notes (optional), rest (optional)

## What to Skip
- Detailed set-by-set logs (too much detail for UI)
- Warm-up sets with just weights
- Cooldown sections
- Empty or placeholder values

Never make up information. If something isn't in the dossier, don't include it.`,
    model: 'gpt-5.2',
    max_tokens: 16000,
    temperature: 1.0,
    max_iterations: 3,
    description: 'Generates a structured workout with sets, reps, weight, RPE, and tempo for each exercise',
    is_active: true,
    tool_ids: [],
    user_prompt_template: 'Generate the structured workout representation for this day:\n\n{{input}}\n\nUse the week dossier provided in context to extract the workout details for this specific day and convert it to the JSON schema format.',
    examples: null,
    eval_rubric: 'Evaluate the JSON output for completeness and correctness.',
    output_schema: {
      type: 'object',
      required: ['date', 'dayOfWeek', 'focus', 'title', 'exercises'],
      properties: {
        date: { type: 'string', description: 'ISO date (YYYY-MM-DD)' },
        dayOfWeek: { type: 'string', description: 'Day of the week' },
        focus: { type: 'string', description: 'Session focus (e.g., Upper Strength)' },
        title: { type: 'string', description: 'Session title' },
        description: { type: 'string', description: 'Brief session description with week context' },
        estimatedDuration: { type: 'number', description: 'Estimated duration in minutes' },
        location: { type: 'string', description: 'Workout location' },
        exercises: {
          type: 'array',
          items: {
            type: 'object',
            required: ['name', 'type'],
            properties: {
              name: { type: 'string', description: 'Exercise name' },
              description: { type: 'string', description: 'Brief description of the exercise' },
              type: {
                type: 'string',
                enum: ['warmup', 'strength', 'accessory', 'cardio', 'mobility', 'finisher'],
                description: 'Exercise category',
              },
              sets: { type: 'string', description: 'Number of sets' },
              reps: { type: 'string', description: 'Rep scheme (e.g., "8-12", "5", "AMRAP")' },
              weight: { type: 'string', description: 'Weight with unit (e.g., "155 lb")' },
              notes: { type: 'string', description: 'Coaching cues or notes' },
              rest: { type: 'string', description: 'Rest period (e.g., "3 minutes")' },
            },
          },
        },
        conditioning: {
          type: 'array',
          description: 'Optional conditioning/cardio finishers',
          items: {
            type: 'object',
            required: ['name'],
            properties: {
              name: { type: 'string', description: 'Conditioning activity name' },
              duration: { type: 'string', description: 'Duration (e.g., "5-10 min")' },
              intensity: { type: 'string', description: 'Intensity level (e.g., "easy", "moderate")' },
              notes: { type: 'string', description: 'Additional notes' },
            },
          },
        },
      },
      additionalProperties: false,
    },
  },
  {
    agent_id: 'plan:modify',
    system_prompt: `You are a fitness plan modification agent. Your role is to modify a fitness plan at the mesocycle level based on user feedback or changes in circumstances.

## Your Role
1. Analyze the user's change request
2. Determine what modifications are needed
3. Update the plan while maintaining periodization integrity
4. Log all changes with clear rationale

## Types of Modifications

### Phase Extension
- User is making great progress
- Wants to extend current phase before moving to next
- Consider: progress to date, recovery quality, user goals

### Goal Change
- User has new goals (e.g., competition, weight change)
- Needs program restructure
- Consider: timeline, current position in program, feasibility

### Volume/Intensity Adjustment
- User feeling fatigued or wanting more volume
- Needs modification while maintaining progression
- Consider: recovery, injury history, timeline

### Constraint Change
- User's circumstances changed (gym closure, schedule change)
- Needs adaptation to constraints
- Consider: available equipment, time, location

## Input Format
You receive:
- planDossier: Current fitness plan in markdown
- changeRequest: What the user wants to change

## Output Format
Provide the modified plan in markdown format. Include:
1. Revision summary at top
2. Mesocycle table showing updated timeline
3. Changes clearly marked with rationale
4. LOG section documenting:
   - Date
   - User's reason
   - Your decision
   - Impact on program

## Key Principles
- Maintain periodization logic (progressive overload)
- Don't break existing progressions
- Consider the big picture (don't just say yes to everything)
- Log decisions clearly for future reference`,
    model: 'gpt-5.2',
    max_tokens: 16000,
    temperature: 1.0,
    max_iterations: 5,
    description: 'Modifies the training program based on user feedback or changes in circumstances',
    is_active: true,
    tool_ids: [],
    user_prompt_template: 'Modify the fitness plan based on the following change request: {changeRequest}. Use the current plan provided in context to understand the mesocycle structure and apply the requested changes while maintaining periodization integrity.',
    examples: null,
    eval_rubric: null,
    output_schema: null,
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
    model: 'gpt-5.2',
    max_tokens: 16000,
    temperature: 1.0,
    max_iterations: 3,
    description: 'Formats a week of training as clean, readable markdown for the user dossier',
    is_active: true,
    tool_ids: [],
    user_prompt_template: `Week: {{weekNumber}}
Focus: {{weekFocus}}
Phase: {{phase}}

{{#each days as day}}
## {{day.name}}
Focus: {{day.focus}}
{{/each}}`,
    examples: null,
    eval_rubric: null,
    output_schema: null,
  },
  {
    agent_id: 'chat:generate',
    system_prompt: `You are a helpful fitness coaching assistant. Your role is to:

1. Answer questions about fitness, training, nutrition, and recovery
2. Provide motivation and accountability
3. Help users understand their training programs
4. Offer modifications and alternatives when needed
5. Be encouraging and supportive

Always prioritize:
- Safety and proper form
- User's individual goals and constraints
- Evidence-based information
- Clear, actionable advice`,
    model: 'gpt-5.2',
    max_tokens: 16000,
    temperature: 0.8,
    max_iterations: 1,
    description: 'Main chat agent for conversational responses',
    is_active: true,
    tool_ids: [],
    user_prompt_template: '{{message}}',
    examples: null,
    eval_rubric: null,
    output_schema: null,
  },
];

export async function seedAgents(): Promise<void> {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || process.env.SANDBOX_DATABASE_URL,
  });

  try {
    console.log('Seeding agent definitions...');

    for (const agent of DEFAULT_AGENTS) {
      // Skip if this agent already has a version — seed only provides initial data
      const existing = await pool.query(
        `SELECT 1 FROM agent_definitions WHERE agent_id = $1 LIMIT 1`,
        [agent.agent_id]
      );
      if (existing.rows.length > 0) {
        console.log(`  ⏭ ${agent.description} (${agent.agent_id}) — already exists`);
        continue;
      }

      await pool.query(
        `
        INSERT INTO agent_definitions (
          agent_id, system_prompt, model, max_tokens, temperature,
          max_iterations, description, is_active, tool_ids,
          user_prompt_template, examples, eval_rubric, output_schema
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
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
