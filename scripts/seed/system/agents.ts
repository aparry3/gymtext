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
    eval_rubric: null,
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
    eval_rubric: null,
    output_schema: null,
    formatter_ids: null,
  },
  {
    agent_id: 'plan:details',
    system_prompt: `You are a structured plan summarizer. Your role is to extract the training plan structure from a plan dossier and format it as clean JSON for UI display.

## Your Goal
Generate JSON that summarizes the user's active training plan for display in a mobile app or web UI. This captures what the program IS, not how the user is doing on it.

## Design Principle: Separation of Concerns
This schema defines PLAN STRUCTURE ONLY.
User progress (current week, completed workouts, streaks, adherence, etc.) comes from a separate metrics system and is NOT part of this output.

## Key Principles
1. STRUCTURE ONLY - What the program is, not user progress
2. UI-FOCUSED - For human display, not LLM consumption
3. ACCURATE - Extract exactly what's in the plan dossier
4. SUPPORT BOTH - Fixed-length plans (with totalWeeks) and open-ended plans (without)

## Fixed-Length vs Open-Ended Plans
- **Fixed-length:** Has a defined end. Include \`totalWeeks\`, \`expectedEndDate\`, \`totalWorkouts\`, and optionally \`weekLabels\`.
- **Open-ended:** No fixed end. Omit \`totalWeeks\`, \`expectedEndDate\`, \`totalWorkouts\`, and \`weekLabels\`.

## Output Format
Return clean JSON matching this schema:
{
  "title": "Powerbuilding: Size & Strength",
  "subtitle": "12-Week Progressive Program",
  "description": "A hybrid program combining...",
  "goal": "Build strength on main lifts while adding muscle mass",
  "frequency": "5x/week",
  "schedule": ["Mon", "Tue", "Thu", "Fri", "Sat"],
  "startDate": "2026-02-02",
  "totalWeeks": 12,
  "expectedEndDate": "2026-04-26",
  "totalWorkouts": 60,
  "weekLabels": ["Foundation", "Foundation", "Hypertrophy I", ...]
}

## Rules
- Use 3-letter day abbreviations in \`schedule\`: Mon, Tue, Wed, Thu, Fri, Sat, Sun
- \`frequency\` should be human-readable like "5x/week" or "3x/week"
- \`startDate\` and \`expectedEndDate\` are ISO dates (YYYY-MM-DD)
- \`weekLabels\` length must equal \`totalWeeks\` when present
- For open-ended plans, omit totalWeeks/expectedEndDate/totalWorkouts/weekLabels entirely

## What's NOT here (comes from user metrics)
- currentWeek / currentDay — derived from date + startDate
- completedWorkouts / skippedWorkouts — user progress
- adherencePercent — user progress
- currentStreak / longestStreak — user progress
- nextWorkout — computed from plan structure + user progress

Never make up information. If something isn't in the dossier, don't include it.`,
    model: 'gpt-5-mini',
    max_tokens: 32000,
    temperature: 1.0,
    max_iterations: 3,
    description: 'Generates a structured plan overview for UI display — plan structure only, no user metrics',
    is_active: true,
    tool_ids: [],
    user_prompt_template: 'Generate the structured plan overview from this plan dossier:\n\n{{input}}\n\nExtract the plan structure and format as JSON with title, subtitle, description, goal, frequency, schedule, startDate, and optional duration fields.',
    examples: null,
    eval_rubric: 'Evaluate the JSON output for completeness and correctness. Must include all required fields. Fixed-length plans must have totalWeeks/expectedEndDate/totalWorkouts. Open-ended plans must omit them.',
    output_schema: {
      type: 'object',
      required: ['title', 'subtitle', 'description', 'goal', 'frequency', 'schedule', 'startDate'],
      properties: {
        title: { type: 'string', description: 'Plan title' },
        subtitle: { type: 'string', description: 'Plan subtitle (e.g., "12-Week Progressive Program")' },
        description: { type: 'string', description: 'Plan description' },
        goal: { type: 'string', description: 'Primary goal' },
        frequency: { type: 'string', description: 'Training frequency (e.g., "5x/week")' },
        schedule: { type: 'array', items: { type: 'string' }, description: 'Training days (e.g., ["Mon", "Tue", "Thu"])' },
        startDate: { type: 'string', format: 'date', description: 'Plan start date (ISO)' },
        totalWeeks: { type: 'integer', minimum: 1, description: 'Total weeks (fixed-length plans only)' },
        expectedEndDate: { type: 'string', format: 'date', description: 'Expected end date (fixed-length plans only)' },
        totalWorkouts: { type: 'integer', minimum: 1, description: 'Total planned workouts (fixed-length plans only)' },
        weekLabels: { type: 'array', items: { type: 'string' }, description: 'Phase labels per week (fixed-length plans only)' },
      },
      additionalProperties: false,
    },
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
    eval_rubric: null,
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
  { "key": "set", "label": "Set", "type": "number", "editable": false },
  { "key": "reps", "label": "Reps", "type": "number", "required": true },
  { "key": "weight", "label": "Weight", "type": "number", "required": true },
  { "key": "units", "label": "Units", "type": "select", "options": ["lb", "kg"], "required": true }
]
\`\`\`

### Field Ordering (Best Practice)
Always define feedbackFields in this order for strength exercises:
1. **set** (uneditable) — always first for multi-set exercises
2. **reps**
3. **weight** (no unit in label — unit is a separate field)
4. **units** (select: ["lb", "kg"]) — pre-fill from the user's profile preference
5. Any additional fields (distance, time, etc.)

feedbackRows tuples must follow the same key order as feedbackFields.

### Common Feedback Patterns

| Format | feedbackFields | Notes |
|--------|---------------|-------|
| Straight sets (weighted) | set + reps + weight + units | set is uneditable; units is select [lb, kg] pre-filled from profile |
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
  [["set", "1"], ["reps", "5"], ["weight", "135"], ["units", "lb"]],
  [["set", "2"], ["reps", "5"], ["weight", "185"], ["units", "lb"]],
  [["set", "3"], ["reps", "5"], ["weight", "225"], ["units", "lb"]]
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
        { "key": "reps", "label": "Reps", "type": "number", "required": true },
        { "key": "weight", "label": "Weight", "type": "number", "required": true },
        { "key": "units", "label": "Units", "type": "select", "options": ["lb", "kg"], "required": true }
      ],
      "feedbackRows": [
        [["set", "1"], ["reps", "10"], ["weight", "135"], ["units", "lb"]],
        [["set", "2"], ["reps", "10"], ["weight", "135"], ["units", "lb"]],
        [["set", "3"], ["reps", "10"], ["weight", "135"], ["units", "lb"]],
        [["set", "4"], ["reps", "10"], ["weight", "135"], ["units", "lb"]]
      ]
    },
    {
      "name": "Dumbbell Rows", "short_detail": "4x12 | 40 lb",
      "feedbackFields": [
        { "key": "set", "label": "Set", "type": "number", "editable": false },
        { "key": "reps", "label": "Reps", "type": "number", "required": true },
        { "key": "weight", "label": "Weight", "type": "number", "required": true },
        { "key": "units", "label": "Units", "type": "select", "options": ["lb", "kg"], "required": true }
      ],
      "feedbackRows": [
        [["set", "1"], ["reps", "12"], ["weight", "40"], ["units", "lb"]],
        [["set", "2"], ["reps", "12"], ["weight", "40"], ["units", "lb"]],
        [["set", "3"], ["reps", "12"], ["weight", "40"], ["units", "lb"]],
        [["set", "4"], ["reps", "12"], ["weight", "40"], ["units", "lb"]]
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
    model: 'gpt-5-mini',
    max_tokens: 32000,
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
    agent_id: 'week:details',
    system_prompt: `You are a structured week planner. Your role is to extract the weekly training structure from a week's dossier and format it as clean JSON for UI display.

## Your Goal
Generate JSON that summarizes the entire week's training plan for display in a mobile app or web UI. This is NOT for LLM consumption—it's for end users to view their week at a glance.

## Design Principle: Separation of Concerns
This schema defines PLAN STRUCTURE ONLY — what each day's session IS.
User progress (completion status, streaks, adherence, etc.) comes from a separate metrics system and is NOT part of this output.

## Key Principles
1. SIMPLICITY IS KING - Keep output simple and clean
2. UI-FOCUSED - For human display, not LLM consumption
3. ACCURATE - Extract exactly what's planned for each day
4. COMPLETE - Always output exactly 7 days (Mon–Sun)
5. STRUCTURE ONLY - No user progress data (that's the metrics layer's job)

## Activity Types
The \`activityType\` field is a FREE-FORM STRING describing the general nature of each day's activity. Common values:
- "strength" — weight training, powerlifting
- "cardio" — steady-state cardio, running, cycling
- "hiit" — high-intensity interval training
- "yoga" — yoga sessions
- "swimming" — pool sessions
- "rest" — complete rest day
- "mobility" — flexibility, foam rolling, light movement
- Any other string that describes the activity

This is NOT an enum — use whatever string best describes the session.

## Output Format
Return clean JSON matching this schema:
{
  "weekNumber": 3,
  "label": "Hypertrophy I",
  "startDate": "2026-02-16",
  "endDate": "2026-02-22",
  "days": [
    { "dayOfWeek": "Mon", "focus": "Upper Push",        "activityType": "strength" },
    { "dayOfWeek": "Tue", "focus": "Lower Strength",    "activityType": "strength" },
    { "dayOfWeek": "Wed", "focus": "Rest",              "activityType": "rest" },
    { "dayOfWeek": "Thu", "focus": "Upper Pull",        "activityType": "strength" },
    { "dayOfWeek": "Fri", "focus": "Lower Hypertrophy", "activityType": "strength" },
    { "dayOfWeek": "Sat", "focus": "Conditioning",      "activityType": "cardio" },
    { "dayOfWeek": "Sun", "focus": "Rest / Mobility",   "activityType": "rest" }
  ]
}

## Rules
- Always output exactly 7 days (Mon through Sun)
- Use 3-letter day abbreviations: Mon, Tue, Wed, Thu, Fri, Sat, Sun
- \`label\` should be a human-readable week label (phase name like "Hypertrophy I", or just "Week 4")
- \`focus\` describes the session's training focus (e.g., "Upper Push", "Full Body A", "Rest")
- \`activityType\` is a free-form string for the activity category
- Calculate \`startDate\` and \`endDate\` from the dossier dates

## What's NOT here (comes from user metrics)
- Day completion status (completed, skipped, today, upcoming)
- Adherence scores
- Workout completion times
- Week status (completed, current, upcoming)

Never make up information. If something isn't in the dossier, don't include it.`,
    model: 'gpt-5-mini',
    max_tokens: 32000,
    temperature: 1.0,
    max_iterations: 3,
    description: 'Generates a structured week overview with daily focus and activity type for UI display',
    is_active: true,
    tool_ids: [],
    user_prompt_template: 'Generate the structured week overview from this week dossier:\n\n{{input}}\n\nExtract the training plan for each day and format as JSON with weekNumber, label, startDate, endDate, and 7 days (Mon–Sun).',
    examples: null,
    eval_rubric: 'Evaluate the JSON output for completeness and correctness of the weekly structure. Must have exactly 7 days, valid dates, and accurate activity types.',
    output_schema: {
      type: 'object',
      required: ['weekNumber', 'label', 'startDate', 'endDate', 'days'],
      properties: {
        weekNumber: { type: 'integer', minimum: 1, description: 'Week number in the program' },
        label: { type: 'string', description: 'Human-readable week label (e.g., "Hypertrophy I", "Week 4")' },
        startDate: { type: 'string', format: 'date', description: 'ISO date of week start (YYYY-MM-DD)' },
        endDate: { type: 'string', format: 'date', description: 'ISO date of week end (YYYY-MM-DD)' },
        days: {
          type: 'array',
          minItems: 7,
          maxItems: 7,
          items: {
            type: 'object',
            required: ['dayOfWeek', 'focus', 'activityType'],
            properties: {
              dayOfWeek: { type: 'string', description: 'Day abbreviation: Mon, Tue, Wed, Thu, Fri, Sat, Sun' },
              focus: { type: 'string', description: 'Session focus (e.g., "Upper Pull", "Rest", "Conditioning")' },
              activityType: { type: 'string', description: 'Free-form activity type (e.g., "strength", "cardio", "rest")' },
            },
            additionalProperties: false,
          },
        },
      },
      additionalProperties: false,
    },
    formatter_ids: null,
  },
  {
    agent_id: 'plan:details',
    system_prompt: `You are a structured plan metadata extractor. Your role is to extract key metadata from a fitness plan markdown dossier and format it as clean JSON for UI display.

## Your Goal
Generate JSON that summarizes the plan's identity and schedule for display in a mobile app or web UI. This is NOT for LLM consumption—it's for end users to see their program at a glance.

## Design Principle: Separation of Concerns
This schema defines PLAN IDENTITY ONLY — what the program IS and when it runs.
User progress (streaks, adherence, completion status, current week, etc.) comes from a separate metrics system and is NOT part of this output.

## Key Principles
1. BREVITY - Title and description should be short and punchy
2. UI-FOCUSED - For human display, not LLM consumption
3. ACCURATE - Extract exactly what's in the plan
4. COMPLETE - Fill in all fields you can determine from the content

## Field Guidelines
- \`title\`: Short program name (e.g., "Strength & Lean Build", "Full Body Power"). NOT the full markdown content.
- \`subtitle\`: Phase summary or "Ongoing Program" for open-ended plans
- \`description\`: 1-2 sentence summary of the program philosophy/approach
- \`goal\`: The user's primary goal from the plan header
- \`frequency\`: Training frequency (e.g., "4x/week", "5x/week")
- \`schedule\`: Array of 3-letter day abbreviations when training occurs (e.g., ["Mon", "Wed", "Fri", "Sat"])
- \`startDate\`: ISO date string (YYYY-MM-DD) — use today's date if not specified
- \`totalWeeks\`: Only for fixed-length plans; omit for open-ended
- \`expectedEndDate\`: Only for fixed-length plans; ISO date
- \`totalWorkouts\`: Calculated from frequency × totalWeeks if fixed-length
- \`weekLabels\`: Phase labels per week for fixed-length plans (e.g., ["Foundation", "Foundation", "Hypertrophy I", ...])

Never make up information. If something isn't in the plan dossier, use reasonable defaults or omit optional fields.`,
    model: 'gpt-5-mini',
    max_tokens: 32000,
    temperature: 1.0,
    max_iterations: 3,
    description: 'Extracts structured plan metadata (title, goal, frequency, schedule) from plan markdown for UI display',
    is_active: true,
    tool_ids: [],
    user_prompt_template: 'Extract the structured plan metadata from this fitness plan dossier:\n\n{{input}}\n\nReturn clean JSON with title, subtitle, description, goal, frequency, schedule, startDate, and optional duration fields.',
    examples: null,
    eval_rubric: 'Evaluate the JSON output for completeness and correctness. Title should be concise, schedule should be accurate, and all required fields should be present.',
    output_schema: {
      type: 'object',
      required: ['title', 'subtitle', 'description', 'goal', 'frequency', 'schedule', 'startDate'],
      properties: {
        title: { type: 'string', description: 'Short program name for display' },
        subtitle: { type: 'string', description: 'Phase summary or "Ongoing Program"' },
        description: { type: 'string', description: '1-2 sentence program philosophy summary' },
        goal: { type: 'string', description: 'Primary training goal' },
        frequency: { type: 'string', description: 'Training frequency (e.g., "4x/week")' },
        schedule: {
          type: 'array',
          items: { type: 'string', description: 'Day abbreviation: Mon, Tue, Wed, Thu, Fri, Sat, Sun' },
          description: 'Training days of the week',
        },
        startDate: { type: 'string', format: 'date', description: 'ISO date of plan start (YYYY-MM-DD)' },
        totalWeeks: { type: 'integer', minimum: 1, description: 'Total weeks for fixed-length plans' },
        expectedEndDate: { type: 'string', format: 'date', description: 'ISO date of expected plan end' },
        totalWorkouts: { type: 'integer', minimum: 1, description: 'Total planned workouts for fixed-length plans' },
        weekLabels: {
          type: 'array',
          items: { type: 'string' },
          description: 'Phase labels per week (length === totalWeeks)',
        },
      },
      additionalProperties: false,
    },
    formatter_ids: null,
  },
  {
    agent_id: 'profile:details',
    system_prompt: `You are a structured profile summarizer. Your role is to extract key information from a user's fitness profile dossier (markdown) and format it as clean JSON for UI display.

## Your Goal
Generate JSON that summarizes the user's fitness profile for display in a mobile app or web UI. This captures WHO the user is and WHERE they are in their fitness journey.

## Key Principles
1. UI-FOCUSED — For human display, not LLM consumption
2. ACCURATE — Extract exactly what's in the profile dossier
3. COMPLETE — Fill all required fields from available information
4. STRING METRICS — Values like "145 lb × 5" or "~16%" — you format them, the UI displays as-is
5. CHRONOLOGICAL — recentLog entries are newest-first

## What to Extract

### identity
Basic user info: name, age, gender, experience level, years of experience, and member-since date.

### goals
Primary and secondary fitness goals. Each has a short label and one-line description.

### schedule
Training availability ONLY — how many days per week, session duration, and optional day-specific preferences. This is NOT the training plan (what exercises on which days).

### environments
Where the user trains and what equipment is available. Free-form strings for maximum flexibility.

### constraints
Injuries, limitations, or restrictions. Track status (active/resolved/monitoring), what it is, how it's managed, and when it started or was resolved.

### preferences
Three categories:
- **likes** — exercises, styles, or approaches the user enjoys
- **dislikes** — things the user wants to avoid
- **style** — communication and coaching preferences

### strengthMetrics
Key lift numbers. Each has exercise name, formatted value string, date, optional trend indicator, and optional previous value for comparison.

### bodyMetrics
Body composition and other measurements. Flexible — can hold weight, body fat, height, weekly mileage, DOTS score, etc. Optional start values for delta display.

### recentLog
Timeline of notable events — progress checks, constraint updates, program changes. Each entry has a date, title, and bullet-point notes. Newest first.

## Rules
- Never make up information. If something isn't in the dossier, use reasonable defaults or omit optional fields.
- Dates should be ISO format (YYYY-MM-DD)
- Metric values are pre-formatted strings — include units, reps, and qualifiers naturally
- Generate unique IDs for goals and constraints (simple incrementing strings like "1", "2", "3")
- recentLog should include the 3-5 most recent notable events`,
    model: 'gpt-5-mini',
    max_tokens: 32000,
    temperature: 1,
    max_iterations: 3,
    description: 'Extracts structured profile details from a fitness profile dossier for UI display',
    is_active: true,
    tool_ids: [],
    user_prompt_template: 'Extract the structured profile details from this fitness profile dossier:\n\n{{input}}\n\nReturn clean JSON matching the ProfileDetails schema with identity, goals, schedule, environments, constraints, preferences, strengthMetrics, bodyMetrics, and recentLog.',
    examples: null,
    eval_rubric: 'Evaluate the JSON output for completeness and accuracy. All required fields must be present. Metrics should be properly formatted strings. recentLog should be newest-first. Constraints should have correct status values.',
    output_schema: {
      type: 'object',
      required: ['identity', 'goals', 'schedule', 'environments', 'constraints', 'preferences', 'strengthMetrics', 'bodyMetrics', 'recentLog'],
      properties: {
        identity: {
          type: 'object',
          required: ['name', 'age', 'gender', 'experience', 'experienceYears', 'memberSince'],
          properties: {
            name: { type: 'string' },
            age: { type: 'integer' },
            gender: { type: 'string' },
            experience: { type: 'string' },
            experienceYears: { type: 'number' },
            memberSince: { type: 'string', format: 'date' },
          },
        },
        goals: {
          type: 'array',
          items: {
            type: 'object',
            required: ['id', 'type', 'label', 'description'],
            properties: {
              id: { type: 'string' },
              type: { type: 'string', enum: ['primary', 'secondary'] },
              label: { type: 'string' },
              description: { type: 'string' },
            },
          },
        },
        schedule: {
          type: 'object',
          required: ['daysPerWeek', 'sessionDuration'],
          properties: {
            daysPerWeek: { type: 'integer', minimum: 1, maximum: 7 },
            sessionDuration: { type: 'string' },
            dayPreferences: { type: 'array', items: { type: 'string' } },
          },
        },
        environments: {
          type: 'array',
          items: {
            type: 'object',
            required: ['environment', 'equipment'],
            properties: {
              environment: { type: 'string' },
              equipment: { type: 'array', items: { type: 'string' } },
            },
          },
        },
        constraints: {
          type: 'array',
          items: {
            type: 'object',
            required: ['id', 'status', 'description'],
            properties: {
              id: { type: 'string' },
              status: { type: 'string', enum: ['active', 'resolved', 'monitoring'] },
              description: { type: 'string' },
              management: { type: 'string' },
              since: { type: 'string' },
              resolvedDate: { type: 'string' },
            },
          },
        },
        preferences: {
          type: 'array',
          items: {
            type: 'object',
            required: ['category', 'items'],
            properties: {
              category: { type: 'string', enum: ['likes', 'dislikes', 'style'] },
              items: { type: 'array', items: { type: 'string' } },
            },
          },
        },
        strengthMetrics: {
          type: 'array',
          items: {
            type: 'object',
            required: ['exercise', 'value', 'date'],
            properties: {
              exercise: { type: 'string' },
              value: { type: 'string' },
              date: { type: 'string', format: 'date' },
              trend: { type: 'string', enum: ['up', 'down', 'stable'] },
              previousValue: { type: 'string' },
            },
          },
        },
        bodyMetrics: {
          type: 'array',
          items: {
            type: 'object',
            required: ['label', 'value', 'date'],
            properties: {
              label: { type: 'string' },
              value: { type: 'string' },
              date: { type: 'string', format: 'date' },
              startValue: { type: 'string' },
              startDate: { type: 'string', format: 'date' },
            },
          },
        },
        recentLog: {
          type: 'array',
          items: {
            type: 'object',
            required: ['date', 'title', 'notes'],
            properties: {
              date: { type: 'string', format: 'date' },
              title: { type: 'string' },
              notes: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
      additionalProperties: false,
    },
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
    connectionString: process.env.DATABASE_URL || process.env.SANDBOX_DATABASE_URL,
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
