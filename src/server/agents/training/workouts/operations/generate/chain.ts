import { createRunnableAgent } from '@/server/agents/base';
import { SYSTEM_PROMPT, userPrompt } from './generation/prompt';
import { executeWorkoutChain, WorkoutChainResult } from '../../shared/chainFactory';
import type { DailyWorkoutInput } from './types';

/**
 * Daily Workout Agent Factory
 *
 * Generates personalized daily workouts using a two-step process:
 * 1. Generate long-form workout description + reasoning
 * 2. In parallel: convert to formatted markdown + SMS message
 *
 * Uses the shared workout chain factory for consistent workout generation.
 *
 * @param deps - Optional dependencies (config)
 * @returns Agent that generates daily workouts
 */
export const createDailyWorkoutAgent = () => {
  return createRunnableAgent<DailyWorkoutInput, WorkoutChainResult>(async (input) => {
    return executeWorkoutChain(input, {
      // Step 1: System prompt (static instructions)
      systemPrompt: SYSTEM_PROMPT,

      // Step 1: User prompt (dynamic context)
      userPrompt: userPrompt(input),

      // No modifications tracking for generate
      includeModifications: false,

      // Logging identifier
      operationName: 'generate workout'
    });
  });
};