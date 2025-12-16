import { createAgent, type ConfigurableAgent, type ModelConfig } from '@/server/agents/configurable';
import { PlanStructureSchema, type PlanStructure } from '@/server/agents/training/schemas';
import {
  STRUCTURED_PLAN_SYSTEM_PROMPT,
  structuredPlanUserPrompt,
} from '../prompts';

/**
 * Configuration for structured plan agent
 */
export interface StructuredPlanConfig {
  operationName?: string;
  agentConfig?: ModelConfig;
}

/**
 * Structured Plan Agent Factory
 *
 * Parses fitness plan description into structured PlanStructure schema.
 * Uses gpt-5-nano with structured output for efficient, typed parsing.
 *
 * @param config - Configuration including operation name and agent config
 * @returns ConfigurableAgent that produces PlanStructure
 */
export const createStructuredPlanAgent = (
  config?: StructuredPlanConfig
): ConfigurableAgent<{ response: PlanStructure }> => {
  return createAgent({
    name: `structured-plan-${config?.operationName || 'default'}`,
    systemPrompt: STRUCTURED_PLAN_SYSTEM_PROMPT,
    userPrompt: (input: string) => {
      // Parse the JSON input or use as plain text
      let planText = input;
      try {
        const parsed = JSON.parse(input);
        planText = parsed.description || parsed.fitnessPlan || input;
      } catch {
        // Input is already plain text
      }
      return structuredPlanUserPrompt(planText);
    },
    schema: PlanStructureSchema,
  }, { model: 'gpt-5-nano', maxTokens: 32000, ...config?.agentConfig });
};
