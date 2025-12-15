import { createAgent, type ConfigurableAgent, type ModelConfig } from '@/server/agents/configurable';
import {
  MICROCYCLE_MESSAGE_SYSTEM_PROMPT,
  microcycleMessageUserPrompt,
  type MicrocycleGenerationOutput,
} from '../prompts';

/**
 * Configuration for microcycle message agent
 */
export interface MicrocycleMessageConfig {
  operationName?: string;
  agentConfig?: ModelConfig;
}

/**
 * Microcycle Message Agent Factory
 *
 * Generates a friendly SMS message summarizing the weekly training pattern.
 * Uses gpt-5-nano for efficiency since this is a simple text transformation.
 *
 * @param config - Configuration including operation name and agent config
 * @returns ConfigurableAgent that generates SMS message
 */
export const createMicrocycleMessageAgent = (
  config?: MicrocycleMessageConfig
): ConfigurableAgent<{ response: string }> => {
  return createAgent({
    name: `message-microcycle-${config?.operationName || 'default'}`,
    systemPrompt: MICROCYCLE_MESSAGE_SYSTEM_PROMPT,
    userPrompt: (input: string) => {
      // Parse the JSON input from main agent
      const data = JSON.parse(input) as MicrocycleGenerationOutput;
      return microcycleMessageUserPrompt(data);
    },
  }, { model: 'gpt-5-nano', ...config?.agentConfig });
};
