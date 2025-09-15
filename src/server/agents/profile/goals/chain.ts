import { createSubAgent } from '../baseAgent';
import { buildGoalsPromptWithContext } from './prompt';
import type { UserWithProfile } from '../../../models/userModel';
import type { ProfileAgentConfig } from '../types';

/**
 * Create the Goals Agent - specialized for extracting fitness goals and objectives
 * This is the HIGHEST PRIORITY agent in the profile system.
 */
export const createGoalsAgent = () => createSubAgent({
  promptBuilder: buildGoalsPromptWithContext,
  agentName: 'GoalsAgent',
  model: 'gpt-4-turbo',
  temperature: 0.3  // Slightly higher for goals creativity
});

/**
 * Utility function to run goals extraction
 */
export const runGoalsExtraction = async (
  message: string,
  user: UserWithProfile,
  config?: ProfileAgentConfig
) => {
  const goalsAgent = createGoalsAgent();
  return await goalsAgent({ message, user, config });
};