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
  })
});

export type FitnessPlanOutput = z.infer<typeof FitnessPlanOutputSchema>;

export interface FitnessPlanConfig {
  systemPrompt: string;
  agentConfig?: AgentConfig;
}

export interface FitnessPlanInput {
  user: UserWithProfile;
  fitnessProfile: string;
  prompt: string;
}

/**
 * Context that flows through the fitness plan chain
 */
export interface FitnessPlanChainContext {
  user: UserWithProfile;
  fitnessProfile: string;
  fitnessPlan: FitnessPlanOutput;
}
