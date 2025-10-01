import { z } from 'zod';
import { createChatSubagentRunnable } from '../baseAgent';
import { MODIFICATIONS_SYSTEM_PROMPT, buildModificationsUserMessage } from './prompts';

/**
 * Schema for modifications agent output
 */
export const ModificationsResponseSchema = z.object({
    response: z.string().describe('achkonwledgment of the request and a response to the request'),
});

export type ModificationsResponse = z.infer<typeof ModificationsResponseSchema>;

/**
 * Modifications agent runnable - handles workout change and modification requests
 */
export const modificationsAgentRunnable = () =>
  createChatSubagentRunnable(MODIFICATIONS_SYSTEM_PROMPT, buildModificationsUserMessage, ModificationsResponseSchema, undefined, 'MODIFICATIONS');
