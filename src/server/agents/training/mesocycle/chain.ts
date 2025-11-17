import { UserWithProfile } from '@/server/models/userModel';
import { RunnablePassthrough, RunnableSequence } from '@langchain/core/runnables';
import {
  MESOCYCLE_SYSTEM_PROMPT,
  createMesocycleGenerationRunnable,
  createFormattedMesocycleAgent,
} from './steps';
import type { MesocycleAgentDeps, MesocycleChainContext, MesocycleOverview } from './types';

export type { FitnessProfileContextService, MesocycleAgentDeps, MesocycleOverview } from './types';

/**
 * Creates a mesocycle agent with injected dependencies
 *
 * Uses a composable chain for generating mesocycle breakdowns:
 * 1. Generate structured mesocycle with overview and microcycles array
 * 2. Generate formatted markdown for frontend display
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

      // Step 1: Create long-form mesocycle runnable (with structured output)
      const mesocycleGenerationRunnable = createMesocycleGenerationRunnable({
        systemPrompt: MESOCYCLE_SYSTEM_PROMPT,
        agentConfig: {
          model: 'gpt-5-mini',
        }
      });

      // Step 2: Create formatting agent
      const formattedAgent = createFormattedMesocycleAgent({
        operationName: 'format mesocycle',
      });

      // Compose the chain: structured generation → formatting
      const sequence = RunnableSequence.from([
        mesocycleGenerationRunnable,
        RunnablePassthrough.assign({
          formatted: formattedAgent,
        })
      ]);

      // Execute the chain
      const result: MesocycleChainContext & {formatted: string} = await sequence.invoke({
        mesocycleOverview: mesocycleOverviewString,
        user,
        fitnessProfile,
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
