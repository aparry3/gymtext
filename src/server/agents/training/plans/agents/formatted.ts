import { createAgent, type ConfigurableAgent, type ModelConfig } from '@/server/agents/configurable';
import {
  buildFormattedFitnessPlanSystemPrompt,
  createFormattedFitnessPlanUserPrompt,
} from '../prompts';

/**
 * Configuration for formatted fitness plan agent
 */
export interface FormattedFitnessPlanConfig {
  operationName: string;
  agentConfig?: ModelConfig;
}

/**
 * Formatted Fitness Plan Agent Factory
 *
 * Creates a beautifully formatted markdown document from a fitness plan description.
 * Uses the configurable agent pattern with userPrompt transformer.
 *
 * @param config - Configuration including operation name and agent config
 * @returns ConfigurableAgent that formats fitness plan output
 */
export const createFormattedFitnessPlanAgent = (
  config: FormattedFitnessPlanConfig
): ConfigurableAgent<{ response: string }> => {
  return createAgent({
    name: `formatted-plan-${config.operationName || 'default'}`,
    systemPrompt: buildFormattedFitnessPlanSystemPrompt(),
    userPrompt: (input: string) => {
      // Input can be a JSON string or plain text
      let planText = input;
      try {
        const parsed = JSON.parse(input);
        planText = parsed.description || parsed.fitnessPlan || input;
      } catch {
        // Input is already plain text
      }
      return createFormattedFitnessPlanUserPrompt(planText);
    },
  }, config.agentConfig);
};
