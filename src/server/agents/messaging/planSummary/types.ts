import type { UserWithProfile } from '@/server/models/userModel';
import type { FitnessPlan } from '@/server/models/fitnessPlan';
import type { Message } from '@/server/models/conversation';
import type { AgentDeps } from '@/server/agents/base';

/**
 * Input for plan summary agent
 */
export interface PlanSummaryInput {
  user: UserWithProfile;
  plan: FitnessPlan;
  previousMessages?: Message[];
}

/**
 * Output from plan summary agent
 */
export interface PlanSummaryOutput {
  messages: string[];
}

/**
 * Dependencies for plan summary agent
 * Currently extends only base AgentDeps (config), but allows for future extension
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PlanSummaryAgentDeps extends AgentDeps {
  // Future: Could add SMS formatting service or message templates
}
