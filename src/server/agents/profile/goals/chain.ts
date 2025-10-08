import { createSubAgent } from '../baseAgent';
import { GOALS_SYSTEM_PROMPT, buildGoalsUserMessage } from './prompt';
import { GoalsExtractionSchema, type GoalsExtractionResult } from './schema';
import type { UserWithProfile } from '../../../models/userModel';
import type { AgentConfig } from '../../base';
import { RunnableLambda } from '@langchain/core/runnables';

/**
 * Create the Goals Agent - specialized for extracting fitness goals data as JSON
 * CONSERVATIVE: Only extracts goals when explicitly stated using goal language.
 * Returns just the goals data - caller handles patch tool application.
 */
export const createGoalsAgent = () => createSubAgent({
  systemPrompt: GOALS_SYSTEM_PROMPT,
  userMessageBuilder: buildGoalsUserMessage,
  agentName: 'GoalsAgent',
  outputSchema: GoalsExtractionSchema,
});

/**
 * Extract goals data from message
 * Returns: { data: { primary: 'endurance', specific: 'ski season', ... }, hasData: true, confidence: 0.85, reason: '...' }
 */
export const extractGoalsData = async (
  message: string,
  user: UserWithProfile,
  config?: AgentConfig
): Promise<GoalsExtractionResult> => {
  const goalsAgent = createGoalsAgent();
  return await goalsAgent({ message, user, config }) as GoalsExtractionResult;
};

/**
 * Create a runnable for extracting goals data
 * For use in RunnableMap with other profile subagents
 */
export const goalsRunnable = (config?: AgentConfig) => {
  return RunnableLambda.from(async (input: { message: string; user: UserWithProfile }) => {
    return await extractGoalsData(input.message, input.user, config);
  });
};