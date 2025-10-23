import { AgentConfig } from "@/server/agents/base";
import { BaseWorkoutChainInput } from "../chainFactory";


export interface LongFormatWorkoutConfig {
  systemPrompt: string;
  agentConfig?: AgentConfig;
}

export interface LongFormatWorkoutInput extends BaseWorkoutChainInput {
  prompt: string;
  fitnessProfile: string;
}
