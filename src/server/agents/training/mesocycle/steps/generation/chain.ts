import { createRunnableAgent, initializeModel } from '@/server/agents/base';
import type { MesocycleAgentConfig, MesocycleGenerationInput, MesocycleChainContext, MesocycleGenerationOutput } from './types';
import { MesocycleGenerationOutputSchema } from './types';
import { mesocycleUserPrompt } from './prompt';
import { validateMesocycleOutput } from './validation';

/**
 * Long-Form Mesocycle Agent Factory
 *
 * Generates comprehensive mesocycles with structured output containing
 * an overview and array of weekly microcycle strings.
 *
 * Used as the first step in the mesocycle generation chain to produce structured output
 * that can be used directly without string parsing.
 *
 * Includes validation and retry logic to ensure microcycle count consistency.
 *
 * @param config - Configuration containing prompts and (optionally) agent/model settings
 * @returns Agent (runnable) that produces structured mesocycle data
 */
export const createMesocycleGenerationRunnable = (config: MesocycleAgentConfig) => {
  const model = initializeModel(MesocycleGenerationOutputSchema, config.agentConfig);
  const maxRetries = config.maxRetries ?? 3;

  return createRunnableAgent(async (input: MesocycleGenerationInput): Promise<MesocycleChainContext> => {
    const systemMessage = config.systemPrompt;
    const userPrompt = mesocycleUserPrompt(
      input.mesocycleOverview,
      input.user,
    );
    let lastError: string | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const mesocycle = await model.invoke([
        { role: 'system', content: systemMessage },
        { role: 'user', content: userPrompt }
      ]) as MesocycleGenerationOutput;

      // Validate the output
      const validationResult = validateMesocycleOutput(mesocycle);

      if (validationResult.isValid) {
        console.log(`[MesocycleGenerationRunnable] Generated valid mesocycle with ${mesocycle.microcycles.length} microcycles`);
        return {
          mesocycle,
          mesocycleOverview: input.mesocycleOverview,
          user: input.user,
        };
      }

      // Validation failed
      lastError = validationResult.error;
      console.warn(`[MesocycleGenerationRunnable] Attempt ${attempt}/${maxRetries} failed validation: ${validationResult.error}`);

      // Continue to next attempt if retries remain
      if (attempt < maxRetries) {
        console.log(`[MesocycleGenerationRunnable] Retrying generation...`);
      }
    }

    // All retries exhausted
    throw new Error(`Failed to generate valid mesocycle after ${maxRetries} attempts. Last error: ${lastError}`);
  });
};
