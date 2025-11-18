import { createRunnableAgent, initializeModel } from '@/server/agents/base';
import { WorkoutGenerationConfig, WorkoutGenerationInput } from './types';
import { WorkoutChainContext } from '../../chainFactory';

/**
 * Long-Form Workout Agent Factory
 *
 * Generates comprehensive workout plans in natural language form, including both a detailed description and reasoning.
 *
 * Used as the first step in the workout generation chain to produce a long-form workout, which can then be structured or summarized for other uses.
 *
 * @param config - Configuration containing prompts and (optionally) agent/model settings.
 * @returns Agent (runnable) that produces a long-form workout object with description and reasoning.
 */
export const createWorkoutGenerationRunnable = (config: WorkoutGenerationConfig) => {
  const model = initializeModel(undefined, config.agentConfig);  
  return createRunnableAgent(async (input: WorkoutGenerationInput): Promise<WorkoutChainContext> => {
    const systemMessage = config.systemPrompt;
    const description = await model.invoke([
      { role: 'system', content: systemMessage },
      { role: 'user', content: input.prompt }
    ]) as string;
    return {
      description,
      user: input.user,
      fitnessProfile: input.fitnessProfile,
      date: input.date
    };
  });
}
