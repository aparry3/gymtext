import { createSubAgent } from '../baseAgent';
import { buildGoalsPromptWithContext } from './prompt';
import { GoalsExtractionSchema, type GoalsExtractionResult } from './schema';
import type { UserWithProfile } from '../../../models/userModel';
import type { AgentConfig } from '../../base';

/**
 * Create the Goals Agent - specialized for extracting fitness goals data as JSON
 * This is the HIGHEST PRIORITY agent in the profile system.
 * Returns just the goals data - caller handles patch tool application.
 */
export const createGoalsAgent = () => createSubAgent({
  promptBuilder: buildGoalsPromptWithContext,
  agentName: 'GoalsAgent',
  outputSchema: GoalsExtractionSchema,
  temperature: 0.3  // Slightly higher for goals creativity
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