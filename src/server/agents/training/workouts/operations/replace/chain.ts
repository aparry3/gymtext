import { z } from 'zod';
import { WorkoutInstance } from '@/server/models/workout';
import { UpdatedFormattedWorkoutSchema } from '@/server/models/workout/schema';
import { SYSTEM_PROMPT, userPrompt, type ReplaceWorkoutParams } from './generation/prompt';
import { executeWorkoutChain, type WorkoutChainResult } from '../../shared/chainFactory';
import { UserWithProfile } from '@/server/models';

export type { ReplaceWorkoutParams };

export interface ReplaceWorkoutContext {
  user: UserWithProfile;
  workout: WorkoutInstance;
  params: ReplaceWorkoutParams;
}

/**
 * Output from replace workout operation
 * Uses shared WorkoutChainResult type for consistency
 * Note: Uses z.infer to get base type without date (WorkoutChainResult adds the date)
 */
export type ReplacedWorkoutResult = WorkoutChainResult<z.infer<typeof UpdatedFormattedWorkoutSchema>>;

/**
 * Replace workout using the shared workout chain factory
 *
 * Two-step process:
 * 1. Generate long-form replacement workout description + reasoning (using system + user prompts)
 * 2. In parallel: convert to formatted markdown + SMS message
 */
export const replaceWorkout = async (context: ReplaceWorkoutContext): Promise<ReplacedWorkoutResult> => {
  return executeWorkoutChain({...context, date: context.workout.date as Date}, {
    // Step 1: System prompt (static instructions)
    systemPrompt: SYSTEM_PROMPT,

    // Step 1: User prompt (dynamic context)
    userPrompt: userPrompt(context),

    // Schema for formatted output
    formattedSchema: UpdatedFormattedWorkoutSchema,

    // Track modifications for replace
    includeModifications: true,

    // Logging identifier
    operationName: 'replace workout'
  });
};
