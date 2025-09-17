import { createSubAgent } from '../baseAgent';
import { buildMetricsPromptWithContext } from './prompt';
import { MetricsExtractionSchema, type MetricsExtractionResult } from './schema';
import type { UserWithProfile } from '../../../models/userModel';
import type { ProfileAgentConfig } from '../types';

/**
 * Create the Metrics Agent - specialized for extracting physical measurements and fitness metrics
 * This handles quantitative health data: weight, height, body composition, and fitness level
 * Returns structured metrics data - caller handles patch tool application.
 */
export const createMetricsAgent = () => createSubAgent({
  promptBuilder: buildMetricsPromptWithContext,
  agentName: 'MetricsAgent',
  outputSchema: MetricsExtractionSchema,
  model: 'gpt-4o-mini',
  temperature: 0.1  // Very low temperature for precise numerical extraction
});

/**
 * Extract metrics data from message
 * Returns: { data: { weight: { value: 180, unit: 'lbs' }, height: 6.0, fitnessLevel: 'moderately_active' }, hasData: true, confidence: 0.95, reason: '...' }
 */
export const extractMetricsData = async (
  message: string,
  user: UserWithProfile,
  config?: ProfileAgentConfig
): Promise<MetricsExtractionResult> => {
  const metricsAgent = createMetricsAgent();
  return await metricsAgent({ message, user, config }) as MetricsExtractionResult;
};