import { initializeModel, createRunnableAgent } from '../../base';
import { REPLY_AGENT_SYSTEM_PROMPT, buildReplyMessage } from './prompts';
import { ConversationFlowBuilder } from '@/server/services/flows/conversationFlowBuilder';
import type { ReplyInput, ReplyOutput, ReplyAgentDeps, ReplyAgentResponse } from './types';
import { ReplyAgentResponseSchema } from './types';

/**
 * Reply Agent Factory
 *
 * Generates immediate, natural replies that sound like a real trainer,
 * allowing for fast webhook responses. It can either:
 * 1. Provide full answers to general fitness questions (no full pipeline needed)
 * 2. Provide quick acknowledgments for updates/modifications (full pipeline needed)
 *
 * @param deps - Optional dependencies (config)
 * @returns Agent that generates replies with pipeline routing decisions
 */
export const createReplyAgent = (deps?: ReplyAgentDeps) => {
  return createRunnableAgent<ReplyInput, ReplyOutput>(async (input) => {
    const { user, message, previousMessages, currentWorkout, currentMicrocycle, fitnessPlan } = input;

    console.log('[REPLY AGENT] Generating quick reply for message:', message.substring(0, 50) + (message.length > 50 ? '...' : ''), {
      previousMessagesCount: previousMessages?.length || 0,
      hasCurrentWorkout: !!currentWorkout,
      hasSendWorkoutService: !!deps?.sendWorkoutMessage
    });

    // Build the context message
    const userMessage = buildReplyMessage(message, user, currentWorkout, currentMicrocycle, fitnessPlan);

    // Create the messages array with proper role structure
    const messages = [
      {
        role: 'system',
        content: REPLY_AGENT_SYSTEM_PROMPT,
      },
      // Add previous messages as structured message objects (last 3 for speed)
      ...ConversationFlowBuilder.toMessageArray(previousMessages?.slice(-3) || []),
      // Current user message
      {
        role: 'user',
        content: userMessage,
      }
    ];

    // Initialize model with structured output schema
    const model = initializeModel(ReplyAgentResponseSchema, deps?.config);

    // Invoke the model and get structured response
    const response = await model.invoke(messages) as ReplyAgentResponse;

    console.log('[REPLY AGENT] Generated reply:', {
      reply: response.reply.substring(0, 100) + (response.reply.length > 100 ? '...' : ''),
      needsFullPipeline: response.needsFullPipeline,
      resendWorkout: response.resendWorkout,
      reasoning: response.reasoning
    });

    // If agent wants to resend workout and service is available, execute it
    if (response.resendWorkout && deps?.sendWorkoutMessage && currentWorkout) {
      try {
        console.log('[REPLY AGENT] Resending current workout for user:', user.id);
        await deps.sendWorkoutMessage();
        console.log('[REPLY AGENT] Workout resent successfully');
      } catch (error) {
        console.error('[REPLY AGENT] Error resending workout:', error);
        // Continue anyway - we already have a response for the user
      }
    }

    return response;
  });
};

// Re-export types for backward compatibility
export type { ReplyAgentResponse } from './types';
export { ReplyAgentResponseSchema } from './types';
