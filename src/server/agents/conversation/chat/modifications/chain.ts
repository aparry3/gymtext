import { z } from 'zod';
import { createChatSubagentRunnable } from '../baseAgent';
import { buildModificationsSystemPrompt } from './prompts';

/**
 * Schema for modifications agent output
 */
export const ModificationsResponseSchema = z.object({
  response: z.string().describe('Flexible response addressing workout modification requests'),
  requiresNewWorkout: z.boolean().describe('Whether the request requires generating a new workout'),
  modificationDetails: z.object({
    type: z.enum(['exercise_swap', 'equipment_limitation', 'intensity_adjustment', 'skip_component', 'add_work', 'injury_workaround', 'complete_change']),
    specificExercise: z.string().optional().describe('Specific exercise mentioned for swap'),
    alternativeSuggested: z.string().optional().describe('Alternative exercise suggested in response'),
  }).optional(),
});

export type ModificationsResponse = z.infer<typeof ModificationsResponseSchema>;

/**
 * Modifications agent runnable - handles workout change and modification requests
 */
export const modificationsAgentRunnable = () =>
  createChatSubagentRunnable(buildModificationsSystemPrompt, ModificationsResponseSchema);
