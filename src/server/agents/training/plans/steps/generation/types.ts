import { z } from "zod";
import type { AgentConfig } from "@/server/agents/base";
import type { UserWithProfile } from "@/server/models/userModel";

/**
 * Schema for structured fitness plan generation output
 */
export const FitnessPlanOutputSchema = z.object({
  overview: z.string({
    description: "Comprehensive plan overview including reasoning, split selection, and overall structure"
  }),
  mesocycles: z.array(z.string(), {
    description: "Array of mesocycle overview strings with all required details (duration, objective, focus, etc.)"
  }),
  number_of_mesocycles: z.number({
    description: "The number of mesocycles in the plan"
  }),
  total_weeks: z.number({
    description: "The total number of weeks in the plan"
  })
});

export type FitnessPlanOutput = z.infer<typeof FitnessPlanOutputSchema>;

export interface FitnessPlanConfig {
  systemPrompt: string;
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
  fitnessPlan: FitnessPlanOutput;
}
