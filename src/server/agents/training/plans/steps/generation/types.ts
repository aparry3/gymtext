import type { AgentConfig } from "@/server/agents/base";
import type { UserWithProfile } from "@/server/models/userModel";

export interface LongFormPlanConfig {
  systemPrompt: string;
  agentConfig?: AgentConfig;
}

export interface LongFormPlanInput {
  user: UserWithProfile;
  fitnessProfile: string;
  prompt: string;
}

export interface LongFormPlanOutput {
  description: string;
}

/**
 * Context that flows through the fitness plan chain
 */
export interface FitnessPlanChainContext {
  user: UserWithProfile;
  fitnessProfile: string;
  longFormPlan: LongFormPlanOutput;
}
