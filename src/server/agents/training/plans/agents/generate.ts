import { createAgent, type SubAgentBatch } from '@/server/agents/configurable';
import {
  FITNESS_PLAN_SYSTEM_PROMPT,
  fitnessPlanUserPrompt,
} from '../prompts';
import { createFormattedFitnessPlanAgent } from './formatted';
import { createFitnessPlanMessageAgent } from './message';
import { createStructuredPlanAgent } from './structured';
import type {
  FitnessPlanGenerateInput,
  FitnessPlanGenerateOutput,
  FitnessPlanGenerateAgentDeps,
} from '../types';

/**
 * Generate a fitness plan
 *
 * Uses the configurable agent pattern:
 * 1. Main agent generates structured text plan with split, deload rules, progression model
 * 2. SubAgents run in parallel: formatted, message, structure
 *
 * @param input - Fitness plan generation input (user)
 * @param deps - Optional dependencies (config)
 * @returns FitnessPlanGenerateOutput with response, formatted, message, and structure
 */
export const generateFitnessPlan = async (
  input: FitnessPlanGenerateInput,
  deps?: FitnessPlanGenerateAgentDeps
): Promise<FitnessPlanGenerateOutput> => {
  const { user } = input;

  // Create subAgents - all in one batch for parallel execution
  const subAgents: SubAgentBatch[] = [
    {
      formatted: createFormattedFitnessPlanAgent({
        operationName: 'generate',
        agentConfig: deps?.config,
      }),
      message: createFitnessPlanMessageAgent({
        operationName: 'generate',
        agentConfig: deps?.config,
      }),
      structure: createStructuredPlanAgent({
        operationName: 'generate',
        agentConfig: deps?.config,
      }),
    },
  ];

  const agent = createAgent({
    name: 'plan-generate',
    systemPrompt: FITNESS_PLAN_SYSTEM_PROMPT,
    subAgents,
  }, { model: 'gpt-5.1', ...deps?.config });

  // Build the user prompt
  const userPromptContent = fitnessPlanUserPrompt(user);

  const result = await agent.invoke(userPromptContent) as FitnessPlanGenerateOutput;

  console.log(`[plan-generate] Generated fitness plan for user ${user.id}`);

  return result;
};

/**
 * @deprecated Use generateFitnessPlan() instead
 * Factory function maintained for backward compatibility
 * Maps new output format to legacy format expected by services
 */
export const createFitnessPlanGenerateAgent = (deps?: FitnessPlanGenerateAgentDeps) => {
  return async (user: FitnessPlanGenerateInput['user']) => {
    const result = await generateFitnessPlan({ user }, deps);
    // Map new output format to legacy format
    return {
      description: result.response,
      formatted: result.formatted,
      message: result.message,
      structure: result.structure,
    };
  };
};

// Backwards-compatible alias
export const createFitnessPlanAgent = createFitnessPlanGenerateAgent;
