import { createSubAgent } from '../baseAgent';
import { buildActivitiesPromptWithContext } from './prompt';
import { ActivitiesExtractionSchema, type ActivitiesExtractionResult } from './schema';
import type { UserWithProfile } from '../../../models/userModel';
import type { AgentConfig } from '../../base';
import { RunnableLambda } from '@langchain/core/runnables';

/**
 * Create the Activities Agent - specialized for extracting activity-specific data and experience
 * This is the SECOND HIGHEST PRIORITY agent - activity data is critical after goals
 * Returns structured activity data as array - caller handles patch tool application.
 */
export const createActivitiesAgent = () => createSubAgent({
  promptBuilder: buildActivitiesPromptWithContext,
  agentName: 'ActivitiesAgent',
  outputSchema: ActivitiesExtractionSchema,
  model: 'gemini-2.5-flash',
  temperature: 0.2  // Lower temperature for consistent activity extraction
});

/**
 * Extract activities data from message
 * Returns: { data: [{ type: 'strength', experience: 'beginner', ... }], hasData: true, confidence: 0.8, reason: '...' }
 */
export const extractActivitiesData = async (
  message: string,
  user: UserWithProfile,
  config?: AgentConfig
): Promise<ActivitiesExtractionResult> => {
  const activitiesAgent = createActivitiesAgent();
  return await activitiesAgent({ message, user, config }) as ActivitiesExtractionResult;
};

export const activitiesRunnable = (config?: AgentConfig) => {
  return RunnableLambda.from(async (input: { message: string; user: UserWithProfile }) => {
    return await extractActivitiesData(input.message, input.user, config);
  });
};