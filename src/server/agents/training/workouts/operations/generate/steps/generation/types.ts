import { AgentConfig } from "@/server/agents/base";
import { BaseWorkoutChainInput } from "../../../../shared/types";


export interface WorkoutGenerationConfig {
  systemPrompt: string;
  agentConfig?: AgentConfig;
}

export interface WorkoutGenerationInput extends BaseWorkoutChainInput {
  prompt: string;
  fitnessProfile: string;
}
