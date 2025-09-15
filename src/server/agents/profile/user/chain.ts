import { createSubAgent } from '../baseAgent';
import { buildUserPromptWithContext } from './prompt';
import type { UserWithProfile } from '../../../models/userModel';
import type { ProfileAgentConfig } from '../types';

/**
 * Create the User Agent - specialized for extracting user demographics and contact information
 * Handles both profile demographics (age, gender) and contact details (name, email, phone, timezone)
 */
export const createUserAgent = () => createSubAgent({
  promptBuilder: buildUserPromptWithContext,
  agentName: 'UserAgent',
  model: 'gpt-4-turbo',
  temperature: 0.2  // Low temperature for consistent demographic extraction
});

/**
 * Utility function to run user info extraction
 */
export const runUserExtraction = async (
  message: string,
  user: UserWithProfile,
  config?: ProfileAgentConfig
) => {
  const userAgent = createUserAgent();
  return await userAgent({ message, user, config });
};