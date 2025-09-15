import { createSubAgent } from '../baseAgent';
import { buildMetricsPromptWithContext } from './prompt';
import type { UserWithProfile } from '../../../models/userModel';
import type { ProfileAgentConfig } from '../types';

/**
 * Create the Metrics Agent - specialized for extracting physical measurements and fitness metrics
 * This handles quantitative health data: weight, height, body composition, and fitness level
 */
export const createMetricsAgent = () => createSubAgent({
  promptBuilder: buildMetricsPromptWithContext,
  agentName: 'MetricsAgent',
  model: 'gpt-4-turbo',
  temperature: 0.1  // Very low temperature for precise numerical extraction
});

/**
 * Utility function to run metrics extraction
 */
export const runMetricsExtraction = async (
  message: string,
  user: UserWithProfile,
  config?: ProfileAgentConfig
) => {
  const metricsAgent = createMetricsAgent();
  return await metricsAgent({ message, user, config });
};