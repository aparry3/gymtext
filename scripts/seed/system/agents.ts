/**
 * Seed Agents
 *
 * Seeds agent_definitions table with default agents.
 * Uses upsert - idempotent (safe to run multiple times).
 *
 * This version uses the simplified schema from the consolidated agent system migration.
 *
 * Run: pnpm seed:agents
 */

import 'dotenv/config';
import { Pool } from 'pg';

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
}

const DEFAULT_AGENTS: AgentDefinition[] = [
  {
    agent_id: 'workout:generate',
    system_prompt: `You are an expert personal trainer with 15+ years of experience. Your role is to create personalized workout programs that:

1. Match the user's available equipment and experience level
2. Progress gradually to prevent injury and build confidence
3. Are enjoyable and sustainable for the long term
4. Balance intensity with recovery
5. Include clear, actionable instructions

Always prioritize:
- Safety and proper form over intensity
- Consistency over perfection
- Progressive overload in manageable increments`,
    model: 'gpt-5-nano',
    max_tokens: 2048,
    temperature: 1.0,
    max_iterations: 3,
    description: 'Generates personalized workout programs based on user profile and preferences',
    is_active: true,
    tool_ids: ['get_user_profile', 'get_current_program', 'get_exercises', 'save_workout'],
    user_prompt_template: `{{#with user}}{{/with}}

{{> currentMicrocycle}}

Today's focus: {{workoutFocus}}`,
    examples: {
      input: { workoutFocus: 'Upper Strength', experienceLevel: 'intermediate' },
      output: { exercises: [{ name: 'Barbell Bench Press', sets: 4, reps: 8 }] }
    },
    eval_rubric: 'Evaluate the generated workout for safety, appropriateness, and completeness.',
  },
  {
    agent_id: 'microcycle:generate',
    system_prompt: `You are an expert program designer. Your role is to create comprehensive training programs that span multiple weeks (mesocycles) and guide users through progressive phases.

Consider:
1. User's goal (strength, muscle, endurance, general fitness)
2. Available equipment and time
3. Experience level and training history
4. Recovery capacity
5. Progressive overload principles

Phases should build logically:
- Foundation → Development → Peak (if applicable)
- Each week should have clear purpose
- Deload weeks should be scheduled appropriately`,
    model: 'gpt-5-nano',
    max_tokens: 4096,
    temperature: 1.0,
    max_iterations: 5,
    description: 'Creates multi-week training programs based on user goals and constraints',
    is_active: true,
    tool_ids: ['get_user_profile', 'get_exercises', 'save_program', 'get_programs'],
    user_prompt_template: '{{> userProfile}}',
    examples: null,
    eval_rubric: 'Evaluate the program for logical progression, balance, and appropriateness.',
  },
  {
    agent_id: 'workout:structured',
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
    model: 'gpt-5-nano',
    max_tokens: 2048,
    temperature: 1.0,
    max_iterations: 3,
    description: 'Generates a structured workout with sets, reps, weight, RPE, and tempo for each exercise',
    is_active: true,
    tool_ids: ['get_user_profile', 'get_current_program', 'get_exercises', 'save_workout'],
    user_prompt_template: `{{weekDossier}}

## Day
{{day}}

{{#if profile}}
## User Profile
- Name: {{profile.name}}
- Gym: {{profile.gym}}
- Equipment: {{profile.equipment}}
{{/if}}`,
    examples: null,
    eval_rubric: 'Evaluate the JSON output for completeness and correctness.',
  },
  {
    agent_id: 'week:modify',
    system_prompt: `You are a week modification agent. Your role is to modify an existing weekly training microcycle based on user feedback or changes in circumstances.

## Your Role
1. Analyze the user's modification request
2. Determine what changes are needed to the week's training
3. Apply changes while maintaining workout integrity
4. Log all modifications with clear rationale

## Types of Modifications
- Schedule swaps (e.g., Monday workout to Wednesday)
- Volume adjustments (reduce/increase sets or exercises)
- Exercise substitutions (swap due to equipment/constraint)
- Intensity changes (RPE adjustments)
- Rest day modifications

## Input Format
You receive:
- weekDossier: Full markdown of the week's training
- changeRequest: What the user wants to change
- profile (optional): User profile with constraints

## Output Format
Return the modified week in markdown format with:
1. Summary of changes at top (with strikethrough for removed items)
2. Modified workout content
3. LOG section documenting:
   - Date of modification
   - User's reason
   - Your decision
   - Impact assessment

## Key Principles
- Maintain periodization logic
- Don't break existing progressions
- Consider recovery and fatigue
- Be clear about what changed and why`,
    model: 'gpt-5-nano',
    max_tokens: 2048,
    temperature: 1.0,
    max_iterations: 3,
    description: 'Modifies an existing week in the training program based on user feedback',
    is_active: true,
    tool_ids: ['get_user_profile', 'get_current_program', 'get_week', 'save_program'],
    user_prompt_template: `{{> weekOverview}}

## User Request
{{modificationRequest}}`,
    examples: null,
    eval_rubric: null,
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
    model: 'gpt-5-nano',
    max_tokens: 4096,
    temperature: 1.0,
    max_iterations: 5,
    description: 'Modifies the training program based on user feedback or changes in circumstances',
    is_active: true,
    tool_ids: ['get_user_profile', 'get_current_program', 'get_programs', 'save_program'],
    user_prompt_template: `{{> userProfile}}

## Current Program
{{planDossier}}

## User Request
{{changeRequest}}`,
    examples: null,
    eval_rubric: null,
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
    model: 'gpt-5-nano',
    max_tokens: 2048,
    temperature: 1.0,
    max_iterations: 3,
    description: 'Formats a week of training as clean, readable markdown for the user dossier',
    is_active: true,
    tool_ids: ['get_user_profile', 'get_current_program', 'get_exercises'],
    user_prompt_template: `Week: {{weekNumber}}
Focus: {{weekFocus}}
Phase: {{phase}}

{{#each days as day}}
## {{day.name}}
Focus: {{day.focus}}
{{/each}}`,
    examples: null,
    eval_rubric: null,
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
    model: 'gpt-5-nano',
    max_tokens: 1024,
    temperature: 0.8,
    max_iterations: 1,
    description: 'Main chat agent for conversational responses',
    is_active: true,
    tool_ids: ['get_user_profile', 'get_current_program', 'get_exercises', 'get_week'],
    user_prompt_template: '{{message}}',
    examples: null,
    eval_rubric: null,
  },
];

export async function seedAgents(): Promise<void> {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || process.env.SANDBOX_DATABASE_URL,
  });

  try {
    console.log('Seeding agent definitions...');

    for (const agent of DEFAULT_AGENTS) {
      await pool.query(
        `
        INSERT INTO agent_definitions (
          agent_id, system_prompt, model, max_tokens, temperature,
          max_iterations, description, is_active, tool_ids,
          user_prompt_template, examples, eval_rubric
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
        )
        ON CONFLICT (agent_id) DO UPDATE SET
          system_prompt = EXCLUDED.system_prompt,
          model = EXCLUDED.model,
          max_tokens = EXCLUDED.max_tokens,
          temperature = EXCLUDED.temperature,
          max_iterations = EXCLUDED.max_iterations,
          description = EXCLUDED.description,
          is_active = EXCLUDED.is_active,
          tool_ids = EXCLUDED.tool_ids,
          user_prompt_template = EXCLUDED.user_prompt_template,
          examples = EXCLUDED.examples,
          eval_rubric = EXCLUDED.eval_rubric,
          created_at = CURRENT_TIMESTAMP
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
