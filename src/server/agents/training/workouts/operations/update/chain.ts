import { WorkoutInstance } from '@/server/models/workout';
import { SYSTEM_PROMPT, userPrompt } from './generation/prompt';
import { executeWorkoutChain, type WorkoutChainResult } from '../../shared/chainFactory';
import { UserWithProfile } from '@/server/models';

export interface UpdateWorkoutContext {
  user: UserWithProfile;
  workout: WorkoutInstance;
  changeRequest: string;
}

/**
 * Replace workout using the shared workout chain factory
 *
 * Two-step process:
 * 1. Generate long-form replacement workout description + reasoning (using system + user prompts)
 * 2. In parallel: convert to formatted markdown + SMS message
 */
export const updateWorkout = async (context: UpdateWorkoutContext): Promise<WorkoutChainResult> => {
  if (!context.workout.description) {
    throw new Error('Workout description is required');
  }
  if (!context.changeRequest) {
    throw new Error('Change request is required');
  }
  const prompt = userPrompt(context.workout.description, context.changeRequest);
  return executeWorkoutChain({...context, date: context.workout.date as Date}, {
    // Step 1: System prompt (static instructions)
    systemPrompt: SYSTEM_PROMPT,

    // Step 1: User prompt (dynamic context)
    userPrompt: prompt,

    // Track modifications for replace
    includeModifications: true,

    // Logging identifier
    operationName: 'Update Workout'
  });
};
