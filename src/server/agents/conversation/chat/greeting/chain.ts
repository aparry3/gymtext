import { z } from 'zod';
import { createChatSubagentRunnable } from '../baseAgent';
import { buildGreetingSystemPrompt } from './prompts';

/**
 * Schema for greeting agent output
 */
export const GreetingResponseSchema = z.object({
  response: z.string().describe('Friendly response to greeting or general conversation'),
});

export type GreetingResponse = z.infer<typeof GreetingResponseSchema>;

/**
 * Greeting agent runnable - handles greetings, thanks, and general conversation
 */
export const greetingAgentRunnable = () =>
  createChatSubagentRunnable(buildGreetingSystemPrompt, GreetingResponseSchema);
