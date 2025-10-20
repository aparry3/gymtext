import { createSubAgent } from '../baseAgent';
import { ACTIVITIES_SYSTEM_PROMPT, buildActivitiesUserMessage } from './prompts';
import { ActivitiesExtractionSchema, type ActivitiesExtractionResult } from './schema';
import type { UserWithProfile } from '../../../models/userModel';
import type { AgentConfig } from '../../base';
import { RunnableLambda } from '@langchain/core/runnables';

/**
 * Create the Activities Agent - specialized for extracting CURRENT/PAST activity data and experience
 * CONSERVATIVE: Only extracts information about what user CURRENTLY does or HAS DONE, not future aspirations
 * Returns structured activity data as array - caller handles patch tool application.
 */
export const createActivitiesAgent = () => createSubAgent({
  systemPrompt: ACTIVITIES_SYSTEM_PROMPT,
  userMessageBuilder: buildActivitiesUserMessage,
  agentName: 'ActivitiesAgent',
  outputSchema: ActivitiesExtractionSchema,
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