import { z } from 'zod';
import { AgentConfig } from "@/server/agents/base";
import { BaseWorkoutChainInput } from "../../../../shared/types";
import { WorkoutInstance } from "@/server/models/workout";

/**
 * Zod schema for workout update structured output
 *
 * The output has conditional fields based on whether the workout was modified:
 * - If wasModified = true: includes "modifications" field explaining changes
 * - If wasModified = false: omits "modifications" field
 */

// Schema when workout was modified (includes modifications explanation)
const ModifiedUpdateOutputSchema = z.object({
  overview: z.string().describe('Full workout text after applying modifications'),
  wasModified: z.literal(true).describe('Indicates the workout was modified'),
  modifications: z.string().describe('Explanation of what changed and why'),
});

// Schema when workout was not modified (no modifications field)
const UnmodifiedUpdateOutputSchema = z.object({
  overview: z.string().describe('Original workout text (unchanged)'),
  wasModified: z.literal(false).describe('Indicates the workout was not modified'),
});

// Union schema that handles both cases
export const WorkoutUpdateGenerationOutputSchema = z.discriminatedUnion('wasModified', [
  ModifiedUpdateOutputSchema,
  UnmodifiedUpdateOutputSchema,
]);

export type WorkoutUpdateGenerationOutput = z.infer<typeof WorkoutUpdateGenerationOutputSchema>;

export interface WorkoutUpdateGenerationConfig {
  agentConfig?: AgentConfig;
}

export interface WorkoutUpdateGenerationInput extends BaseWorkoutChainInput {
  changeRequest: string;
  workout: WorkoutInstance;
}
