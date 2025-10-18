import { createSubAgent } from '../baseAgent';
import { CONSTRAINTS_SYSTEM_PROMPT, buildConstraintsUserMessage } from './prompts';
import { ConstraintsExtractionSchema, type ConstraintsExtractionResult } from './schema';
import type { UserWithProfile } from '../../../models/userModel';
import type { AgentConfig } from '../../base';
import { RunnableLambda } from '@langchain/core/runnables';

/**
 * Create the Constraints Agent - specialized for extracting injuries, limitations, and safety constraints
 * This handles SAFETY-CRITICAL information that affects workout modifications and exercise selection
 * Returns structured constraints data - caller handles patch tool application.
 */
export const createConstraintsAgent = () => createSubAgent({
  systemPrompt: CONSTRAINTS_SYSTEM_PROMPT,
  userMessageBuilder: buildConstraintsUserMessage,
  agentName: 'ConstraintsAgent',
  outputSchema: ConstraintsExtractionSchema,
  // model: 'gemini-2.5-flash',
  // temperature: 0.1  // Very low temperature for safety-critical constraint extraction
});

/**
 * Extract constraints data from message
 * Returns: { data: [{ type: 'injury', description: 'bad back', severity: 'moderate', ... }], hasData: true, confidence: 0.9, reason: '...' }
 */
export const extractConstraintsData = async (
  message: string,
  user: UserWithProfile,
  config?: AgentConfig
): Promise<ConstraintsExtractionResult> => {
  const constraintsAgent = createConstraintsAgent();
  return await constraintsAgent({ message, user, config }) as ConstraintsExtractionResult;
};

export const constraintsRunnable = (config?: AgentConfig) => {
  return RunnableLambda.from(async (input: { message: string; user: UserWithProfile }) => {
    return await extractConstraintsData(input.message, input.user, config);
  });
};