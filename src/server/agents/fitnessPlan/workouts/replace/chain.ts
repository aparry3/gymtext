import { UserWithProfile } from '@/server/models/userModel';
import { WorkoutInstance, UpdatedWorkoutInstance } from '@/server/models/workout';
import { _UpdatedWorkoutInstanceSchema } from '@/server/models/workout/schema';
import { systemPrompt, userPrompt, type ReplaceWorkoutParams } from './prompts';
import { executeWorkoutChain } from '../shared/chainFactory';

export type { ReplaceWorkoutParams };

export interface ReplaceWorkoutContext {
  workout: WorkoutInstance;
  user: UserWithProfile;
  params: ReplaceWorkoutParams;
}

export interface ReplacedWorkoutResult {
  workout: UpdatedWorkoutInstance & { date: Date };
  message: string;
  description: string;
  reasoning: string;
}

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
    systemPrompt,

    // Step 1: User prompt (dynamic context)
    userPrompt: (ctx, fitnessProfile) => userPrompt(
      fitnessProfile,
      ctx.params,
      ctx.workout,
      ctx.user
    ),

    // Schema for validation
    structuredSchema: _UpdatedWorkoutInstanceSchema,

    // Track modifications for replace
    includeModifications: true,

    // Context extractors
    getUserFromContext: (ctx) => ctx.user,
    getDateFromContext: (ctx) => ctx.workout.date as Date,

    // Logging identifier
    operationName: 'replace workout'
  });
};
