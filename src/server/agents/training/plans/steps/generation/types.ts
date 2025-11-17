import { z } from "zod";
import type { AgentConfig } from "@/server/agents/base";
import type { UserWithProfile } from "@/server/models/userModel";

/**
 * Schema for structured fitness plan generation output
 */
export const LongFormPlanOutputSchema = z.object({
  overview: z.string({
    description: "Comprehensive plan overview including reasoning, split selection, and overall structure"
  }),
  mesocycles: z.array(z.string(), {
    description: "Array of mesocycle overview strings with all required details (duration, objective, focus, etc.)"
  })
});

export type LongFormPlanOutput = z.infer<typeof LongFormPlanOutputSchema>;

export interface LongFormPlanConfig {
  systemPrompt: string;
  agentConfig?: AgentConfig;
}

export interface LongFormPlanInput {
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
  longFormPlan: LongFormPlanOutput;
}
