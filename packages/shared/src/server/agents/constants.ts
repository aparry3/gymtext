/**
 * Agent Constants
 *
 * Simplified agent IDs for the new dossier-based system.
 * TypeScript will catch typos at compile time.
 */

export const AGENTS = {
  CHAT_GENERATE: 'chat:generate',
  PROFILE_UPDATE: 'profile:update',
  PROFILE_USER: 'profile:user',
  PLAN_GENERATE: 'plan:generate',
  WEEK_GENERATE: 'week:generate',
  WORKOUT_FORMAT: 'workout:format',
  WORKOUT_MODIFY: 'workout:modify',
  PLAN_MODIFY: 'plan:modify',
  MESSAGING_PLAN_SUMMARY: 'messaging:plan-summary',
  MESSAGING_PLAN_READY: 'messaging:plan-ready',
  PROGRAM_PARSE: 'program:parse',
  WEEK_FORMAT: 'week:format',

  BLOG_METADATA: 'blog:metadata',

  MIGRATE_PROFILE: 'migrate:profile',
  MIGRATE_PLAN: 'migrate:plan',
  MIGRATE_WEEK: 'migrate:week',
} as const;

export type AgentId = (typeof AGENTS)[keyof typeof AGENTS];
