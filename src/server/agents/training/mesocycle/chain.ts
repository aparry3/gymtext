import { UserWithProfile } from '@/server/models/userModel';
import { RunnablePassthrough, RunnableSequence } from '@langchain/core/runnables';
import {
  createMesocycleGenerationRunnable,
  createStructuredMesocycleAgent,
  createFormattedMesocycleAgent,
} from './steps';
import type { MesocycleOverview } from './types';

export type { FitnessProfileContextService, MesocycleOverview } from './types';

/**
 * Creates a mesocycle agent with injected dependencies
 *
 * Uses a composable chain for generating mesocycle breakdowns:
 * 1. Generate mesocycle text description with week-by-week breakdowns
 * 2. Structure the text into JSON with overview and microcycles array
 * 3. Generate formatted markdown for frontend display
 *
 * Uses LangChain's RunnableSequence for composability and proper context flow.
 *
 * @param deps - Dependencies including context service
 * @returns Function that generates mesocycle breakdowns with microcycle strings
 */
export const createMesocycleAgent = () => {
  return async (
    mesocycleOverviewString: string,
    user: UserWithProfile
  ): Promise<MesocycleOverview> => {

    try {

      // Step 1: Create mesocycle text generation runnable
      const mesocycleGenerationRunnable = createMesocycleGenerationRunnable({
        agentConfig: {
          model: 'gpt-5-mini',
        }
      });

      // Step 2: Create structured agent
      const structuredAgent = createStructuredMesocycleAgent({
        agentConfig: {
          model: 'gpt-5-mini',
        }
      });

      // Step 3: Create formatting agent
      const formattedAgent = createFormattedMesocycleAgent({
        operationName: 'format mesocycle',
      });

      // Compose the chain: text generation → structured → formatted
      const sequence = RunnableSequence.from([
        mesocycleGenerationRunnable,
        structuredAgent,
        RunnablePassthrough.assign({
          formatted: formattedAgent,
        })
      ]);

      // Execute the chain
      const result = await sequence.invoke({
        mesocycleOverview: mesocycleOverviewString,
        user,
      });

      // Combine results into final overview
      const finalResult: MesocycleOverview = {
        description: result.mesocycle.overview,
        microcycles: result.mesocycle.microcycles,
        formatted: result.formatted,
        durationWeeks: result.mesocycle.microcycles.length,
      };

      console.log(`[Mesocycle] Generated mesocycle with ${result.mesocycle.microcycles.length} microcycles for user ${user.id}`);

      return finalResult;
    } catch (error) {
      console.error('[Mesocycle] Error generating mesocycle:', error);
      throw error;
    }
  };
};
