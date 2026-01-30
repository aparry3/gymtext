import { z } from 'zod';
import { WorkoutStructureLLMSchema } from '@/shared/types/workout/workoutStructure';

/**
 * Agent-Specific Workout Schemas
 *
 * These schemas are for agent output formats only.
 * Domain types are in @/server/models/workoutInstance
 */

// =============================================================================
// Validation Agent Schema
// =============================================================================

/**
 * Zod schema for Workout Validation Agent output
 */
export const WorkoutValidationSchema = z.object({
  isComplete: z.boolean().describe('Whether the structured workout contains all exercises from the original description'),
  missingExercises: z.array(z.string()).describe('List of exercise names that were in the description but missing from the structure'),
  validatedStructure: WorkoutStructureLLMSchema.describe('The complete validated workout structure (corrected if needed)'),
});

export type WorkoutValidation = z.infer<typeof WorkoutValidationSchema>;

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
