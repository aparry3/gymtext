import { UserWithProfile } from '@/server/models/userModel';
import { RunnablePassthrough, RunnableSequence } from '@langchain/core/runnables';
import {
  MESOCYCLE_SYSTEM_PROMPT,
  createLongFormMesocycleRunnable,
  createMicrocycleExtractor,
  createFormattedMesocycleAgent,
} from './steps';
import { FormattedMesocycleSchema } from '@/server/models/mesocycle/schema';
import type { MesocycleAgentDeps, MesocycleOverview } from './types';

export type { FitnessProfileContextService, MesocycleAgentDeps, MesocycleOverview } from './types';

/**
 * Creates a mesocycle agent with injected dependencies
 *
 * Uses a composable chain for generating mesocycle breakdowns:
 * 1. Generate long-form mesocycle description with microcycle delimiters
 * 2. Extract microcycle overviews from description
 *
 * Uses LangChain's RunnableSequence for composability and proper context flow.
 *
 * @param deps - Dependencies including context service
 * @returns Function that generates mesocycle breakdowns with microcycle strings
 */
export const createMesocycleAgent = (deps: MesocycleAgentDeps) => {
  return async (
    mesocycleOverviewString: string,
    user: UserWithProfile
  ): Promise<MesocycleOverview> => {
    // Get fitness profile context from service
    const fitnessProfile = await deps.contextService.getContext(user);

    try {

      // Step 1: Create long-form mesocycle runnable
      const longFormRunnable = createLongFormMesocycleRunnable({
        systemPrompt: MESOCYCLE_SYSTEM_PROMPT
      });

      // Step 2: Create microcycle extractor
      const microcycleExtractor = createMicrocycleExtractor({
        operationName: 'extract microcycles'
      });

      // Step 3: Create formatting agent
      const formattedAgent = createFormattedMesocycleAgent({
        schema: FormattedMesocycleSchema,
        operationName: 'format mesocycle',
      });

      // Compose the chain: long-form → microcycle extraction + formatting (parallel)
      const sequence = RunnableSequence.from([
        longFormRunnable,
        RunnablePassthrough.assign({
          microcycles: microcycleExtractor,
          formatted: formattedAgent,
        })
      ]);

      // Execute the chain
      const result = await sequence.invoke({
        mesocycleOverview: mesocycleOverviewString,
        user,
        fitnessProfile,
      });

      // Combine results into final overview
      const finalResult: MesocycleOverview = {
        description: result.longFormMesocycle.description,
        microcycles: result.microcycles,
        formatted: result.formatted.formatted,
        durationWeeks: result.microcycles.length,
      };

      console.log(`[Mesocycle] Generated mesocycle with ${result.microcycles.length} microcycles for user ${user.id}`);

      return finalResult;
    } catch (error) {
      console.error('[Mesocycle] Error generating mesocycle:', error);
      throw error;
    }
  };
};
