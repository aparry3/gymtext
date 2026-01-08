/**
 * Process Message Function (Inngest)
 *
 * Async function that processes inbound messages and generates responses.
 * Triggered by the 'message/received' event from the SMS webhook.
 *
 * Flow:
 * 1. Load user with profile
 * 2. Generate response using ChatService (can be slow)
 * 3. Send response via MessageService
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

// Create services container at module level (Inngest always uses production)
const services = createServicesFromDb(postgresDb);

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
    // ChatService handles fetching pending messages and splitting context internally
    const messages = await step.run('generate-response', async () => {
      console.log('[Inngest] Loading user and generating response:', userId);
      const user = await services.user.getUser(userId);

      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      // ChatService now handles:
      // - Fetching recent messages (single DB call)
      // - Splitting into pending vs context
      // - Aggregating pending message content
      // - Early return if no pending messages
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

    // Step 2: Send messages sequentially
    // Load user fresh again to avoid serialization issues
    const messageResults = await step.run('send-messages', async () => {
      console.log('[Inngest] Loading user and sending messages:', userId);
      const user = await services.user.getUser(userId);

      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      // Send each message sequentially
      const results = [];
      for (const message of messages) {
        const result = await services.message.sendMessage(user, message);
        results.push(result);
      }

      return results;
    });

    console.log('[Inngest] Message processing complete:', {
      userId,
      messageCount: messageResults.length,
      messageIds: messageResults.map(r => r.id),
    });

    return {
      success: true,
      messageIds: messageResults.map(r => r.id),
      messageCount: messageResults.length,
    };
  }
);
