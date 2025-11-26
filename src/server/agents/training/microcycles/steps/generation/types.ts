import { z } from "zod";
import type { AgentConfig } from "@/server/agents/base";
import type { MicrocycleGenerationInput } from '../../types';

/**
 * Schema for structured microcycle generation output
 */
export const MicrocycleGenerationOutputSchema = z.object({
  overview: z.string({
    description: "Comprehensive weekly overview including week number, theme, objective, split, volume/intensity trends, conditioning plan, and rest day placement"
  }),
  isDeload: z.boolean().default(false).describe("Whether this is a deload/recovery week with reduced volume and intensity"),
  days: z.array(z.string(), {
    description: "Exactly 7 day overview strings in order: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday"
  }).length(7)
});

export type MicrocycleGenerationOutput = z.infer<typeof MicrocycleGenerationOutputSchema>;

export interface MicrocycleGenerationConfig {
  systemPrompt: string;
  agentConfig?: AgentConfig;
}

/**
 * Context that flows through the microcycle chain
 */
export interface MicrocycleChainContext extends MicrocycleGenerationInput {
  microcycle: MicrocycleGenerationOutput;
}
