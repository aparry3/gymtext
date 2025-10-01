import { z } from 'zod';
import { createChatSubagentRunnable } from '../baseAgent';
import { buildUpdatesSystemPrompt } from './prompts';

/**
 * Schema for updates agent output
 */
export const UpdatesResponseSchema = z.object({
  response: z.string().describe('Supportive response acknowledging user updates and progress'),
});

export type UpdatesResponse = z.infer<typeof UpdatesResponseSchema>;

/**
 * Updates agent runnable - handles user progress updates and status reports
 */
export const updatesAgentRunnable = () =>
  createChatSubagentRunnable(buildUpdatesSystemPrompt, UpdatesResponseSchema, undefined, 'UPDATES');
