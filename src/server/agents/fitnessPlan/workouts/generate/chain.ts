import { createRunnableAgent } from '@/server/agents/base';
import { GeminiEnhancedWorkoutInstanceSchema } from '@/server/models/workout/geminiSchema';
import { SYSTEM_PROMPT, userPrompt } from './prompts';
import { executeWorkoutChain } from '../shared/chainFactory';
import type { DailyWorkoutInput, DailyWorkoutOutput } from './types';

/**
 * @deprecated Legacy interface - use DailyWorkoutInput instead
 * Kept for backward compatibility only
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DailyWorkoutContext extends DailyWorkoutInput {}

/**
 * @deprecated Legacy interface - use DailyWorkoutOutput instead
 * Kept for backward compatibility only
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GeneratedWorkoutResult extends DailyWorkoutOutput {}

/**
 * Daily Workout Agent Factory
 *
 * Generates personalized daily workouts using a two-step process:
 * 1. Generate long-form workout description + reasoning
 * 2. In parallel: convert to JSON structure + SMS message
 *
 * Uses the shared workout chain factory for consistent workout generation.
 *
 * @param deps - Optional dependencies (config)
 * @returns Agent that generates daily workouts
 */
export const createDailyWorkoutAgent = () => {
  return createRunnableAgent<DailyWorkoutInput, DailyWorkoutOutput>(async (input) => {
    return executeWorkoutChain(input, {
      // Step 1: System prompt (static instructions)
      systemPrompt: SYSTEM_PROMPT,

      // Step 1: User prompt (dynamic context)
      userPrompt: (ctx, fitnessProfile) => userPrompt(
        ctx.user,
        fitnessProfile,
        ctx.dayPlan,
        ctx.microcycle.pattern,
        ctx.mesocycle,
        ctx.fitnessPlan.programType,
        ctx.recentWorkouts
      ),

      // Schema for validation (Gemini-compatible)
      structuredSchema: GeminiEnhancedWorkoutInstanceSchema,

      // No modifications tracking for generate
      includeModifications: false,

      // Context extractors
      getUserFromContext: (ctx) => ctx.user,
      getDateFromContext: (ctx) => ctx.date,

      // Logging identifier
      operationName: 'generate workout'
    });
  });
};

/**
 * @deprecated Legacy export for backward compatibility - use createDailyWorkoutAgent instead
 */
export const generateDailyWorkout = async (context: DailyWorkoutContext): Promise<DailyWorkoutOutput> => {
  const agent = createDailyWorkoutAgent();
  return agent.invoke(context);
};
