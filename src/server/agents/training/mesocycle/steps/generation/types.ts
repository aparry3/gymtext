import { z } from "zod";
import type { AgentConfig } from "@/server/agents/base";
import type { UserWithProfile } from "@/server/models/userModel";

/**
 * Schema for structured mesocycle generation output
 */
export const LongFormMesocycleOutputSchema = z.object({
  overview: z.string({
    description: "Comprehensive mesocycle overview including objective, duration, volume/intensity trends, split, and conditioning strategy"
  }),
  microcycles: z.array(z.string(), {
    description: "Array of weekly microcycle overview strings with all required details (volume, intensity, split, session themes, etc.)"
  })
});

export type MesocycleGenerationOutput = z.infer<typeof LongFormMesocycleOutputSchema>;

export interface MesocycleAgentConfig {
  systemPrompt: string;
  agentConfig?: AgentConfig;
}

export interface MesocycleGenerationInput {
  mesocycleOverview: string;
  user: UserWithProfile;
  fitnessProfile: string;
}

/**
 * Context that flows through the mesocycle chain
 */
export interface MesocycleChainContext {
  mesocycleOverview: string;
  user: UserWithProfile;
  fitnessProfile: string;
  mesocycle: MesocycleGenerationOutput;
}
