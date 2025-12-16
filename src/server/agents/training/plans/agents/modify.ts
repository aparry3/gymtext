import { createAgent, type SubAgentBatch } from '@/server/agents/configurable';
import { PlanStructureSchema } from '@/server/agents/training/schemas';
import {
  FITNESS_PLAN_MODIFY_SYSTEM_PROMPT,
  modifyFitnessPlanUserPrompt,
  ModifyFitnessPlanOutputSchema,
  STRUCTURED_PLAN_SYSTEM_PROMPT,
  structuredPlanUserPrompt,
} from '../prompts';
import type {
  ModifyFitnessPlanInput,
  ModifyFitnessPlanOutput,
  ModifyFitnessPlanAgentDeps,
} from '../types';

/**
 * Helper to extract plan description from the modify response JSON string
 */
const extractPlanDescription = (jsonString: string): string => {
  try {
    const parsed = JSON.parse(jsonString);
    return parsed.description || jsonString;
  } catch {
    return jsonString;
  }
};

/**
 * Modify an existing fitness plan based on user constraints
 *
 * Uses the configurable agent pattern:
 * 1. Main agent generates modified plan with structured output
 * 2. SubAgents run in parallel: structure (extracting description from JSON)
 *
 * @param input - Fitness plan modification input (user, currentPlan, changeRequest)
 * @param deps - Optional dependencies (config)
 * @returns ModifyFitnessPlanOutput with response and structure
 */
export const modifyFitnessPlan = async (
  input: ModifyFitnessPlanInput,
  deps?: ModifyFitnessPlanAgentDeps
): Promise<ModifyFitnessPlanOutput> => {
  // SubAgents that extract description from structured JSON response
  const subAgents: SubAgentBatch[] = [
    {
      structure: createAgent({
        name: 'structure-modify',
        systemPrompt: STRUCTURED_PLAN_SYSTEM_PROMPT,
        userPrompt: (jsonInput: string) => structuredPlanUserPrompt(extractPlanDescription(jsonInput)),
        schema: PlanStructureSchema,
      }, { model: 'gpt-5-nano', maxTokens: 32000, ...deps?.config }),
    },
  ];

  // Build the user prompt using the existing function
  const userPromptContent = modifyFitnessPlanUserPrompt({
    userProfile: input.user.profile || '',
    currentPlan: input.currentPlan,
    changeRequest: input.changeRequest,
  });

  const agent = createAgent({
    name: 'plan-modify',
    systemPrompt: FITNESS_PLAN_MODIFY_SYSTEM_PROMPT,
    schema: ModifyFitnessPlanOutputSchema,
    subAgents,
  }, { model: 'gpt-5.1', ...deps?.config });

  const result = await agent.invoke(userPromptContent) as ModifyFitnessPlanOutput;

  console.log(`[plan-modify] Modified fitness plan, wasModified: ${result.response.wasModified}`);

  return result;
};

/**
 * @deprecated Use modifyFitnessPlan() instead
 * Factory function maintained for backward compatibility
 * Maps new output format to legacy format expected by services
 */
export const createModifyFitnessPlanAgent = (deps?: ModifyFitnessPlanAgentDeps) => ({
  name: 'plan-modify',
  invoke: async (input: ModifyFitnessPlanInput) => {
    const result = await modifyFitnessPlan(input, deps);
    // Map new output format to legacy format
    return {
      description: result.response.description,
      wasModified: result.response.wasModified,
      modifications: result.response.modifications,
      structure: result.structure,
    };
  },
});
