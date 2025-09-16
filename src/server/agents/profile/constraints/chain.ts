import { createSubAgent } from '../baseAgent';
import { buildConstraintsPromptWithContext } from './prompt';
import { ConstraintsExtractionSchema, type ConstraintsExtractionResult } from './schema';
import type { UserWithProfile } from '../../../models/userModel';
import type { ProfileAgentConfig } from '../types';

/**
 * Create the Constraints Agent - specialized for extracting injuries, limitations, and safety constraints
 * This handles SAFETY-CRITICAL information that affects workout modifications and exercise selection
 * Returns structured constraints data - caller handles patch tool application.
 */
export const createConstraintsAgent = () => createSubAgent({
  promptBuilder: buildConstraintsPromptWithContext,
  agentName: 'ConstraintsAgent',
  outputSchema: ConstraintsExtractionSchema,
  model: 'gpt-5-nano',
  temperature: 0.1  // Very low temperature for safety-critical constraint extraction
});

/**
 * Extract constraints data from message
 * Returns: { data: [{ type: 'injury', description: 'bad back', severity: 'moderate', ... }], hasData: true, confidence: 0.9, reason: '...' }
 */
export const extractConstraintsData = async (
  message: string,
  user: UserWithProfile,
  config?: ProfileAgentConfig
): Promise<ConstraintsExtractionResult> => {
  const constraintsAgent = createConstraintsAgent();
  return await constraintsAgent({ message, user, config }) as ConstraintsExtractionResult;
};