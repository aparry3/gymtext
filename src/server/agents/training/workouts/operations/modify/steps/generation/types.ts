import { z } from 'zod';
import { AgentConfig } from "@/server/agents/base";
import { BaseWorkoutChainInput } from "../../../../shared/types";
import { WorkoutInstance } from "@/server/models/workout";

/**
 * Zod schema for workout modification structured output
 *
 * Single unified schema with all fields:
 * - overview: Full workout text (modified or original)
 * - wasModified: Boolean indicating if changes were made
 * - modifications: Explanation of changes (empty string if wasModified is false)
 */
export const ModifyWorkoutGenerationOutputSchema = z.object({
  overview: z.string().describe('Full workout text after modifications (or original if unchanged)'),
  wasModified: z.boolean().describe('Whether the workout was actually modified'),
  modifications: z.string().default('').describe('Explanation of what changed and why (empty string if wasModified is false)'),
});

export type ModifyWorkoutGenerationOutput = z.infer<typeof ModifyWorkoutGenerationOutputSchema>;

export interface ModifyWorkoutGenerationConfig {
  agentConfig?: AgentConfig;
}

export interface ModifyWorkoutGenerationInput extends BaseWorkoutChainInput {
  changeRequest: string;
  workout: WorkoutInstance;
}
