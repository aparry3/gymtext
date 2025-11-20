import { createRunnableAgent, initializeModel } from '@/server/agents/base';
import { WorkoutGenerationConfig } from './types';
import { WorkoutChainContext } from '../../../../shared/types';
import { SYSTEM_PROMPT, userPrompt } from './prompt';
import { formatFitnessProfile } from '@/server/utils/formatters';
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
    const prompt = userPrompt({...input});
    
    const description = await model.invoke([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ]) as string;
    return {
      description,
      user: input.user,
      date: input.date
    };
  });
}
