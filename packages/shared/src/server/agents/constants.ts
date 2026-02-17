/**
 * Agent Constants
 *
 * Simplified agent IDs for the new dossier-based system.
 * TypeScript will catch typos at compile time.
 */

export const AGENTS = {
  CHAT_GENERATE: 'chat:generate',
  PROFILE_UPDATE: 'profile:update',
  PLAN_GENERATE: 'plan:generate',
  WEEK_GENERATE: 'week:generate',
  WORKOUT_FORMAT: 'workout:format',
  WORKOUT_MODIFY: 'workout:modify',
  WEEK_MODIFY: 'week:modify',
  PLAN_MODIFY: 'plan:modify',
  MESSAGING_PLAN_SUMMARY: 'messaging:plan-summary',
  MESSAGING_PLAN_READY: 'messaging:plan-ready',
  PROGRAM_PARSE: 'program:parse',
  BLOG_METADATA: 'blog:metadata',
} as const;

export type AgentId = (typeof AGENTS)[keyof typeof AGENTS];
