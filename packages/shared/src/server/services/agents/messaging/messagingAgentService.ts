import { createAgent, AGENTS, type Message as AgentMessage } from '@/server/agents';
import type { UserWithProfile } from '@/server/models/user';
import type { FitnessPlan } from '@/server/models/fitnessPlan';
import type { Message } from '@/server/models/conversation';
import type { DayOfWeek } from '@/shared/utils/date';
import { PlanSummarySchema } from '../schemas/messaging';
import { ConversationFlowBuilder } from '@/server/services/flows/conversationFlowBuilder';
import type { AgentDefinitionServiceInstance } from '@/server/services/domain/agents/agentDefinitionService';

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
 * Uses createAgent pattern with definitions from agentDefinitionService
 *
 * @param agentDefinitionService - AgentDefinitionService for resolving agent definitions
 */
export function createMessagingAgentService(
  agentDefinitionService: AgentDefinitionServiceInstance
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
      // Build context array with user/plan data
      const context: string[] = [
        `<User>\nName: ${user.name}\n</User>`,
        `<Plan Details>\n${plan.description || 'No plan description available.'}\n</Plan Details>`,
      ];

      // Add continuation context if there are previous messages
      if (previousMessages && previousMessages.length > 0) {
        context.push(
          'IMPORTANT: You are continuing a conversation that has already started. ' +
          'DO NOT greet the user by name again. DO NOT introduce yourself again. ' +
          'Just continue naturally with the plan summary.'
        );
      }

      // Convert previous messages to agent message format
      const previousMsgs: AgentMessage[] | undefined = previousMessages
        ? ConversationFlowBuilder.toMessageArray(previousMessages).map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          }))
        : undefined;

      // Get resolved definition and create agent
      const definition = await agentDefinitionService.getDefinition(AGENTS.MESSAGING_PLAN_SUMMARY, {
        schema: PlanSummarySchema,
      });

      const agent = createAgent(definition);

      const result = await agent.invoke({
        message: '',
        context,
        previousMessages: previousMsgs,
      });
      return result.response.messages;
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
      // Build context array with plan/week data
      const context: string[] = [
        `<Fitness Plan>\n${fitnessPlan}\n</Fitness Plan>`,
        `<Week 1>\n${weekOne}\n</Week 1>`,
        `<Today>${currentWeekday}</Today>`,
      ];

      const definition = await agentDefinitionService.getDefinition(AGENTS.MESSAGING_PLAN_READY);

      const agent = createAgent(definition);

      const result = await agent.invoke({ message: '', context });
      return result.response;
    },
  };
}
