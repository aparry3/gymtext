import { createAgent, type ConfigurableAgent, type ModelConfig } from '@/server/agents/configurable';
import { MicrocycleStructureSchema, type MicrocycleStructure } from '@/server/agents/training/schemas';
import {
  STRUCTURED_MICROCYCLE_SYSTEM_PROMPT,
  structuredMicrocycleUserPrompt,
  type MicrocycleGenerationOutput,
} from '../prompts';

/**
 * Configuration for structured microcycle agent
 */
export interface StructuredMicrocycleConfig {
  operationName?: string;
  agentConfig?: ModelConfig;
}

/**
 * Structured Microcycle Agent Factory
 *
 * Parses microcycle overview into structured MicrocycleStructure schema.
 * Uses gpt-5-nano with structured output for efficient, typed parsing.
 *
 * @param config - Configuration including operation name and agent config
 * @returns ConfigurableAgent that produces MicrocycleStructure
 */
export const createStructuredMicrocycleAgent = (
  config?: StructuredMicrocycleConfig
): ConfigurableAgent<{ response: MicrocycleStructure }> => {
  return createAgent({
    name: `structured-microcycle-${config?.operationName || 'default'}`,
    systemPrompt: STRUCTURED_MICROCYCLE_SYSTEM_PROMPT,
    userPrompt: (input: string) => {
      // Parse the JSON input from main agent
      const data = JSON.parse(input) as MicrocycleGenerationOutput & { absoluteWeek?: number };
      return structuredMicrocycleUserPrompt(
        data.overview,
        data.days,
        data.absoluteWeek ?? 0,
        data.isDeload
      );
    },
    schema: MicrocycleStructureSchema,
  }, { model: 'gpt-5-nano', maxTokens: 32000, ...config?.agentConfig });
};
