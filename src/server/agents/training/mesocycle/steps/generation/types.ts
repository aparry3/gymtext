import { AgentConfig } from "@/server/agents/base";
import { UserWithProfile } from "@/server/models/userModel";

export interface LongFormMesocycleConfig {
  systemPrompt: string;
  agentConfig?: AgentConfig;
}

export interface LongFormMesocycleInput {
  mesocycleOverview: string;
  durationWeeks: number;
  user: UserWithProfile;
  fitnessProfile: string;
  prompt: string;
}

export interface LongFormMesocycleOutput {
  description: string;
}
