import { AgentConfig } from "@/server/agents/base";
import { BaseWorkoutChainInput } from "../../../../shared/types";


export interface WorkoutGenerationConfig {
  agentConfig?: AgentConfig;
}

/*
* Input for workout generation
* Uses the microcycle's day overview field to generate a complete workout
*/
export interface WorkoutGenerateInput extends BaseWorkoutChainInput {
 dayOverview: string;       // The daily training overview from the microcycle
 isDeload: boolean;        // True/false flag
}

export interface WorkoutGeneratePromptParams {
  dayOverview: string;       // The daily training overview from the microcycle
  isDeload: boolean;        // True/false flag
  fitnessProfile: string;     
}
