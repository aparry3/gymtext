import { CHAT_TRIAGE_SYSTEM_PROMPT, buildTriageUserMessage } from '@/server/agents/conversation/chat/prompts';
import type { UserWithProfile } from '@/server/models/userModel';
import type { Message } from '@/server/models/messageModel';
import { initializeModel, createRunnableAgent } from '../../base';
import { createProfileAgent, type PatchProfileCallback } from '../../profile/chain';
import { RunnableLambda, RunnablePassthrough, RunnableSequence, Runnable } from '@langchain/core/runnables';
import { MessageIntent, TriageResult, TriageResultSchema, ChatInput, ChatOutput, ChatAgentDeps } from './types';
import { ProfilePatchResult } from '@/server/services';
import { updatesAgentRunnable } from './updates/chain';
// import { questionsAgentRunnable } from './questions/chain';
import { createModificationsAgent } from './modifications/chain';
import { createModificationTools, type WorkoutModificationService, type MicrocycleModificationService } from './modifications/tools';

// Re-export types for backward compatibility
export type { ChatAgentDeps, WorkoutModificationService, MicrocycleModificationService, PatchProfileCallback };

/**
 * Chat Agent Factory
 *
 * Generates conversational responses based on user profile.
 * Orchestrates profile extraction, triage, and subagent routing.
 *
 * Architecture:
 * 1. Profile Phase: Extract and update user profile (parallel)
 * 2. Triage Phase: Analyze message intent (parallel)
 * 3. Routing Phase: Route to appropriate subagent
 * 4. Response Generation: Return reply and profile state
 *
 * @param deps - Dependencies injected by the service (patchProfile callback, services)
 * @returns Agent that processes chat messages
 */
export const createChatAgent = (deps: ChatAgentDeps) => {
  return createRunnableAgent<ChatInput, ChatOutput>(async (input) => {
    const { user, message, previousMessages } = input;
  console.log('[CHAT AGENT] Starting chat agent for message:', message.substring(0, 50) + (message.length > 50 ? '...' : ''));

  // Create modification tools with injected services (DI pattern)
  const modificationTools = createModificationTools({
    workoutService: deps.workoutService,
    microcycleService: deps.microcycleService,
  });

  // Create triage action map with injected dependencies
  const TriageActionMap: Record<MessageIntent, Runnable> = {
    'updates': updatesAgentRunnable(),
    // 'questions': questionsAgentRunnable(),
    'modifications': createModificationsAgent({ tools: modificationTools }),
  };

  // Sequence 1
  // 1. Create model
  // 2. Create Profile Runnable with injected patchProfile callback
  const profileRunnable = createProfileAgent({
    patchProfile: deps.patchProfile,
  });

  const routingRunnable = RunnableLambda.from(async (input: { message: string, user: UserWithProfile }) => {
    // 3. Create Triage Runnable
    const userMessage = buildTriageUserMessage(input.message, input.user.timezone);
    const messages = [
      {
        role: 'system',
        content: CHAT_TRIAGE_SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: userMessage,
      }
    ]
    const model = initializeModel(TriageResultSchema);
    return await model.invoke(messages) as TriageResult;
  });

  // 4. Run Profile and Triage Runnables in parallel

  const parallel = RunnablePassthrough.assign({
    profile: profileRunnable,
    triage: routingRunnable,
  });

  const actionRunnable = RunnableLambda.from(async (input: { profile: ProfilePatchResult, triage: TriageResult, message: string, user: UserWithProfile, previousMessages?: Message[] }) => {
    // Find the intent with the highest confidence
    const primaryIntent = input.triage.intents.reduce((max, current) =>
      current.confidence > max.confidence ? current : max
    );

    // Log triage results
    console.log('[CHAT AGENT] Triage results:', {
      allIntents: input.triage.intents,
      primaryIntent: {
        intent: primaryIntent.intent,
        confidence: primaryIntent.confidence,
        reasoning: primaryIntent.reasoning
      }
    });

    // Get the appropriate agent for this intent
    const agent = TriageActionMap[primaryIntent.intent];

    // Log which sub-agent is being invoked
    console.log(`[CHAT AGENT] Invoking ${primaryIntent.intent} sub-agent with confidence ${primaryIntent.confidence}`);

    // Prepare the input for the subagent
    const subagentInput = {
      message: input.message,
      user: input.user,
      profile: input.profile,
      triage: input.triage,
      previousMessages: input.previousMessages,
    };

    // Invoke the appropriate subagent
    const result = await agent.invoke(subagentInput);

    console.log(`[CHAT AGENT] ${primaryIntent.intent} sub-agent completed successfully`);

    // Transform sub-agent output to ChatOutput format
    const profileUpdated = input.profile.summary?.reason !== 'No updates detected';

    return {
      response: result.response,
      profileUpdated,
    };
  });

  const sequence = RunnableSequence.from([
    parallel,
    actionRunnable,
  ]);

    const result = await sequence.invoke({ message, user, previousMessages });

    return result;
  });
};

/**
 * @deprecated Legacy export for backward compatibility - use createChatAgent instead
 */
export const chatAgent = async (
  deps: ChatAgentDeps,
  user: UserWithProfile,
  message: string,
  previousMessages?: Message[],
) => {
  const agent = createChatAgent(deps);
  return agent.invoke({ user, message, previousMessages });
};