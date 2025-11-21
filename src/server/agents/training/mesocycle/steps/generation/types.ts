import { z } from "zod";
import type { AgentConfig } from "@/server/agents/base";
import type { UserWithProfile } from "@/server/models/userModel";

/**
 * Schema for structured mesocycle generation output
 */
export const MesocycleGenerationOutputSchema = z.object({
  overview: z.string({
    description: "Comprehensive mesocycle overview including objective, duration, volume/intensity trends, split, and conditioning strategy"
  }),
  microcycles: z.array(z.string(), {
    description: "Array of weekly microcycle overview strings with all required details (volume, intensity, split, session themes, etc.)"
  }),
  number_of_microcycles: z.number({
    description: "The number of microcycles in the mesocycle"
  })
});

export type MesocycleGenerationOutput = z.infer<typeof MesocycleGenerationOutputSchema>;

export interface MesocycleAgentConfig {
  systemPrompt: string;
  agentConfig?: AgentConfig;
  maxRetries?: number;
}

export interface MesocycleGenerationInput {
  mesocycleOverview: string;
  user: UserWithProfile;
}

/**
 * Context that flows through the mesocycle chain
 */
export interface MesocycleChainContext {
  mesocycleOverview: string;
  user: UserWithProfile;
  mesocycle: MesocycleGenerationOutput;
}
