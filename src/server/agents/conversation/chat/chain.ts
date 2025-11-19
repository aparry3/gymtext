import { CHAT_TRIAGE_SYSTEM_PROMPT, buildTriageUserMessage } from '@/server/agents/conversation/chat/prompts';
import type { UserWithProfile } from '@/server/models/userModel';
import type { Message } from '@/server/models/messageModel';
import { initializeModel, createRunnableAgent } from '../../base';
import { createProfileAgent, type PatchProfileCallback } from '../../profile/chain';
import { RunnableLambda, RunnablePassthrough, RunnableSequence, Runnable } from '@langchain/core/runnables';
import { MessageIntent, TriageResult, TriageResultSchema, ChatInput, ChatAfterParallelInput, ChatOutput, ChatAgentDeps, IntentAnalysis } from './types';
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
    const { user, message, previousMessages, currentWorkout } = input;
  console.log('[CHAT AGENT] Starting chat agent for message:', message.substring(0, 50) + (message.length > 50 ? '...' : ''));

  // Create modification tools with injected services (DI pattern)
  const modificationTools = createModificationTools({
    modifyWorkout: deps.modifyWorkout,
    modifyWeek: deps.modifyWeek,
  });

  // Create triage action map with injected dependencies
  const TriageActionMap: Record<MessageIntent, Runnable> = {
    'updates': updatesAgentRunnable(),
    'modifications': createModificationsAgent({ tools: modificationTools }),
  };

  // Profile Runnable - extracts and updates user profile
  // Input: ChatInput (initial chain input)
  // Output: ProfilePatchResult
  const profileRunnable = createProfileAgent({
    patchProfile: deps.patchProfile,
  });

  // Triage Runnable - analyzes message intent
  // Input: ChatInput (initial chain input)
  // Output: TriageResult
  const routingRunnable = RunnableLambda.from(async (input: ChatInput): Promise<TriageResult> => {
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

  // Parallel Step - runs profile and triage in parallel
  // Input: ChatInput
  // Output: ChatAfterParallelInput (ChatInput + { profile, triage })
  const parallel = RunnablePassthrough.assign({
    profile: profileRunnable,
    triage: routingRunnable as any, // eslint-disable-line @typescript-eslint/no-explicit-any
  }) as unknown as RunnableSequence<ChatInput, ChatAfterParallelInput>;

  // Action Runnable - routes to appropriate subagent based on triage
  // Input: ChatAfterParallelInput (ChatInput + profile + triage)
  // Output: ChatOutput
  const actionRunnable = RunnableLambda.from(async (input: ChatAfterParallelInput): Promise<ChatOutput> => {
    // Find the intent with the highest confidence
    const primaryIntent = input.triage.intents.reduce((max: IntentAnalysis, current: IntentAnalysis) =>
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
    const agent = TriageActionMap[primaryIntent.intent as MessageIntent];

    // Log which sub-agent is being invoked
    console.log(`[CHAT AGENT] Invoking ${primaryIntent.intent} sub-agent with confidence ${primaryIntent.confidence}`);

    // Prepare the input for the subagent
    const subagentInput = {
      message: input.message,
      user: input.user,
      profile: input.profile,
      triage: input.triage,
      previousMessages: input.previousMessages,
      currentWorkout: input.currentWorkout,
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

    const result = await sequence.invoke({ message, user, previousMessages, currentWorkout });

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