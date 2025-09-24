import { createSubAgent } from '../baseAgent';
import { buildUserPromptWithContext } from './prompt';
import { UserExtractionSchema, type UserExtractionResult } from './schema';
import type { UserWithProfile } from '../../../models/userModel';
import type { ProfileAgentConfig } from '../types';

/**
 * Create the User Agent - specialized for extracting user demographics and contact information
 * Handles both profile demographics (age, gender) and contact details (name, email, phone, timezone)
 * Returns structured user data - caller handles patch tool application.
 */
export const createUserAgent = () => createSubAgent({
  promptBuilder: buildUserPromptWithContext,
  agentName: 'UserAgent',
  outputSchema: UserExtractionSchema,
  model: 'gemini-2.5-flash',
  temperature: 0.2  // Low temperature for consistent demographic extraction
});

/**
 * Extract user data from message  
 * Returns: { data: { demographics: { age: 28, gender: 'male' }, contact: { name: 'John' } }, hasData: true, confidence: 0.95, reason: '...' }
 */
export const extractUserData = async (
  message: string,
  user: UserWithProfile,
  config?: ProfileAgentConfig
): Promise<UserExtractionResult> => {
  const userAgent = createUserAgent();
  return await userAgent({ message, user, config }) as UserExtractionResult;
};