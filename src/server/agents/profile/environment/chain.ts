import { createSubAgent } from '../baseAgent';
import { buildEnvironmentPromptWithContext } from './prompt';
import { EnvironmentExtractionSchema, type EnvironmentExtractionResult } from './schema';
import type { UserWithProfile } from '../../../models/userModel';
import type { AgentConfig } from '../../base';
import { RunnableLambda } from '@langchain/core/runnables';

/**
 * Create the Environment Agent - specialized for extracting equipment access and training availability
 * This handles the logistical aspects of training: where, when, and with what equipment
 * Returns structured environment data - caller handles patch tool application.
 */
export const createEnvironmentAgent = () => createSubAgent({
  promptBuilder: buildEnvironmentPromptWithContext,
  agentName: 'EnvironmentAgent',
  outputSchema: EnvironmentExtractionSchema,
  model: 'gemini-2.5-flash',
  temperature: 0.2  // Low temperature for consistent environment extraction
});

/**
 * Extract environment data from message
 * Returns: { data: { equipmentAccess: { gymAccess: true, gymType: 'commercial' }, availability: { daysPerWeek: 4 } }, hasData: true, confidence: 0.85, reason: '...' }
 */
export const extractEnvironmentData = async (
  message: string,
  user: UserWithProfile,
  config?: AgentConfig
): Promise<EnvironmentExtractionResult> => {
  const environmentAgent = createEnvironmentAgent();
  return await environmentAgent({ message, user, config }) as EnvironmentExtractionResult;
};

export const environmentRunnable = (config?: AgentConfig) => {
  return RunnableLambda.from(async (input: { message: string; user: UserWithProfile }) => {
    return await extractEnvironmentData(input.message, input.user, config);
  });
};