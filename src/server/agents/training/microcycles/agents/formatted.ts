import { createAgent, type ConfigurableAgent, type ModelConfig } from '@/server/agents/configurable';
import {
  buildFormattedMicrocycleSystemPrompt,
  createFormattedMicrocycleUserPrompt,
  type MicrocycleGenerationOutput,
} from '../prompts';

/**
 * Configuration for formatted microcycle agent
 */
export interface FormattedMicrocycleConfig {
  operationName: string;
  weekNumber?: number;
  agentConfig?: ModelConfig;
}

/**
 * Formatted Microcycle Agent Factory
 *
 * Creates a beautifully formatted markdown document from a microcycle overview.
 * Uses the configurable agent pattern with userPrompt transformer.
 *
 * @param config - Configuration including operation name and agent config
 * @returns ConfigurableAgent that formats microcycle output
 */
export const createFormattedMicrocycleAgent = (
  config: FormattedMicrocycleConfig
): ConfigurableAgent<{ response: string }> => {
  return createAgent({
    name: `formatted-microcycle-${config.operationName || 'default'}`,
    systemPrompt: buildFormattedMicrocycleSystemPrompt(),
    userPrompt: (input: string) => {
      // Parse the JSON input from main agent
      const data = JSON.parse(input) as MicrocycleGenerationOutput & { absoluteWeek?: number };
      const weekNumber = config.weekNumber ?? data.absoluteWeek ?? 0;
      return createFormattedMicrocycleUserPrompt(data, weekNumber);
    },
  }, config.agentConfig);
};
