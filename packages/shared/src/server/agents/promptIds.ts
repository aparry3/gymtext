/**
 * Agent Prompt IDs
 *
 * Use these constants in createAgent calls and migrations.
 * TypeScript will catch typos at compile time.
 */

// Core agents requiring system + optional user prompts
export const PROMPT_IDS = {
  // Chat
  CHAT_GENERATE: 'chat:generate',

  // Profile
  PROFILE_FITNESS: 'profile:fitness',
  PROFILE_STRUCTURED: 'profile:structured',
  PROFILE_USER: 'profile:user',

  // Plans
  PLAN_GENERATE: 'plan:generate',
  PLAN_STRUCTURED: 'plan:structured',
  PLAN_MESSAGE: 'plan:message',
  PLAN_MODIFY: 'plan:modify',

  // Workouts
  WORKOUT_GENERATE: 'workout:generate',
  WORKOUT_STRUCTURED: 'workout:structured',
  WORKOUT_STRUCTURED_VALIDATE: 'workout:structured:validate',
  WORKOUT_MESSAGE: 'workout:message',
  WORKOUT_MODIFY: 'workout:modify',

  // Microcycles
  MICROCYCLE_GENERATE: 'microcycle:generate',
  MICROCYCLE_STRUCTURED: 'microcycle:structured',
  MICROCYCLE_MESSAGE: 'microcycle:message',
  MICROCYCLE_MODIFY: 'microcycle:modify',

  // Modifications
  MODIFICATIONS_ROUTER: 'modifications:router',

  // Programs
  PROGRAM_PARSE: 'program:parse',

  // Messaging
  MESSAGING_PLAN_SUMMARY: 'messaging:plan-summary',
  MESSAGING_PLAN_READY: 'messaging:plan-ready',

  // Blog
  BLOG_METADATA: 'blog:metadata',
} as const;

// Context prompts (role='context')
export const CONTEXT_IDS = {
  // Day format
  WORKOUT_FORMAT_TRAINING: 'workout:message:format:training',
  WORKOUT_FORMAT_ACTIVE_RECOVERY: 'workout:message:format:active_recovery',
  WORKOUT_FORMAT_REST: 'workout:message:format:rest',

  // Experience levels - Microcycles
  MICROCYCLE_EXP_BEGINNER: 'microcycle:generate:experience:beginner',
  MICROCYCLE_EXP_INTERMEDIATE: 'microcycle:generate:experience:intermediate',
  MICROCYCLE_EXP_ADVANCED: 'microcycle:generate:experience:advanced',

  // Experience levels - Workouts
  WORKOUT_EXP_BEGINNER: 'workout:generate:experience:beginner',
  WORKOUT_EXP_INTERMEDIATE: 'workout:generate:experience:intermediate',
  WORKOUT_EXP_ADVANCED: 'workout:generate:experience:advanced',
} as const;

// Prompt roles
export const PROMPT_ROLES = {
  SYSTEM: 'system',
  USER: 'user',
  CONTEXT: 'context',
} as const;

export type PromptId = (typeof PROMPT_IDS)[keyof typeof PROMPT_IDS];
export type ContextId = (typeof CONTEXT_IDS)[keyof typeof CONTEXT_IDS];
export type PromptRole = (typeof PROMPT_ROLES)[keyof typeof PROMPT_ROLES];
