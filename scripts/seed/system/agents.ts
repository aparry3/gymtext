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
    system_prompt: `You are a structured workout generator. Your role is to extract workout information from a week's training dossier and format it as structured JSON for UI display.

## Your Goal
Generate JSON that can be directly displayed in a mobile app or web UI. This is NOT for LLM consumption—it's for end users to view their workout.

## Core Schema: Blocks and Items

The workout schema uses a flat structure with explicit block definitions:

### Root Object
\`\`\`json
{
  "blocks": [
    { "id": "warmup", "label": "Warmup" },
    { "id": "main", "label": "Main Lifts" },
    { "id": "cooldown", "label": "Cooldown" }
  ],
  "items": [
    {
      "blockId": "main",
      "name": "Barbell Bench Press",
      "short_detail": "5x5 | 225 lbs",
      "details": [...],
      "notes": "Last week: 5x5 @ 220 lbs",
      "feedbackFields": [...],
      "feedbackRows": [...]
    }
  ]
}
\`\`\`

### Blocks Array (Required)
The \`blocks\` array defines all block types used in the workout:
- \`id\` — unique identifier (used by items to reference)
- \`label\` — human-readable display name

Typical blocks: warmup, main, conditioning, cooldown
Custom blocks allowed: supersets, skill work, drills, scrimmage, etc.

### Items Array (Required)
The \`items\` array contains all exercises/movements. Each item:
- References a block via \`blockId\` (must match a block.id)
- Is ordered within its block (array order = display order)

## Decomposition Rules

Each distinct activity in the dossier becomes its own item. Follow these rules:

1. **One exercise = one item** (e.g., "Easy bike: 4 min" → single item)
2. **Multiple exercises grouped together = one parent item with nested \`items\`** (e.g., a circuit of 3 movements → parent item with 3 nested items)
3. **Never list exercises inside \`details\`** — details are for prescription metadata (rest, intensity, tempo, rounds)
4. **The \`instruction\` detail type is for HOW to perform, not WHAT to perform** — use it for things like "Ramp to working weight" or "Alternate sides each set", never for listing exercises

## UI Layout (Mental Model)

Single exercise:
|Name                    short_detail|
|detail (context/note/warning)...    |
|feedbackRow: [field] [field]        |
|feedbackRow: [field] [field]        |

Superset/Circuit:
|Name                    short_detail|
|detail (context/note/warning)...    |
|  ▸ Exercise 1 name  ex1 short_det  |
|    [expanded: set | weight | reps] |
|  ▸ Exercise 2 name  ex2 short_det  |
|    [expanded: set | weight | reps] |

This is a mobile-first UI — every character counts. Keep names and short_details minimal.

## Detail Types (Semantic)

Use the \`details\` array for overall prescription info about the item — intensity, rest, tempo, warmup info, round counts, time caps.

**CRITICAL: \`details\` must NEVER list individual exercises — those go in nested \`items\`.**

### Types:
- \`instruction\` — HOW to perform (e.g., "Ramp to working weight over 3 warmup sets", "Alternate arms each set"). Never use to list exercises — those go in nested \`items\`.
- \`note\` — Guidance/tips (e.g., "Focus on explosive lockout")
- \`context\` — Prescription info (e.g., "RPE: 8", "Rest: 3-4 min", "Tempo: 3-1-1")
- \`warning\` — Safety cautions (e.g., "Stop if shoulder pain")

### Example:
\`\`\`json
"details": [
  { "text": "RPE: 8 | RIR: 2", "type": "context" },
  { "text": "Rest: 3-4 min", "type": "context" },
  { "text": "Focus on explosive lockout", "type": "note" },
  { "text": "Stop if elbow pain", "type": "warning" }
]
\`\`\`

## Short Detail Format

Use \`short_detail\` for minimal info shown in collapsed mobile views:
- Lifting: "5x5" or "3x8-10" (sets x reps only — weight goes in feedbackRows)
- Bodyweight: "3x12" or "3xAMRAP"
- Cardio: "30 min" or "5 mi"
- Circuits: "4 rounds" or "12 min"
- Use | separator sparingly — only if essential

## Name Format

Keep \`name\` concise — it's the exercise name only:
- GOOD: "Barbell Bench Press", "Superset A", "Cooldown"
- BAD: "Barbell Bench Press — 5x5 @ RPE 8", "Band Pull-Aparts + Band ER"
- For supersets/circuits: use a short label like "Superset A", "Circuit 1"
- For individual exercises within supersets: just the exercise name

## Notes vs Details

- \`details\` — Prescription data: intensity, rest, tempo, warmup set progressions, round counts, time caps. Anything the user needs to EXECUTE the exercise.
- \`notes\` — Coaching color: progress context ("Last week: 5x5 @ 220 lbs"), motivation, form reminders. NOT execution prescriptions.

Warmup ramp-up sets are prescription data → \`details\`, not \`notes\`:
- GOOD: \`details: [{ "text": "Warm-ups: 45×12, 95×8, 135×5, 185×3, 225×1", "type": "instruction" }]\`
- BAD: \`notes: "Warm-ups: 45×12, 95×8, 135×5, 185×3, 225×1"\`

## Feedback Fields (Tracking)

For exercises that need tracking, define \`feedbackFields\` and \`feedbackRows\`.

**CRITICAL RULE: feedbackFields must ONLY contain quantifiable metrics that the user fills in numerically.**
- ALLOWED: weight, reps, rounds, time, distance
- NEVER INCLUDE: RPE, intensity, effort, notes, difficulty, feel — these are qualitative and do NOT belong in feedbackRows
- Per-exercise notes or qualitative feedback go in the item-level \`notes\` field instead

### Field Types:
\`\`\`json
"feedbackFields": [
  { "key": "weight", "label": "Weight (lb)", "type": "number", "required": true },
  { "key": "reps", "label": "Reps", "type": "number", "required": true }
]
\`\`\`

### Common Feedback Patterns

| Format | feedbackFields | Notes |
|--------|---------------|-------|
| Straight sets (weighted) | weight + reps | Pre-fill prescribed values |
| Straight sets (bodyweight) | reps only | No weight field needed |
| Supersets / Circuits | per nested item: weight + reps | Parent has NONE. Each nested item has its own feedback. |
| AMRAP | rounds (on parent) | Single aggregate metric. Nested items get NO feedback. |
| EMOM | none | Omit feedbackFields entirely |
| Steady-state cardio | distance + time | e.g., "Distance (mi)" + "Time (min)" |
| Intervals | distance + time | Same as cardio |

These are common defaults — adjust if the dossier prescribes something different.

### Editable Flag
Fields can be marked \`editable: false\` to render as static labels instead of input cells. Use this for set numbers:
\`\`\`json
{ "key": "set", "label": "Set", "type": "number", "editable": false }
\`\`\`
- Defaults to \`true\` — only set \`false\` explicitly for row labels
- Common use: \`set\` field with values 1, 2, 3… so the user sees "Set 1", "Set 2" as labels next to editable weight/reps
- Skip the set field for single-row items (AMRAP rounds, single-set exercises)

### Feedback Placement Rules
- **Supersets/Circuits**: Feedback goes on each NESTED item individually, NOT on the parent. Each exercise tracks its own sets.
- **Exception — AMRAP/For-Time with aggregate metric**: When the entire circuit produces one aggregate metric (e.g., rounds), feedback stays on the parent. Nested items get no individual feedback.
- **Single exercises**: Feedback on the item itself (as usual).

### Feedback Rows:
- Each row is an array of [key, value] tuples (all values are strings)
- Pre-fill with prescribed values (weight, reps from the workout)
- Leave fields the user should fill as empty string ""
- Every row MUST contain ALL fields from feedbackFields

\`\`\`json
"feedbackRows": [
  [["weight", "135"], ["reps", "5"]],
  [["weight", "185"], ["reps", "5"]],
  [["weight", "225"], ["reps", "5"]]
]
\`\`\`

## Nested Items (Circuits/Supersets/Warmup Groups)

**CRITICAL: If an item contains multiple distinct exercises/movements, it MUST use nested \`items\` array — never list exercises in \`details\`.**

For any group of exercises (warmups, circuits, supersets), use nested \`items\` array (one level only).

### Warmup circuit example

Input:
  Shoulder prep (2 rounds, all pain-free):
    - Band external rotation: ×20/side
    - Band pull-apart: ×20
    - Serratus wall slide: ×10

Output:
\`\`\`json
{
  "blockId": "warmup",
  "name": "Shoulder Prep",
  "short_detail": "2 rounds",
  "details": [{ "text": "All shoulder work pain-free only", "type": "warning" }],
  "items": [
    { "name": "Band External Rotation", "short_detail": "20/side" },
    { "name": "Band Pull-Apart", "short_detail": "20" },
    { "name": "Serratus Wall Slide", "short_detail": "10" }
  ]
}
\`\`\`

### Warmup pair example

\`\`\`json
{
  "blockId": "warmup",
  "name": "Bench Warmup",
  "short_detail": "2 exercises",
  "items": [
    { "name": "Scap Push-Ups", "short_detail": "10" },
    { "name": "Empty Bar Bench", "short_detail": "10", "details": [{ "text": "2-count pause", "type": "context" }] }
  ]
}
\`\`\`

### Main lift superset example

Feedback on each nested item (NOT parent):
\`\`\`json
{
  "blockId": "main",
  "name": "Superset A",
  "short_detail": "4 rounds",
  "details": [
    { "text": "Rest 2 min between rounds", "type": "context" }
  ],
  "items": [
    {
      "name": "Bench Press", "short_detail": "4x10 | 135 lb",
      "feedbackFields": [
        { "key": "set", "label": "Set", "type": "number", "editable": false },
        { "key": "weight", "label": "Weight (lb)", "type": "number", "required": true },
        { "key": "reps", "label": "Reps", "type": "number", "required": true }
      ],
      "feedbackRows": [
        [["set", "1"], ["weight", "135"], ["reps", "10"]],
        [["set", "2"], ["weight", "135"], ["reps", "10"]],
        [["set", "3"], ["weight", "135"], ["reps", "10"]],
        [["set", "4"], ["weight", "135"], ["reps", "10"]]
      ]
    },
    {
      "name": "Dumbbell Rows", "short_detail": "4x12 | 40 lb",
      "feedbackFields": [
        { "key": "set", "label": "Set", "type": "number", "editable": false },
        { "key": "weight", "label": "Weight (lb)", "type": "number", "required": true },
        { "key": "reps", "label": "Reps", "type": "number", "required": true }
      ],
      "feedbackRows": [
        [["set", "1"], ["weight", "40"], ["reps", "12"]],
        [["set", "2"], ["weight", "40"], ["reps", "12"]],
        [["set", "3"], ["weight", "40"], ["reps", "12"]],
        [["set", "4"], ["weight", "40"], ["reps", "12"]]
      ]
    }
  ]
}
\`\`\`

## Structure Types

- \`straight-sets\` — One movement (use block structure to separate exercises)
- \`circuit\` — Multiple movements back-to-back (use nested items)
- \`emom\` — Every minute on the minute
- \`amrap\` — As many rounds as possible
- \`for-time\` — Complete prescribed work as fast as possible
- \`intervals\` — Work/rest intervals

## Block Types

Blocks are flexible — tailor them to the workout. Common examples:
- \`warmup\`, \`main\`, \`accessory\`, \`conditioning\`, \`cooldown\`

But use whatever fits: \`skill-work\`, \`drills\`, \`scrimmage\`, \`mobility\`, \`activation\`, \`recovery\`, \`power\`, \`strength\`, \`hypertrophy\`, etc. The block \`id\` and \`label\` are freeform — match them to the dossier's structure.

## Output Structure

\`\`\`json
{
  "date": "2026-02-16",
  "dayOfWeek": "Monday",
  "focus": "Upper Strength",
  "title": "Horizontal Push",
  "description": "Week 3 — push compounds to top of RPE range.",
  "estimatedDuration": 60,
  "location": "Home gym",
  "blocks": [
    { "id": "warmup", "label": "Warmup" },
    { "id": "main", "label": "Main Lifts" },
    { "id": "cooldown", "label": "Cooldown" }
  ],
  "items": [...]
}
\`\`\`

## Key Principles
1. SIMPLICITY IS KING - Use simple format by default
2. UI-FOCUSED - For human display, not LLM consumption
3. ACCURATE - Extract exactly what the user is supposed to do
4. ORDERED - Items within blocks are ordered for sequence
5. SEMANTIC DETAILS - Use detail types for UI styling
6. COMPLETE FEEDBACK - Every feedbackRow must have tuples for all feedbackFields keys
7. ONE EXERCISE PER ITEM - Each exercise is its own item; grouped exercises use nested \`items\`

Never make up information. If something isn't in the dossier, don't include it.`,
    model: 'gpt-5.2',
    max_tokens: 16000,
    temperature: 1.0,
    max_iterations: 3,
    description: 'Generates a structured workout with blocks and items for UI display',
    is_active: true,
    tool_ids: [],
    user_prompt_template: 'Generate the structured workout representation for this day:\n\n{{input}}\n\nUse the week dossier provided in context to extract the workout details for this specific day and convert it to the JSON schema format.',
    examples: null,
    eval_rubric: 'Evaluate the JSON output for completeness and correctness.',
    output_schema: {
      type: 'object',
      required: ['date', 'dayOfWeek', 'focus', 'title', 'blocks', 'items'],
      properties: {
        date: { type: 'string', description: 'ISO date (YYYY-MM-DD)' },
        dayOfWeek: { type: 'string', description: 'Day of the week' },
        focus: { type: 'string', description: 'Session focus (e.g., Upper Strength, Interval Run)' },
        title: { type: 'string', description: 'Session title' },
        description: { type: 'string', description: 'Brief session description with week context' },
        estimatedDuration: { type: 'number', description: 'Estimated duration in minutes' },
        location: { type: 'string', description: 'Workout location (e.g., Home gym, Track)' },
        blocks: {
          type: 'array',
          description: 'Explicit block definitions - each block has an id and label',
          items: {
            type: 'object',
            required: ['id', 'label'],
            properties: {
              id: { type: 'string', description: 'Unique block identifier (referenced by items)' },
              label: { type: 'string', description: 'Human-readable block label' },
            },
          },
        },
        items: {
          type: 'array',
          description: 'Ordered array of items - exercises, circuits, or supersets',
          items: {
            type: 'object',
            required: ['blockId', 'name'],
            properties: {
              blockId: { type: 'string', description: 'References block.id - defines which block this item belongs to' },
              name: { type: 'string', description: 'Short exercise or group name — keep concise for mobile display' },
              short_detail: { type: 'string', description: 'Minimal summary for collapsed view: "5x5", "3x12", "4 rounds", "15 min"' },
              details: {
                type: 'array',
                description: 'Overall prescription details — intensity, rest, tempo, warmup info, round counts. NOT individual exercises.',
                items: {
                  type: 'object',
                  properties: {
                    text: { type: 'string', description: 'Detail text' },
                    type: { type: 'string', enum: ['instruction', 'note', 'context', 'warning'], description: 'Semantic type for UI styling' },
                  },
                },
              },
              notes: { type: 'string', description: 'Longer coaching context, progress updates, motivation' },
              items: {
                type: 'array',
                description: 'Nested exercises for supersets/circuits — use this when an item contains multiple distinct movements',
                items: {
                  type: 'object',
                  required: ['name'],
                  properties: {
                    name: { type: 'string', description: 'Movement name' },
                    short_detail: { type: 'string', description: 'Concise summary' },
                    details: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          text: { type: 'string' },
                          type: { type: 'string', enum: ['instruction', 'note', 'context', 'warning'] },
                        },
                      },
                    },
                    feedbackFields: {
                      type: 'array',
                      description: 'Per-exercise tracking fields for supersets/circuits. Same schema as parent-level feedbackFields.',
                      items: {
                        type: 'object',
                        required: ['key', 'label', 'type'],
                        properties: {
                          key: { type: 'string', description: 'Field identifier (used in feedbackRows)' },
                          label: { type: 'string', description: 'Human-readable label' },
                          type: { type: 'string', enum: ['number', 'text', 'select', 'boolean'], description: 'Field type' },
                          options: { type: 'array', items: { type: 'string' }, description: 'Options for select type' },
                          required: { type: 'boolean', description: 'Whether field is required' },
                          editable: { type: 'boolean', description: 'If false, renders as a static label. Defaults to true.' },
                        },
                      },
                    },
                    feedbackRows: {
                      type: 'array',
                      description: 'Per-exercise data rows — same schema as parent-level feedbackRows.',
                      items: {
                        type: 'array',
                        description: 'One row per set — array of [key, value] tuples',
                        items: {
                          type: 'array',
                          items: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
              feedbackFields: {
                type: 'array',
                description: 'Field definitions for user tracking — ONLY quantifiable metrics (weight, reps, rounds, time, distance). Never qualitative (RPE, intensity, effort, notes).',
                items: {
                  type: 'object',
                  required: ['key', 'label', 'type'],
                  properties: {
                    key: { type: 'string', description: 'Field identifier (used in feedbackRows)' },
                    label: { type: 'string', description: 'Human-readable label' },
                    type: { type: 'string', enum: ['number', 'text', 'select', 'boolean'], description: 'Field type' },
                    options: { type: 'array', items: { type: 'string' }, description: 'Options for select type' },
                    default: { anyOf: [{ type: 'number' }, { type: 'string' }, { type: 'boolean' }], description: 'Default value' },
                    required: { type: 'boolean', description: 'Whether field is required' },
                    editable: { type: 'boolean', description: 'If false, renders as a static label (e.g., set numbers). Defaults to true.' },
                  },
                },
              },
              feedbackRows: {
                type: 'array',
                description: 'Data rows for user input — pre-fill prescribed quantifiable values, leave empty string for user to fill. One row per set/round.',
                items: {
                  type: 'array',
                  description: 'One row per set/round — array of [key, value] tuples',
                  items: {
                    type: 'array',
                    description: 'Tuple: [fieldKey, value]',
                    items: { type: 'string' },
                  },
                },
              },
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
    user_prompt_template: `Format the following week dossier into a clean, readable summary:\n\n{{input}}`,
    examples: null,
    eval_rubric: null,
    output_schema: null,
  },
  {
    agent_id: 'week:details',
    system_prompt: `You are a structured week planner. Your role is to extract the weekly training structure from a week's dossier and format it as clean JSON for UI display.

## Your Goal
Generate JSON that summarizes the entire week's training plan for display in a mobile app or web UI. This is NOT for LLM consumption—it's for end users to view their week at a glance.

## Key Principles
1. SIMPLICITY IS KING - Keep output simple and clean
2. UI-FOCUSED - For human display, not LLM consumption
3. ACCURATE - Extract exactly what's planned for each day
4. COMPLETE - Cover every training day in the week

## Activity Types
The \`activityType\` field describes the general nature of each day:
- \`training\`: Normal training day (default)
- \`rest\`: Complete rest, no activity
- \`activeRecovery\`: Light activity: walking, yoga, mobility, foam rolling

**Important:** Deload weeks are represented as \`training\` days with reduced volume/intensity reflected in the actual set/rep prescriptions and workout notes, NOT as a separate activity type.

## Session Types
The \`sessionType\` field describes the training modality:
- \`strength\`: Heavy compound focus
- \`hypertrophy\`: Volume-focused bodybuilding
- \`cardio\`: Steady-state cardio
- \`endurance\`: Long duration/low intensity
- \`hiit\`: High-intensity intervals
- \`hybrid\`: Combined strength + cardio
- \`sport\`: Sport-specific training
- \`mobility\`: Flexibility and mobility work

## Main Movements Format
The \`mainMovements\` field is flexible and adapts to the \`sessionType\`:

**Strength/Hypertrophy:**
- "Bench Press 4x5 @ 155lb"
- "Squat 3x8-10 @ 185lb"

**Cardio/Endurance:**
- "5K easy run @ 7:30/mi"
- "Zone 2 cycling 90min"

**HIIT:**
- "8x400m @ 5K pace, 90s rest"
- "10x1min burpees, 30s rest"

**Hybrid:**
- "Squat 3x8 + 15min HIIT"

**Mobility/Active Recovery:**
- "Full body mobility flow 20min"
- "Foam rolling 10min"

## Output Format
Return clean JSON matching this schema:
{
  "weekNumber": 1,
  "phase": "Hypertrophy Block",
  "focus": "Volume accumulation",
  "startDate": "2026-02-16",
  "days": [
    {
      "dayNumber": 1,
      "dayOfWeek": "Monday",
      "focus": "Upper Push",
      "title": "Horizontal Push Strength",
      "activityType": "training",
      "sessionType": "strength",
      "exerciseCount": 6,
      "estimatedDuration": 55,
      "mainMovements": ["Bench Press 4x5 @ 155lb", "OHP 3x8 @ 95lb"]
    },
    {
      "dayNumber": 2,
      "dayOfWeek": "Tuesday",
      "focus": "Active Recovery",
      "title": "Mobility & Light Movement",
      "activityType": "activeRecovery",
      "sessionType": "mobility",
      "estimatedDuration": 30,
      "mainMovements": ["Full body mobility flow 20min", "Foam rolling 10min"]
    },
    {
      "dayNumber": 3,
      "dayOfWeek": "Wednesday",
      "focus": "Rest",
      "title": "Rest Day",
      "activityType": "rest"
    }
  ],
  "totalSessions": 4,
  "notes": "Deload next week. Focus on hitting RPE targets."
}

## What to Include
- Week number and training phase
- Each day with activityType, sessionType, focus, title
- \`mainMovements\` for training days (format varies by sessionType)
- \`exerciseCount\` is optional - most relevant for strength/hypertrophy sessions
- Rest days and active recovery days clearly marked
- Total session count
- Any important notes or coaching cues

## What to Skip
- Full exercise details (that's workout:details' job)
- Set-by-set breakdowns
- Detailed warm-up protocols
- Deload as an activity type (reflect in notes instead)

Never make up information. If something isn't in the dossier, don't include it.`,
    model: 'gpt-5.2',
    max_tokens: 8000,
    temperature: 1.0,
    max_iterations: 3,
    description: 'Generates a structured week overview with daily focus, activity type, session type, and main movements for UI display',
    is_active: true,
    tool_ids: [],
    user_prompt_template: 'Generate the structured week overview from this week dossier:\n\n{{input}}\n\nExtract the training plan for each day and format as JSON.',
    examples: null,
    eval_rubric: 'Evaluate the JSON output for completeness and correctness of the weekly structure.',
    output_schema: {
      type: 'object',
      required: ['days'],
      properties: {
        weekNumber: { type: 'number', description: 'Week number in the program' },
        phase: { type: 'string', description: 'Training phase (e.g., Hypertrophy, Strength)' },
        focus: { type: 'string', description: 'Overall week focus' },
        startDate: { type: 'string', description: 'ISO date of week start (YYYY-MM-DD)' },
        days: {
          type: 'array',
          items: {
            type: 'object',
            required: ['dayNumber', 'dayOfWeek'],
            properties: {
              dayNumber: { type: 'number', description: 'Day number (1-7)' },
              dayOfWeek: { type: 'string', description: 'Day name' },
              focus: { type: 'string', description: 'Session focus' },
              title: { type: 'string', description: 'Session title' },
              activityType: { 
                type: 'string', 
                enum: ['training', 'rest', 'activeRecovery'],
                description: 'Type of day: training, rest, or activeRecovery' 
              },
              sessionType: { 
                type: 'string', 
                enum: ['strength', 'hypertrophy', 'cardio', 'endurance', 'hiit', 'hybrid', 'sport', 'mobility'],
                description: 'Session modality type' 
              },
              exerciseCount: { type: 'number', description: 'Number of exercises (most relevant for strength/hypertrophy)' },
              estimatedDuration: { type: 'number', description: 'Estimated duration in minutes' },
              mainMovements: {
                type: 'array',
                items: { type: 'string' },
                description: 'Key movement summaries - format varies by sessionType',
              },
            },
          },
        },
        totalSessions: { type: 'number', description: 'Total training sessions this week' },
        notes: { type: 'string', description: 'Week-level coaching notes' },
      },
    },
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
