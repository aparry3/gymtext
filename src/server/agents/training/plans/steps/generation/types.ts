import { z } from "zod";
import type { AgentConfig } from "@/server/agents/base";
import type { UserWithProfile } from "@/server/models/userModel";

/**
 * Schema for simplified fitness plan generation output
 *
 * The plan is now a structured text description containing:
 * - Training split and frequency
 * - Goals and focus areas
 * - Deload rules (e.g., "every 4th week")
 * - Progression guidelines
 */
export const FitnessPlanOutputSchema = z.object({
  plan: z.string({
    description: "Structured text plan containing split, frequency, goals, deload rules, and progression guidelines"
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
