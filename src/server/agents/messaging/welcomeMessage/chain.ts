import { UserWithProfile } from '@/server/models/userModel';

export const welcomeMessageAgent = {
  invoke: async ({ user }: { user: UserWithProfile }): Promise<{ user: UserWithProfile, value: string }> => {
    const userName = user.name?.split(' ')[0] || 'there';

    const welcomeMessage = `Hey ${userName}!

After you hit "Sign Up," millions of documents were scanned—each with one goal: to build the best plan for your fitness journey.

Then came the planning stage—millions of AI bots mapping, testing, and re-testing until your plan was dialed in. Working to the studs to perfect the product.

Now, as your first workout sends, the bots cheer…then back to work…and we at the GymText family smile as another perfect plan leaves the factory.

Welcome to GymText.

Text me anytime with questions about your workouts, your plan, or if you just need a little extra help!`;

    return { user, value: welcomeMessage };
  }
}