import { z } from 'zod';
import { createChatSubagentRunnable } from '../baseAgent';
import { QUESTIONS_SYSTEM_PROMPT, buildQuestionsUserMessage } from './prompts';

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
  createChatSubagentRunnable(QUESTIONS_SYSTEM_PROMPT, buildQuestionsUserMessage, QuestionsResponseSchema, undefined, 'QUESTIONS');
