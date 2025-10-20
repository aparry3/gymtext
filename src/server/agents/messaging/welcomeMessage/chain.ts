import { createRunnableAgent } from '@/server/agents/base';
import type { WelcomeMessageInput, WelcomeMessageOutput } from './types';

/**
 * Welcome Message Agent Factory
 *
 * Creates personalized welcome messages for new users.
 * Uses static template with user's first name.
 *
 * @param deps - Optional dependencies (config)
 * @returns Agent that generates welcome messages
 */
export const createWelcomeMessageAgent = () => {
  return createRunnableAgent<WelcomeMessageInput, WelcomeMessageOutput>(async (input) => {
    const { user } = input;
    const userName = user.name?.split(' ')[0] || 'there';

    const welcomeMessage = `Hey ${userName}!

After you hit "Sign Up," millions of documents were scanned—each with one goal: to build the best plan for your fitness journey.

Then came the planning stage—millions of AI bots mapping, testing, and re-testing until your plan was dialed in. Working to the studs to perfect the product.

Now, as your first workout sends, the bots cheer…then back to work…and we at the GymText family smile as another perfect plan leaves the factory.

Welcome to GymText.

Text me anytime with questions about your workouts, your plan, or if you just need a little extra help!`;

    return { message: welcomeMessage };
  });
};

/**
 * @deprecated Legacy export for backward compatibility - use createWelcomeMessageAgent instead
 */
export const welcomeMessageAgent = {
  invoke: async ({ user }: { user: any }): Promise<{ user: any, value: string }> => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const agent = createWelcomeMessageAgent();
    const result = await agent.invoke({ user });
    return { user, value: result.message };
  }
};