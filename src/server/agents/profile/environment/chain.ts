import { createSubAgent } from '../baseAgent';
import { buildEnvironmentPromptWithContext } from './prompt';
import type { UserWithProfile } from '../../../models/userModel';
import type { ProfileAgentConfig } from '../types';

/**
 * Create the Environment Agent - specialized for extracting equipment access and training availability
 * This handles the logistical aspects of training: where, when, and with what equipment
 */
export const createEnvironmentAgent = () => createSubAgent({
  promptBuilder: buildEnvironmentPromptWithContext,
  agentName: 'EnvironmentAgent',
  model: 'gpt-4-turbo',
  temperature: 0.2  // Low temperature for consistent environment extraction
});

/**
 * Utility function to run environment extraction
 */
export const runEnvironmentExtraction = async (
  message: string,
  user: UserWithProfile,
  config?: ProfileAgentConfig
) => {
  const environmentAgent = createEnvironmentAgent();
  return await environmentAgent({ message, user, config });
};