import { z } from 'zod';
import { initializeModel, createRunnableAgent } from '@/server/agents/base';
import { SYSTEM_PROMPT, userPrompt } from './prompts';
import type { WeeklyMessageInput, WeeklyMessageOutput } from './types';

// Schema for the output
const WeeklyMessageSchema = z.object({
  feedbackMessage: z.string().describe("Message asking for feedback on the past week"),
  breakdownMessage: z.string().describe("Message with next week's training breakdown")
});

/**
 * Weekly Message Agent Factory
 *
 * Generates weekly check-in messages with:
 * 1. Feedback request for the past week
 * 2. Breakdown of next week's training pattern
 *
 * Handles mesocycle transitions with special messaging.
 *
 * @returns Agent that generates weekly check-in messages
 */
export const createWeeklyMessageAgent = () => {
  return createRunnableAgent<WeeklyMessageInput, WeeklyMessageOutput>(async (input) => {
    // Initialize model with structured output
    const model = initializeModel(WeeklyMessageSchema);

    // Generate prompt
    const prompt = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      { role: 'user' as const, content: userPrompt(input) }
    ];

    // Invoke model
    const result = await model.invoke(prompt);

    return {
      feedbackMessage: result.feedbackMessage,
      breakdownMessage: result.breakdownMessage
    };
  });
};
