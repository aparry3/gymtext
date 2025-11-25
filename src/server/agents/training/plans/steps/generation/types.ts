import type { AgentConfig } from "@/server/agents/base";
import type { UserWithProfile } from "@/server/models/userModel";


export interface FitnessPlanConfig {
  agentConfig?: AgentConfig;
  maxRetries?: number;
}

export interface FitnessPlanInput {
  user: UserWithProfile;
}

/**
 * Context that flows through the fitness plan chain
 */
export interface FitnessPlanChainContext {
  user: UserWithProfile;
  fitnessPlan: string;
}
