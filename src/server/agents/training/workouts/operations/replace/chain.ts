import { WorkoutInstance } from '@/server/models/workout';
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
 * Replace workout using the shared workout chain factory
 *
 * Two-step process:
 * 1. Generate long-form replacement workout description + reasoning (using system + user prompts)
 * 2. In parallel: convert to formatted markdown + SMS message
 */
export const replaceWorkout = async (context: ReplaceWorkoutContext): Promise<WorkoutChainResult> => {
  return executeWorkoutChain({...context, date: context.workout.date as Date}, {
    // Step 1: System prompt (static instructions)
    systemPrompt: SYSTEM_PROMPT,

    // Step 1: User prompt (dynamic context)
    userPrompt: userPrompt(context),

    // Track modifications for replace
    includeModifications: true,

    // Logging identifier
    operationName: 'replace workout'
  });
};
