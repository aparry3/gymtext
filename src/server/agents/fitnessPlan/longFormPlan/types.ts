import { AgentConfig } from "@/server/agents/base";
import { UserWithProfile } from "@/server/models/userModel";

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
  reasoning: string;
}
