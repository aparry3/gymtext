import { createAgent, type SubAgentBatch } from '@/server/agents/configurable';
import { createWorkoutMessageAgent } from './message';
import { createStructuredWorkoutAgent } from './structured';
import { DAILY_WORKOUT_SYSTEM_PROMPT } from '../prompts';
import type { WorkoutGenerateInput, WorkoutGenerateOutput, WorkoutGenerateAgentDeps } from '../types';

/**
 * Generate a personalized workout
 *
 * Uses the configurable agent pattern:
 * 1. Main agent generates long-form workout description
 * 2. SubAgents run in parallel: message, structure
 *
 * @param input - Workout generation input (user, date, dayOverview, isDeload)
 * @param deps - Optional dependencies (config)
 * @returns WorkoutGenerateOutput with response, message, and structure
 */
export const generateWorkout = async (
  input: WorkoutGenerateInput,
  deps?: WorkoutGenerateAgentDeps
): Promise<WorkoutGenerateOutput> => {

  // Create subAgents - all in one batch for parallel execution
  const subAgents: SubAgentBatch[] = [
    {
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

  const agent = createAgent({
    name: 'workout-generate',
    systemPrompt: DAILY_WORKOUT_SYSTEM_PROMPT,
    context: [
      `<UserProfile>${input.user.profile || ''}</UserProfile>`,
      `<DayInstruction>${input.dayOverview}</DayInstruction>`,
      `<Context>Is Deload Week: ${input.isDeload ?? false}</Context>`,
    ],
    subAgents,
  }, { model: 'gpt-5.1', ...deps?.config });

  return agent.invoke('Generate the detailed workout for this day.') as Promise<WorkoutGenerateOutput>;
};

/**
 * @deprecated Use generateWorkout() instead
 * Factory function maintained for backward compatibility
 */
export const createWorkoutGenerateAgent = (deps?: WorkoutGenerateAgentDeps) => ({
  name: 'workout-generate',
  invoke: (input: WorkoutGenerateInput) => generateWorkout(input, deps),
});
