import { createAgent, type ConfigurableAgent, type ModelConfig } from '@/server/agents/configurable';
import type { UserWithProfile } from '@/server/models/userModel';
import {
  PLAN_SUMMARY_MESSAGE_SYSTEM_PROMPT,
  planSummaryMessageUserPrompt,
} from '../prompts';

/**
 * Configuration for fitness plan message agent
 */
export interface FitnessPlanMessageConfig {
  operationName?: string;
  agentConfig?: ModelConfig;
}

/**
 * Fitness Plan Message Agent Factory
 *
 * Generates a friendly SMS message summarizing the fitness plan.
 * Uses gpt-5-nano for efficiency since this is a simple text transformation.
 *
 * @param config - Configuration including operation name and agent config
 * @returns ConfigurableAgent that generates SMS message
 */
export const createFitnessPlanMessageAgent = (
  config?: FitnessPlanMessageConfig
): ConfigurableAgent<{ response: string }> => {
  return createAgent({
    name: `message-plan-${config?.operationName || 'default'}`,
    systemPrompt: PLAN_SUMMARY_MESSAGE_SYSTEM_PROMPT,
    userPrompt: (input: string) => {
      // Parse the JSON input from main agent
      try {
        const parsed = JSON.parse(input);
        const user = parsed.user as UserWithProfile;
        const overview = parsed.description || parsed.fitnessPlan || '';
        return planSummaryMessageUserPrompt(user, overview);
      } catch {
        // Fallback for plain text input
        return `Generate a short, friendly SMS about this fitness plan:\n\n${input}`;
      }
    },
  }, { model: 'gpt-5-nano', ...config?.agentConfig });
};
