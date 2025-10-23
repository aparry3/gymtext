import { z } from 'zod';
import { UserWithProfile } from '@/server/models/userModel';
import { WorkoutInstance } from '@/server/models/workout';
import { GeminiUpdatedWorkoutInstanceSchema } from '@/server/models/workout/geminiSchema';
import { SYSTEM_PROMPT, userPrompt, type ReplaceWorkoutParams } from './prompts';
import { executeWorkoutChain, type WorkoutChainResult } from '../shared/chainFactory';

export type { ReplaceWorkoutParams };

export interface ReplaceWorkoutContext {
  workout: WorkoutInstance;
  user: UserWithProfile;
  params: ReplaceWorkoutParams;
}

/**
 * Output from replace workout operation
 * Uses shared WorkoutChainResult type for consistency
 * Note: Uses z.infer to get base type without date (WorkoutChainResult adds the date)
 */
export type ReplacedWorkoutResult = WorkoutChainResult<z.infer<typeof GeminiUpdatedWorkoutInstanceSchema>>;

/**
 * Replace workout using the shared workout chain factory
 *
 * Two-step process:
 * 1. Generate long-form replacement workout description + reasoning (using system + user prompts)
 * 2. In parallel: convert to JSON structure + SMS message
 */
export const replaceWorkout = async (context: ReplaceWorkoutContext): Promise<ReplacedWorkoutResult> => {
  return executeWorkoutChain(context, {
    // Step 1: System prompt (static instructions)
    systemPrompt: SYSTEM_PROMPT,

    // Step 1: User prompt (dynamic context)
    userPrompt: (ctx, fitnessProfile) => userPrompt(
      fitnessProfile,
      ctx.params,
      ctx.workout,
      ctx.user
    ),

    // Schema for validation (Gemini-compatible)
    structuredSchema: GeminiUpdatedWorkoutInstanceSchema,

    // Track modifications for replace
    includeModifications: true,

    // Context extractors
    getUserFromContext: (ctx) => ctx.user,
    getDateFromContext: (ctx) => ctx.workout.date as Date,

    // Logging identifier
    operationName: 'replace workout'
  });
};
