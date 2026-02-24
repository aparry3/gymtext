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

## Key Principles
1. SIMPLICITY IS KING - Use simple format by default, detailed only when needed
2. UI-FOCUSED - For human display, not LLM consumption
3. ACCURATE - Extract exactly what the user is supposed to do
4. ORDERED EXERCISEGROUPS - exerciseGroups is an ordered array - each item represents one discrete unit of work to be performed in sequence

## Core Concepts

### ExerciseGroups (Ordered Array)
The \`exerciseGroups\` array is the core structure - it's **ordered** and represents the sequence users should follow:
- **Order matters:** warmup groups first, then main work, then conditioning, then cooldown
- Each exerciseGroup = one discrete block of work
- A typical workout has MULTIPLE \`main\` exerciseGroups — one per exercise or circuit

### Block Types
Each exerciseGroup has a \`block\` property indicating which phase of the workout:
- \`warmup\` - Prepare body for work (optional but recommended)
- \`main\` - Primary training work (required, can have multiple)
- \`conditioning\` - Metabolic/cardio finisher (optional)
- \`cooldown\` - Recovery and mobility (optional)

### Structure Types (how movements are organized within an exerciseGroup)
- \`straight-sets\` — ONE movement per exerciseGroup. For 3 straight-set exercises, create 3 separate exerciseGroups.
- \`circuit\` — MULTIPLE movements performed back-to-back. Covers supersets (2), tri-sets (3), giant-sets (4+).
- \`emom\` — Every minute on the minute. One or more movements.
- \`amrap\` — As many rounds as possible in a time cap.
- \`for-time\` — Complete prescribed work as fast as possible (e.g., 21-15-9).
- \`intervals\` — Work/rest intervals (running, rowing, biking).

### Movement Model (Unified)
One schema for all movements — fill in relevant fields, leave others empty:
- **Lifting:** sets, reps, weight, tempo, rpe, rest
- **Running:** distance, pace, duration, intensity
- **Bodyweight:** reps, sets
- **Timed work:** duration, maybe weight
- **Skills/drills:** reps, distance

### Simple vs Detailed Format
**Use simple format by default** (sets, reps, weight fields).
**Use setDetails array ONLY when** per-set variation is explicitly prescribed:
- Warmup progression (build to working weight)
- Ladders (varying reps: 1-2-3-4-5)
- Wave loading (varying weight: heavy-light-heavier)
- Pyramids (ascending/descending weight)
- Drop sets (reducing weight each set)
- Top set + backoff sets

When \`setDetails\` is present, it takes precedence over simple \`weight\` field.

## Output Structure

### Root Object
\`\`\`json
{
  "date": "2026-02-16",
  "dayOfWeek": "Monday",
  "focus": "Upper Strength",
  "title": "Horizontal Push",
  "description": "Week 3 — push compounds to top of RPE range.",
  "estimatedDuration": 60,
  "location": "Home gym",
  "exerciseGroups": [...]
}
\`\`\`

### ExerciseGroup Object
\`\`\`json
{
  "block": "main",
  "title": "Back Squat",
  "structure": "straight-sets",
  "notes": "Focus on depth and bar speed",
  "movements": [...],
  "rounds": 3,
  "duration": 10,
  "rest": "90 seconds"
}
\`\`\`

## Important: Ordered Array
The \`exerciseGroups\` array defines the workout sequence. Items should be arranged in workout order:
- warmup → warmup → main → main → main → main → conditioning → cooldown → cooldown

For a workout with 3 straight-set exercises (Squat, Bench, Deadlift), create 3 separate exerciseGroups in order.

## What to Skip
- Empty or placeholder values
- LLM-specific metadata
- User IDs or preferences
- Video/image URLs

Never make up information. If something isn't in the dossier, don't include it.`,
    model: 'gpt-5.2',
    max_tokens: 16000,
    temperature: 1.0,
    max_iterations: 3,
    description: 'Generates a structured workout with exerciseGroups for UI display',
    is_active: true,
    tool_ids: [],
    user_prompt_template: 'Generate the structured workout representation for this day:\n\n{{input}}\n\nUse the week dossier provided in context to extract the workout details for this specific day and convert it to the JSON schema format.',
    examples: null,
    eval_rubric: 'Evaluate the JSON output for completeness and correctness.',
    output_schema: {
      type: 'object',
      required: ['date', 'dayOfWeek', 'focus', 'title', 'exerciseGroups'],
      properties: {
        date: { type: 'string', description: 'ISO date (YYYY-MM-DD)' },
        dayOfWeek: { type: 'string', description: 'Day of the week' },
        focus: { type: 'string', description: 'Session focus (e.g., Upper Strength, Interval Run)' },
        title: { type: 'string', description: 'Session title' },
        description: { type: 'string', description: 'Brief session description with week context' },
        estimatedDuration: { type: 'number', description: 'Estimated duration in minutes' },
        location: { type: 'string', description: 'Workout location (e.g., Home gym, Track)' },
        exerciseGroups: {
          type: 'array',
          description: 'Ordered array of exercise groups — each is one discrete unit of work, arranged in workout sequence',
          items: {
            type: 'object',
            required: ['block', 'structure', 'movements'],
            properties: {
              block: {
                type: 'string',
                enum: ['warmup', 'main', 'conditioning', 'cooldown'],
                description: 'Block type: warmup, main, conditioning, or cooldown',
              },
              title: { type: 'string', description: 'ExerciseGroup title (e.g., Back Squat, Superset Block)' },
              structure: {
                type: 'string',
                enum: ['straight-sets', 'circuit', 'emom', 'amrap', 'for-time', 'intervals'],
                description: 'How movements are organized. straight-sets = 1 movement, circuit = 2+ movements',
              },
              notes: { type: 'string', description: 'Group-level coaching notes' },
              rounds: { type: 'number', description: 'Number of rounds (for circuit, intervals)' },
              duration: { type: 'number', description: 'Duration in minutes (for emom, amrap)' },
              rest: { type: 'string', description: 'Rest between rounds (e.g., 90 seconds)' },
              movements: {
                type: 'array',
                description: 'Movements in this exerciseGroup. straight-sets: exactly 1. circuit: 2+.',
                items: {
                  type: 'object',
                  required: ['name'],
                  properties: {
                    name: { type: 'string', description: 'Movement name' },
                    sets: { type: 'string', description: 'Number of sets' },
                    reps: { type: 'string', description: 'Rep scheme (e.g., 8-12, 5, AMRAP, 21-15-9)' },
                    weight: { type: 'string', description: 'Load with unit (e.g., 185 lb, 80 kg, bodyweight)' },
                    distance: { type: 'string', description: 'Distance (e.g., 400m, 1 mile)' },
                    pace: { type: 'string', description: 'Target pace (e.g., 7:00/mi)' },
                    duration: { type: 'string', description: 'Time duration (e.g., 30 seconds, 5 minutes)' },
                    intensity: { type: 'string', description: 'Intensity target (e.g., Zone 2, 85% max HR)' },
                    tempo: { type: 'string', description: 'Movement tempo (e.g., 3-0-1-0)' },
                    rpe: { type: 'string', description: 'Rate of Perceived Exertion (1-10)' },
                    rest: { type: 'string', description: 'Rest period (e.g., 3 minutes)' },
                    notes: { type: 'string', description: 'Coaching cues, form notes, progression info' },
                    setDetails: {
                      type: 'array',
                      description: 'Per-set detail — use only when sets vary in weight/reps (warmup progression, ladders, wave loading, pyramids, drop sets)',
                      items: {
                        type: 'object',
                        required: ['reps'],
                        properties: {
                          reps: { type: 'string', description: 'Reps for this set' },
                          weight: { type: 'string', description: 'Load for this set' },
                          rpe: { type: 'string', description: 'RPE for this set' },
                          type: {
                            type: 'string',
                            enum: ['warmup', 'working', 'backoff', 'drop'],
                            description: 'Set type',
                          },
                          notes: { type: 'string', description: 'Set-specific notes' },
                        },
                      },
                    },
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
