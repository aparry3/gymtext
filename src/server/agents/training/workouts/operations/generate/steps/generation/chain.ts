import { createRunnableAgent, initializeModel } from '@/server/agents/base';
import { WorkoutGenerationConfig } from './types';
import { WorkoutChainContext } from '../../../../shared/types';
import { DAILY_WORKOUT_SYSTEM_PROMPT, dailyWorkoutUserPrompt } from './prompt';
import { WorkoutGenerateInput } from './types';

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
  return createRunnableAgent(async (input: WorkoutGenerateInput): Promise<WorkoutChainContext> => {
        // Prepare input with fitness profile and prompt
    const prompt = dailyWorkoutUserPrompt({dayOutline: input.dayOverview, clientProfile: input.user.profile || '', isDeload: input.isDeload});
    
    const description = await model.invoke([
      { role: 'system', content: DAILY_WORKOUT_SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ]) as string;
    return {
      description,
      user: input.user,
      date: input.date
    };
  });
}
