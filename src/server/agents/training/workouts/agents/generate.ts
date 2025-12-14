import { createAgent, type ConfigurableAgent, type SubAgentBatch } from '@/server/agents/configurable';
import { createFormattedWorkoutAgent } from './formatted';
import { createWorkoutMessageAgent } from './message';
import { createStructuredWorkoutAgent } from './structured';
import { DAILY_WORKOUT_SYSTEM_PROMPT, dailyWorkoutUserPrompt } from '../prompts';
import type { WorkoutGenerateInput, WorkoutGenerateOutput, WorkoutGenerateAgentDeps } from '../types';

/**
 * Workout Generate Agent Factory
 *
 * Generates personalized workouts using the configurable agent pattern:
 * 1. Main agent generates long-form workout description
 * 2. SubAgents run in parallel: formatted, message, structure
 *
 * @param deps - Optional dependencies (config)
 * @returns ConfigurableAgent that generates workouts
 */
export const createWorkoutGenerateAgent = (
  deps?: WorkoutGenerateAgentDeps
): ConfigurableAgent<WorkoutGenerateInput, WorkoutGenerateOutput> => {

  // Create subAgents - all in one batch for parallel execution
  const subAgents: SubAgentBatch[] = [
    {
      formatted: createFormattedWorkoutAgent({
        includeModifications: false,
        operationName: 'generate',
        agentConfig: deps?.config,
      }),
      message: createWorkoutMessageAgent({
        operationName: 'generate',
        agentConfig: deps?.config,
      }),
      structure: createStructuredWorkoutAgent({
        operationName: 'generate',
        agentConfig: deps?.config,
      }),
    },
  ];

  return createAgent({
    name: 'workout-generate',
    systemPrompt: DAILY_WORKOUT_SYSTEM_PROMPT,
    userPrompt: (input: WorkoutGenerateInput) => dailyWorkoutUserPrompt({
      dayOutline: input.dayOverview,
      clientProfile: input.user.profile || '',
      isDeload: input.isDeload ?? false,
    }),
    subAgents,
  }, { model: 'gpt-5.1', ...deps?.config }) as ConfigurableAgent<WorkoutGenerateInput, WorkoutGenerateOutput>;
};
