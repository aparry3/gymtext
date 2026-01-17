import { z } from 'zod';

/**
 * Agent-Specific Workout Schemas
 *
 * These schemas are for agent output formats only.
 * Domain types are in @/server/models/workoutInstance
 */

// =============================================================================
// Modify Workout Agent Schema
// =============================================================================

/**
 * Zod schema for Modify Workout Agent output
 */
export const ModifyWorkoutGenerationOutputSchema = z.object({
  overview: z.string().describe('Full workout text after modifications (or original if unchanged)'),
  wasModified: z.boolean().describe('Whether the workout was actually modified'),
  modifications: z.string().default('').describe('Explanation of what changed and why (empty string if wasModified is false)'),
});

export type ModifyWorkoutGenerationOutput = z.infer<typeof ModifyWorkoutGenerationOutputSchema>;
