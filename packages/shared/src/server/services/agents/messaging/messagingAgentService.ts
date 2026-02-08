import type { UserWithProfile } from '@/server/models/user';
import type { FitnessPlan } from '@/server/models/fitnessPlan';
import type { Message } from '@/server/models/conversation';
import type { DayOfWeek } from '@/shared/utils/date';
import type { AgentRunnerInstance } from '@/server/agents/runner';

// =============================================================================
// Factory Pattern
// =============================================================================

/**
 * MessagingAgentServiceInstance interface
 */
export interface MessagingAgentServiceInstance {
  generateWelcomeMessage(user: UserWithProfile): Promise<string>;
  generatePlanSummary(user: UserWithProfile, plan: FitnessPlan, previousMessages?: Message[]): Promise<string[]>;
  generatePlanMicrocycleCombinedMessage(fitnessPlan: string, weekOne: string, currentWeekday: DayOfWeek): Promise<string>;
}

/**
 * Create a MessagingAgentService instance
 *
 * @param agentRunner - AgentRunner for invoking agents
 */
export function createMessagingAgentService(
  agentRunner: AgentRunnerInstance
): MessagingAgentServiceInstance {
  return {
    /**
     * Generate a welcome message for a new user
     * Simple template - no LLM needed
     */
    async generateWelcomeMessage(user: UserWithProfile): Promise<string> {
      const firstName = user.name?.split(' ')[0] || 'there';
      return `Hey ${firstName}!

After you hit "Sign Up," millions of documents were scanned—each with one goal: to build the best plan for your fitness journey.

Then came the planning stage—millions of AI bots mapping, testing, and re-testing until your plan was dialed in. Working to the studs to perfect the product.

Now, as your first workout sends, the bots cheer…then back to work…and we at the GymText family smile as another perfect plan leaves the factory.

Welcome to GymText.

Text me anytime with questions about your workouts, your plan, or if you just need a little extra help!`;
    },

    /**
     * Generate plan summary SMS messages
     * Uses DB prompt: messaging:plan-summary
     */
    async generatePlanSummary(
      user: UserWithProfile,
      plan: FitnessPlan,
      previousMessages?: Message[]
    ): Promise<string[]> {
      // Build context as message content
      const contextParts: string[] = [
        `<User>\nName: ${user.name}\n</User>`,
        `<Plan Details>\n${plan.description || 'No plan description available.'}\n</Plan Details>`,
      ];

      // Add continuation context if there are previous messages
      if (previousMessages && previousMessages.length > 0) {
        contextParts.push(
          'IMPORTANT: You are continuing a conversation that has already started. ' +
          'DO NOT greet the user by name again. DO NOT introduce yourself again. ' +
          'Just continue naturally with the plan summary.'
        );
      }

      // Convert previous messages to agent format
      const previousMsgs = previousMessages
        ? previousMessages.map(m => ({
            role: m.direction === 'inbound' ? 'user' as const : 'assistant' as const,
            content: m.content,
          }))
        : undefined;

      const result = await agentRunner.invoke('messaging:plan-summary', {
        user,
        message: contextParts.join('\n\n'),
        previousMessages: previousMsgs,
      });
      return (result.response as { messages: string[] }).messages;
    },

    /**
     * Generate combined plan ready message with microcycle
     * Uses DB prompt: messaging:plan-ready
     */
    async generatePlanMicrocycleCombinedMessage(
      fitnessPlan: string,
      weekOne: string,
      currentWeekday: DayOfWeek
    ): Promise<string> {
      const contextParts: string[] = [
        `<Fitness Plan>\n${fitnessPlan}\n</Fitness Plan>`,
        `<Week 1>\n${weekOne}\n</Week 1>`,
        `<Today>${currentWeekday}</Today>`,
      ];

      const result = await agentRunner.invoke('messaging:plan-ready', {
        message: contextParts.join('\n\n'),
      });
      return result.response as string;
    },
  };
}
