import type { UserWithProfile } from '@/server/models/userModel';
import type { AgentDeps } from '@/server/agents/base';

/**
 * Input for welcome message agent
 */
export interface WelcomeMessageInput {
  user: UserWithProfile;
}

/**
 * Output from welcome message agent
 */
export interface WelcomeMessageOutput {
  message: string;
}

/**
 * Dependencies for welcome message agent
 * Currently extends only base AgentDeps (config), but allows for future extension
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface WelcomeMessageAgentDeps extends AgentDeps {
  // Future: Could add welcome message templates or personalization services
}
