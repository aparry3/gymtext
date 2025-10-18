import type { UserWithProfile } from '@/server/models/userModel';
import type { AgentDeps } from '@/server/agents/base';

/**
 * Input for summary agent
 */
export interface SummaryInput {
  user: UserWithProfile;
  messages: string;
}

/**
 * Output from summary agent
 */
export interface SummaryOutput {
  summary: string;
}

/**
 * Dependencies for summary agent
 * Currently extends only base AgentDeps (config), but allows for future extension
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SummaryAgentDeps extends AgentDeps {
  // Future: Could add message storage service or summarization strategies
}
