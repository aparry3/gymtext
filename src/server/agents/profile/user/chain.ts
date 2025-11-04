import { createSubAgent } from '../baseAgent';
import { USER_SYSTEM_PROMPT, buildUserUserMessage } from './prompts';
import { UserExtractionSchema, type UserExtractionResult } from './schema';
import type { UserWithProfile } from '../../../models/userModel';
import type { AgentConfig } from '../../base';
import { RunnableLambda } from '@langchain/core/runnables';

/**
 * Create the User Agent - specialized for extracting user demographics and contact information
 * Handles both profile demographics (age, gender) and contact details (name, email, phone, timezone)
 * Returns structured user data - caller handles patch tool application.
 */
export const createUserAgent = () => createSubAgent({
  systemPrompt: USER_SYSTEM_PROMPT,
  userMessageBuilder: buildUserUserMessage,
  agentName: 'UserAgent',
  outputSchema: UserExtractionSchema,
});

/**
 * Extract user data from message  
 * Returns: { data: { demographics: { age: 28, gender: 'male' }, contact: { name: 'John' } }, hasData: true, confidence: 0.95, reason: '...' }
 */
export const extractUserData = async (
  message: string,
  user: UserWithProfile,
  config?: AgentConfig
): Promise<UserExtractionResult> => {
  const userAgent = createUserAgent();
  return await userAgent({ message, user, config }) as UserExtractionResult;
};

export const userRunnable = (config?: AgentConfig) => {
  return RunnableLambda.from(async (input: { message: string; user: UserWithProfile }) => {
    return await extractUserData(input.message, input.user, config);
  });
};