import { UserWithProfile } from '@/server/models/userModel';
import { WorkoutInstance, UpdatedWorkoutInstance } from '@/server/models/workout';
import { _UpdatedWorkoutInstanceSchema } from '@/server/models/workout/schema';
import { systemPrompt, userPrompt, structuredPrompt, messagePrompt, type Modification } from './prompts';
import { executeWorkoutChain } from '../shared/chainFactory';

export type { Modification };

export interface SubstituteExercisesContext {
  workout: WorkoutInstance;
  user: UserWithProfile;
  modifications: Modification[];
}

export interface SubstitutedWorkoutResult {
  workout: UpdatedWorkoutInstance & { date: Date };
  message: string;
  description: string;
  reasoning: string;
}

/**
 * Substitute exercises using the shared workout chain factory
 *
 * Two-step process:
 * 1. Generate long-form workout with substitutions + reasoning (using system + user prompts)
 * 2. In parallel: convert to JSON structure + SMS message
 */
export const substituteExercises = async (context: SubstituteExercisesContext): Promise<SubstitutedWorkoutResult> => {
  return executeWorkoutChain(context, {
    // Step 1: System prompt (static instructions)
    systemPrompt,

    // Step 1: User prompt (dynamic context)
    userPrompt: (ctx, fitnessProfile) => userPrompt(
      fitnessProfile,
      ctx.modifications,
      ctx.workout,
      ctx.user
    ),

    // Step 2a: Structured JSON prompt
    structuredPrompt,

    // Step 2b: SMS message prompt
    messagePrompt: (longForm, user, fitnessProfile, ctx) => messagePrompt(
      longForm,
      user,
      fitnessProfile,
      ctx.modifications
    ),

    // Schema for validation
    structuredSchema: _UpdatedWorkoutInstanceSchema,

    // Context extractors
    getUserFromContext: (ctx) => ctx.user,
    getDateFromContext: (ctx) => ctx.workout.date as Date,

    // Logging identifier
    operationName: 'substitute exercises'
  });
};
