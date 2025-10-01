import { z } from 'zod';
import { createChatSubagentRunnable } from '../baseAgent';
import { UPDATES_SYSTEM_PROMPT, buildUpdatesUserMessage } from './prompts';

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
  createChatSubagentRunnable(UPDATES_SYSTEM_PROMPT, buildUpdatesUserMessage, UpdatesResponseSchema, undefined, 'UPDATES');
