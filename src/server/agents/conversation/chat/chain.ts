import { CHAT_TRIAGE_SYSTEM_PROMPT, buildTriageUserMessage } from '@/server/agents/conversation/chat/prompts';
import type { UserWithProfile } from '@/server/models/userModel';
import type { Message } from '@/server/models/messageModel';
import { initializeModel } from '../../base';
import { profileAgentRunnable } from '../../profile/chain';
import { RunnableLambda, RunnablePassthrough, RunnableSequence, Runnable } from '@langchain/core/runnables';
import { MessageIntent, TriageResult, TriageResultSchema } from './types';
import { ProfilePatchResult } from '@/server/services/fitnessProfileService';
import { updatesAgentRunnable } from './updates/chain';
import { questionsAgentRunnable } from './questions/chain';
import { modificationsAgentRunnable } from './modifications/chain';


const TriageActionMap: Record<MessageIntent, Runnable> = {
  'updates': updatesAgentRunnable(),
  'questions': questionsAgentRunnable(),
  'modifications': modificationsAgentRunnable(),
}
/**
 * ChatAgent - Generates conversational responses based on user profile
 *
 * This agent is responsible for generating the actual chat response
 * It receives the profile from UserProfileAgent and doesn't fetch it
 *
 * @param user - User with profile information
 * @param message - The incoming message from the user
 * @param previousMessages - Optional previous messages for conversation context
 */
export const chatAgent = async (
  user: UserWithProfile,
  message: string,
  previousMessages?: Message[],
) => {
  console.log('[CHAT AGENT] Starting chat agent for message:', message.substring(0, 50) + (message.length > 50 ? '...' : ''));

  // Sequence 1
  // 1. Create model
  // 2. Create Profile Runnable
  const profileRunnable = profileAgentRunnable();

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

    return result;
  });

  const sequence = RunnableSequence.from([
    parallel,
    actionRunnable,
  ]);

  const result = await sequence.invoke({ message, user, previousMessages });

  return result;
};