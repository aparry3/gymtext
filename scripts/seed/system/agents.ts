/**
 * Seed Agents
 *
 * Seeds agent_definitions table with default agents.
 * Uses upsert - idempotent (safe to run multiple times).
 *
 * Run: pnpm seed:agents
 */

import 'dotenv/config';
import { Pool } from 'pg';

interface AgentDefinition {
  agent_id: string;
  name: string;
  description: string;
  system_prompt: string;
  user_prompt: string;
  max_tokens: number;
  max_iterations: number;
  max_retries: number;
  is_active: boolean;
  tool_ids: string[];
  context_types: string[];
  sub_agents: Record<string, unknown> | null;
  schema_json: Record<string, unknown> | null;
  validation_rules: Record<string, unknown> | null;
  user_prompt_template: string;
  version_id: string;
  eval_prompt: string | null;
  eval_model: string | null;
}

const DEFAULT_AGENTS: AgentDefinition[] = [
  {
    agent_id: 'workout-generator',
    name: 'Workout Generator',
    description: 'Generates personalized workout programs based on user profile and preferences',
    system_prompt: `You are an expert personal trainer with 15+ years of experience. Your role is to create personalized workout programs that:

1. Match the user's available equipment and experience level
2. Progress gradually to prevent injury and build confidence
3. Are enjoyable and sustainable for the long term
4. Balance强度 (intensity) with recovery
5. Include clear, actionable instructions

Always prioritize:
- Safety and proper form over intensity
- Consistency over perfection
- Progressive overload in manageable increments`,
    user_prompt: `Generate a workout for today based on the user's profile and current training phase.`,
    max_tokens: 2048,
    max_iterations: 3,
    max_retries: 2,
    is_active: true,
    tool_ids: ['get_user_profile', 'get_current_program', 'get_exercises', 'save_workout'],
    context_types: ['user', 'userProfile', 'dateContext', 'fitnessPlan', 'dayOverview', 'currentMicrocycle'],
    sub_agents: null,
    schema_json: {
      type: 'object',
      properties: {
        exercises: { type: 'array', items: { type: 'object' } },
        notes: { type: 'string' },
      },
      required: ['exercises'],
    },
    validation_rules: {
      minExercises: 3,
      maxExercises: 12,
    },
    user_prompt_template: `{{#with user}}{{/with}}

{{> currentMicrocycle}}

Today's focus: {{workoutFocus}}`,
    version_id: '1.0.0',
    eval_prompt: 'Evaluate the generated workout for safety, appropriateness, and completeness.',
    eval_model: 'gpt-4o',
  },
  {
    agent_id: 'message-router',
    name: 'Message Router',
    description: 'Routes incoming messages to appropriate handlers based on content analysis',
    system_prompt: `You are a message routing assistant. Your role is to analyze incoming user messages and determine:

1. What type of message is this?
2. Does it need immediate attention?
3. Which agent or handler should handle it?

Message types:
- WORKOUT_REQUEST: User wants a workout
- CHECK_IN: User is checking in / sharing status
- QUESTION: User has a question
- FEEDBACK: User is providing feedback
- EMERGENCY: User needs urgent help
- CONVERSATION: General conversation

Always err on the side of safety. If unclear, route to human review.`,
    user_prompt: 'Analyze this message and determine the appropriate routing.',
    max_tokens: 512,
    max_iterations: 1,
    max_retries: 1,
    is_active: true,
    tool_ids: [],
    context_types: ['user', 'conversation'],
    sub_agents: null,
    schema_json: {
      type: 'object',
      properties: {
        messageType: { type: 'string', enum: ['WORKOUT_REQUEST', 'CHECK_IN', 'QUESTION', 'FEEDBACK', 'EMERGENCY', 'CONVERSATION'] },
        urgency: { type: 'string', enum: ['low', 'medium', 'high'] },
        handler: { type: 'string' },
      },
      required: ['messageType', 'handler'],
    },
    validation_rules: null,
    user_prompt_template: 'Message: {{message}}',
    version_id: '1.0.0',
    eval_prompt: null,
    eval_model: null,
  },
  {
    agent_id: 'program-designer',
    name: 'Program Designer',
    description: 'Creates multi-week training programs based on user goals and constraints',
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
    user_prompt: 'Design a multi-week training program based on user profile and goals.',
    max_tokens: 4096,
    max_iterations: 5,
    max_retries: 2,
    is_active: true,
    tool_ids: ['get_user_profile', 'get_exercises', 'save_program', 'get_programs'],
    context_types: ['user', 'userProfile', 'dateContext', 'fitnessPlan'],
    sub_agents: null,
    schema_json: {
      type: 'object',
      properties: {
        weeks: { type: 'array' },
        phase: { type: 'string' },
        focus: { type: 'string' },
      },
      required: ['weeks', 'phase'],
    },
    validation_rules: {
      minWeeks: 4,
      maxWeeks: 16,
    },
    user_prompt_template: '{{> userProfile}}',
    version_id: '1.0.0',
    eval_prompt: 'Evaluate the program for logical progression, balance, and appropriateness.',
    eval_model: 'gpt-4o',
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
          agent_id, name, description, system_prompt, user_prompt,
          max_tokens, max_iterations, max_retries, is_active,
          tool_ids, context_types, sub_agents, schema_json,
          validation_rules, user_prompt_template, version_id,
          eval_prompt, eval_model
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
        )
        ON CONFLICT (agent_id) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          system_prompt = EXCLUDED.system_prompt,
          user_prompt = EXCLUDED.user_prompt,
          max_tokens = EXCLUDED.max_tokens,
          max_iterations = EXCLUDED.max_iterations,
          max_retries = EXCLUDED.max_retries,
          is_active = EXCLUDED.is_active,
          tool_ids = EXCLUDED.tool_ids,
          context_types = EXCLUDED.context_types,
          sub_agents = EXCLUDED.sub_agents,
          schema_json = EXCLUDED.schema_json,
          validation_rules = EXCLUDED.validation_rules,
          user_prompt_template = EXCLUDED.user_prompt_template,
          version_id = EXCLUDED.version_id,
          eval_prompt = EXCLUDED.eval_prompt,
          eval_model = EXCLUDED.eval_model,
          updated_at = NOW()
        `,
        [
          agent.agent_id,
          agent.name,
          agent.description,
          agent.system_prompt,
          agent.user_prompt,
          agent.max_tokens,
          agent.max_iterations,
          agent.max_retries,
          agent.is_active,
          agent.tool_ids,
          agent.context_types,
          JSON.stringify(agent.sub_agents),
          JSON.stringify(agent.schema_json),
          JSON.stringify(agent.validation_rules),
          agent.user_prompt_template,
          agent.version_id,
          agent.eval_prompt,
          agent.eval_model,
        ]
      );
      console.log(`  ✓ ${agent.name} (${agent.agent_id})`);
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
