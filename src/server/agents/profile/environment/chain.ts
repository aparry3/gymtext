import { createSubAgent } from '../baseAgent';
import { buildEnvironmentPromptWithContext } from './prompt';
import { EnvironmentExtractionSchema, type EnvironmentExtractionResult } from './schema';
import type { UserWithProfile } from '../../../models/userModel';
import type { ProfileAgentConfig } from '../types';

/**
 * Create the Environment Agent - specialized for extracting equipment access and training availability
 * This handles the logistical aspects of training: where, when, and with what equipment
 * Returns structured environment data - caller handles patch tool application.
 */
export const createEnvironmentAgent = () => createSubAgent({
  promptBuilder: buildEnvironmentPromptWithContext,
  agentName: 'EnvironmentAgent',
  outputSchema: EnvironmentExtractionSchema,
  model: 'gpt-4o-mini',
  temperature: 0.2  // Low temperature for consistent environment extraction
});

/**
 * Extract environment data from message
 * Returns: { data: { equipmentAccess: { gymAccess: true, gymType: 'commercial' }, availability: { daysPerWeek: 4 } }, hasData: true, confidence: 0.85, reason: '...' }
 */
export const extractEnvironmentData = async (
  message: string,
  user: UserWithProfile,
  config?: ProfileAgentConfig
): Promise<EnvironmentExtractionResult> => {
  const environmentAgent = createEnvironmentAgent();
  return await environmentAgent({ message, user, config }) as EnvironmentExtractionResult;
};