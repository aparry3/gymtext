import { createSubAgent } from '../baseAgent';
import { buildActivitiesPromptWithContext } from './prompt';
import type { UserWithProfile } from '../../../models/userModel';
import type { ProfileAgentConfig } from '../types';

/**
 * Create the Activities Agent - specialized for extracting activity-specific data and experience
 * This is the SECOND HIGHEST PRIORITY agent - activity data is critical after goals
 */
export const createActivitiesAgent = () => createSubAgent({
  promptBuilder: buildActivitiesPromptWithContext,
  agentName: 'ActivitiesAgent',
  model: 'gpt-4-turbo',
  temperature: 0.2  // Lower temperature for consistent activity extraction
});

/**
 * Utility function to run activities extraction
 */
export const runActivitiesExtraction = async (
  message: string,
  user: UserWithProfile,
  config?: ProfileAgentConfig
) => {
  const activitiesAgent = createActivitiesAgent();
  return await activitiesAgent({ message, user, config });
};