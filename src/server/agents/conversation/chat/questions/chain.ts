import { z } from 'zod';
import { createChatSubagentRunnable } from '../baseAgent';
import { buildQuestionsSystemPrompt } from './prompts';

/**
 * Schema for questions agent output
 */
export const QuestionsResponseSchema = z.object({
  response: z.string().describe('Educational response answering user questions about training and fitness'),
});

export type QuestionsResponse = z.infer<typeof QuestionsResponseSchema>;

/**
 * Questions agent runnable - handles user questions and information requests
 */
export const questionsAgentRunnable = () =>
  createChatSubagentRunnable(buildQuestionsSystemPrompt, QuestionsResponseSchema);
