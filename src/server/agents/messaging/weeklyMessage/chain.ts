import { z } from 'zod';
import { initializeModel, createRunnableAgent } from '@/server/agents/base';
import { SYSTEM_PROMPT, userPrompt } from './prompts';
import type { WeeklyMessageInput, WeeklyMessageOutput } from './types';

// Schema for the output
const WeeklyMessageSchema = z.object({
  feedbackMessage: z.string().describe("Message asking for feedback on the past week")
});

/**
 * Weekly Message Agent Factory
 *
 * Generates weekly check-in feedback message asking about the user's past week.
 * The breakdown message is retrieved from the stored microcycle.message field.
 *
 * Handles mesocycle transitions with special messaging.
 *
 * @returns Agent that generates weekly feedback messages
 */
export const createWeeklyMessageAgent = () => {
  return createRunnableAgent<WeeklyMessageInput, WeeklyMessageOutput>(async (input) => {
    // Initialize model with structured output
    const model = initializeModel(WeeklyMessageSchema);

    const up = userPrompt(input);
    console.log(`[WeeklyMessageAgent] User prompt: ${up}`);
    // Generate prompt
    const prompt = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      { role: 'user' as const, content: up }
    ];

    // Invoke model
    const result = await model.invoke(prompt);

    return {
      feedbackMessage: result.feedbackMessage
    };
  });
};
