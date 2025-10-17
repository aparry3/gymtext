import { UserWithProfile } from '@/server/models/userModel';
import { Microcycle } from '@/server/models/microcycle';
import { MesocycleOverview, FitnessPlan } from '@/server/models/fitnessPlan';
import { WorkoutInstance, EnhancedWorkoutInstance } from '@/server/models/workout';
import { _EnhancedWorkoutInstanceSchema } from '@/server/models/workout/schema';
import { systemPrompt, userPrompt, structuredPrompt, messagePrompt } from './prompts';
import { executeWorkoutChain } from '../shared/chainFactory';

export interface DailyWorkoutContext {
  user: UserWithProfile;
  date: Date;
  dayPlan: {
    day: string;
    theme: string;
    load?: 'light' | 'moderate' | 'heavy';
    notes?: string;
  };
  microcycle: Microcycle;
  mesocycle: MesocycleOverview;
  fitnessPlan: FitnessPlan;
  recentWorkouts?: WorkoutInstance[];
}

export interface GeneratedWorkoutResult {
  workout: EnhancedWorkoutInstance & { date: Date };
  message: string;
  description: string;
  reasoning: string;
}

/**
 * Generate daily workout using the shared workout chain factory
 *
 * Two-step process:
 * 1. Generate long-form workout description + reasoning (using system + user prompts)
 * 2. In parallel: convert to JSON structure + SMS message
 */
export const generateDailyWorkout = async (context: DailyWorkoutContext): Promise<GeneratedWorkoutResult> => {
  return executeWorkoutChain(context, {
    // Step 1: System prompt (static instructions)
    systemPrompt,

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

    // Step 2a: Structured JSON prompt
    structuredPrompt,

    // Step 2b: SMS message prompt
    messagePrompt,

    // Schema for validation
    structuredSchema: _EnhancedWorkoutInstanceSchema,

    // Context extractors
    getUserFromContext: (ctx) => ctx.user,
    getDateFromContext: (ctx) => ctx.date,

    // Logging identifier
    operationName: 'generate workout'
  });
};
