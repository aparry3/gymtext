import type { AgentConfig } from "@/server/agents/base";
import type { UserWithProfile } from "@/server/models/userModel";

export interface MesocycleAgentConfig {
  agentConfig?: AgentConfig;
  maxRetries?: number;
}

export interface MesocycleGenerationInput {
  mesocycleOverview: string;
  user: UserWithProfile;
}

/**
 * Output from the generation agent (plain text)
 */
export interface MesocycleGenerationOutput {
  mesocycleText: string;
  mesocycleOverview: string;
  user: UserWithProfile;
}
