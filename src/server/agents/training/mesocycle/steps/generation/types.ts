import type { AgentConfig } from "@/server/agents/base";
import type { UserWithProfile } from "@/server/models/userModel";

export interface LongFormMesocycleConfig {
  systemPrompt: string;
  agentConfig?: AgentConfig;
}

export interface LongFormMesocycleInput {
  mesocycleOverview: string;
  user: UserWithProfile;
  fitnessProfile: string;
}

export type LongFormMesocycleOutput = string;

/**
 * Context that flows through the mesocycle chain
 */
export interface MesocycleChainContext {
  mesocycleOverview: string;
  user: UserWithProfile;
  fitnessProfile: string;
  longFormMesocycle: LongFormMesocycleOutput;
}
