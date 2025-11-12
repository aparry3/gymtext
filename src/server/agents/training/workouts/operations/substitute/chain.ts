import { z } from 'zod';
import { UserWithProfile } from '@/server/models/userModel';
import { WorkoutInstance } from '@/server/models/workout';
import { UpdatedFormattedWorkoutSchema } from '@/server/models/workout/schema';
import { SYSTEM_PROMPT, userPrompt, type Modification } from './generation/prompt';
import { executeWorkoutChain, type WorkoutChainResult } from '../../shared/chainFactory';

export type { Modification };

export interface SubstituteExercisesContext {
  workout: WorkoutInstance;
  user: UserWithProfile;
  modifications: Modification[];
}

/**
 * Output from substitute exercises operation
 * Uses shared WorkoutChainResult type for consistency
 * Note: Uses z.infer to get base type without date (WorkoutChainResult adds the date)
 */
export type SubstitutedWorkoutResult = WorkoutChainResult<z.infer<typeof UpdatedFormattedWorkoutSchema>>;

/**
 * Substitute exercises using the shared workout chain factory
 *
 * Two-step process:
 * 1. Generate long-form workout with substitutions + reasoning (using system + user prompts)
 * 2. In parallel: convert to formatted markdown + SMS message
 */
export const substituteExercises = async (context: SubstituteExercisesContext): Promise<SubstitutedWorkoutResult> => {
  return executeWorkoutChain({...context, date: context.workout.date as Date}, {
    // Step 1: System prompt (static instructions)
    systemPrompt: SYSTEM_PROMPT,

    // Step 1: User prompt (dynamic context)
    userPrompt: userPrompt(context),

    // Schema for formatted output
    formattedSchema: UpdatedFormattedWorkoutSchema,

    // Track modifications for substitute
    includeModifications: true,

    // Logging identifier
    operationName: 'substitute exercises'
  });
};
