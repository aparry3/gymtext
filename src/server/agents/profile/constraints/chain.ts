import { createSubAgent } from '../baseAgent';
import { buildConstraintsPromptWithContext } from './prompt';
import type { UserWithProfile } from '../../../models/userModel';
import type { ProfileAgentConfig } from '../types';

/**
 * Create the Constraints Agent - specialized for extracting injuries, limitations, and safety constraints
 * This handles SAFETY-CRITICAL information that affects workout modifications and exercise selection
 */
export const createConstraintsAgent = () => createSubAgent({
  promptBuilder: buildConstraintsPromptWithContext,
  agentName: 'ConstraintsAgent',
  model: 'gpt-4-turbo',
  temperature: 0.1  // Very low temperature for safety-critical constraint extraction
});

/**
 * Utility function to run constraints extraction
 */
export const runConstraintsExtraction = async (
  message: string,
  user: UserWithProfile,
  config?: ProfileAgentConfig
) => {
  const constraintsAgent = createConstraintsAgent();
  return await constraintsAgent({ message, user, config });
};