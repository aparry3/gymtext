/**
 * Process Message Function (Inngest)
 *
 * Async function that processes inbound messages and generates responses.
 * Triggered by the 'message/received' event from the SMS webhook.
 *
 * Flow:
 * 1. Load user with profile
 * 2. Generate response using ChatService (can be slow)
 * 3. Send response via MessagingOrchestrator
 *
 * Benefits:
 * - Runs async (doesn't block webhook)
 * - Automatic retries on failure
 * - Step-by-step execution tracking
 * - Can send multiple messages over time
 */

import { inngest } from '@/server/connections/inngest/client';
import { createServicesFromDb } from '@/server/services';
import { postgresDb } from '@/server/connections/postgres/postgres';
import { getRunner } from '@/server/agent-runner/runner';
import { createNewChatService } from '@/server/agent-runner/services/newChatService';

// Create services container at module level (Inngest always uses production)
const services = createServicesFromDb(postgresDb);

const useAgentRunner = () => process.env.USE_AGENT_RUNNER === 'true';

export const processMessageFunction = inngest.createFunction(
  {
    id: 'process-message',
    name: 'Process Inbound Message',
    retries: 3, // Retry up to 3 times on failure
    debounce: {
      period: '10s',
      key: 'event.data.userId',
    },
  },
  { event: 'message/received' },
  async ({ event, step }) => {
    const { userId } = event.data;

    // Step 1: Generate response(s) (can be slow - LLM call)
    // Load user fresh in this step to avoid serialization issues
    const messages = await step.run('generate-response', async () => {
      console.log('[Inngest] Loading user and generating response:', userId);
      const user = await services.user.getUser(userId);

      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      // V2: Use agent-runner if enabled
      if (useAgentRunner()) {
        console.log('[Inngest] Using agent-runner V2 for chat');
        const newChat = createNewChatService({
          runner: getRunner(),
          message: services.message,
        });
        const chatMessages = await newChat.handleIncomingMessage(user);
        console.log('[Inngest] V2 response(s) generated, count:', chatMessages.length);
        return chatMessages;
      }

      // V1: Legacy path
      const chatMessages = await services.chat.handleIncomingMessage(user);
      console.log('[Inngest] Response(s) generated, count:', chatMessages.length);
      return chatMessages;
    });

    // If no messages to send, we're done
    if (!messages || messages.length === 0) {
      return {
        success: true,
        messageIds: [],
        messageCount: 0,
      };
    }

    // Step 2: Send messages sequentially via MessagingOrchestrator
    // Load user fresh again to avoid serialization issues
    const messageResults = await step.run('send-messages', async () => {
      console.log('[Inngest] Loading user and sending messages:', userId);
      const user = await services.user.getUser(userId);

      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      // Send each message sequentially using messagingOrchestrator
      const results = [];
      for (const message of messages) {
        const result = await services.messagingOrchestrator.sendImmediate(user, message);
        results.push(result);
      }

      return results;
    });

    console.log('[Inngest] Message processing complete:', {
      userId,
      messageCount: messageResults.length,
      messageIds: messageResults.map((r) => r.messageId).filter(Boolean),
    });

    return {
      success: true,
      messageIds: messageResults.map((r) => r.messageId).filter(Boolean),
      messageCount: messageResults.length,
    };
  }
);
