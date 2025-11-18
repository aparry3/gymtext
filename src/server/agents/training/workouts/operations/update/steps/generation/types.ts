import { AgentConfig } from "@/server/agents/base";
import { BaseWorkoutChainInput } from "../../../../shared/types";
import { WorkoutInstance } from "@/server/models/workout";


export interface WorkoutUpdateGenerationConfig {
  agentConfig?: AgentConfig;
}

export interface WorkoutUpdateGenerationInput extends BaseWorkoutChainInput {
  changeRequest: string;
  workout: WorkoutInstance;
}
