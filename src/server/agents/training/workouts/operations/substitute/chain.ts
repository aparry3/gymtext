import { UserWithProfile } from '@/server/models/userModel';
import { WorkoutInstance } from '@/server/models/workout';
import { SYSTEM_PROMPT, userPrompt, type Modification } from './generation/prompt';
import { executeWorkoutChain, type WorkoutChainResult } from '../../shared/chainFactory';

export type { Modification };

export interface SubstituteExercisesContext {
  workout: WorkoutInstance;
  user: UserWithProfile;
  modifications: Modification[];
}

/**
 * Substitute exercises using the shared workout chain factory
 *
 * Two-step process:
 * 1. Generate long-form workout with substitutions + reasoning (using system + user prompts)
 * 2. In parallel: convert to formatted markdown + SMS message
 */
export const substituteExercises = async (context: SubstituteExercisesContext): Promise<WorkoutChainResult> => {
  return executeWorkoutChain({...context, date: context.workout.date as Date}, {
    // Step 1: System prompt (static instructions)
    systemPrompt: SYSTEM_PROMPT,

    // Step 1: User prompt (dynamic context)
    userPrompt: userPrompt(context),

    // Track modifications for substitute
    includeModifications: true,

    // Logging identifier
    operationName: 'substitute exercises'
  });
};
