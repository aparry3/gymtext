import { modifyMicrocycleUserPrompt, MICROCYCLE_MODIFY_SYSTEM_PROMPT } from './prompt';
import { createRunnableAgent, initializeModel } from '@/server/agents/base';
import type { ModifyMicrocycleInput, ModifyMicrocycleOutput } from './types';
import { ModifyMicrocycleOutputSchema } from './types';
import type { MicrocycleAgentDeps } from '../../../../types';
import type { MicrocycleChainContext } from '../../../../shared/types';

export type { ModifyMicrocycleInput } from './types';

/**
 * Creates the modify-specific first step runnable
 * Takes ModifyMicrocycleInput and produces MicrocycleChainContext (with wasModified)
 */
export const createModifyMicrocycleRunnable = (deps?: MicrocycleAgentDeps) => {
  const model = initializeModel(ModifyMicrocycleOutputSchema, deps?.config);

  return createRunnableAgent<ModifyMicrocycleInput, MicrocycleChainContext & { wasModified: boolean }>(async (input) => {
    const { user, currentMicrocycle, changeRequest, currentDayOfWeek } = input;

    // Generate prompt - use user.profile directly (markdown from profiles table)
    const prompt = modifyMicrocycleUserPrompt({
      fitnessProfile: user.profile || 'No additional user notes',
      currentMicrocycle,
      changeRequest,
      currentDayOfWeek,
    });

    // Retry mechanism for transient errors
    const maxRetries = 2;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(`[Modify] Attempting to modify microcycle (attempt ${attempt + 1}/${maxRetries})`);

        // Generate the modified microcycle
        const microcycle = await model.invoke([
          { role: 'system', content: MICROCYCLE_MODIFY_SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ]) as ModifyMicrocycleOutput;

        // Ensure we have a valid response
        if (!microcycle) {
          throw new Error('AI returned null/undefined microcycle');
        }

        console.log(`[Modify] Successfully modified microcycle with ${microcycle.days.length} days (wasModified: ${microcycle.wasModified})`);

        // Extract wasModified and modifications, return MicrocycleChainContext for post-processing
        const { wasModified, modifications, ...baseMicrocycle } = microcycle;

        return {
          microcycle: baseMicrocycle,
          // Use currentMicrocycle.description as stand-in for plan context in modify flow
          planText: currentMicrocycle.description ?? '',
          userProfile: user.profile || 'No additional user notes',
          absoluteWeek: currentMicrocycle.absoluteWeek,
          isDeload: currentMicrocycle.isDeload,
          wasModified,
          modifications
        };
      } catch (error) {
        console.error(`[Modify] Error modifying microcycle (attempt ${attempt + 1}):`, error);

        // Log more details about the error for debugging
        if (error instanceof Error) {
          console.error('Error details:', {
            message: error.message,
            stack: error.stack?.substring(0, 500),
            name: error.name,
            attempt: attempt + 1
          });
        }

        // If it's the last attempt, break out of the loop
        if (attempt === maxRetries - 1) {
          break;
        }

        // Wait a bit before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 1000));
      }
    }

    throw new Error('Failed to modify microcycle after all attempts');
  });
};
