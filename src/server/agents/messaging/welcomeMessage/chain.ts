import { createRunnableAgent } from '@/server/agents/base';
import type { WelcomeMessageInput, WelcomeMessageOutput } from './types';

/**
 * Welcome Message Agent Factory
 *
 * Creates personalized welcome messages for new users.
 * Uses static template with user's first name and trainer name "Gymmy".
 *
 * @param deps - Optional dependencies (config)
 * @returns Agent that generates welcome messages
 */
export const createWelcomeMessageAgent = () => {
  return createRunnableAgent<WelcomeMessageInput, WelcomeMessageOutput>(async (input) => {
    const { user } = input;
    const firstName = user.name?.split(' ')[0] || 'there';

    const welcomeMessage = `Hey ${firstName}! Welcome to GymText 👋

I'm Gymmy, and I'm putting together your personalized plan now — built around your goals, schedule, and training experience.

I'll send over your plan shortly, along with a breakdown of how everything's structured and what your first week looks like. Pumped to get started 💪`;

    return { message: welcomeMessage };
  });
};