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
import { messageService, chatService } from '@/server/services';
import { UserRepository } from '@/server/repositories';

export const processMessageFunction = inngest.createFunction(
  {
    id: 'process-message',
    name: 'Process Inbound Message',
    retries: 3, // Retry up to 3 times on failure
  },
  { event: 'message/received' },
  async ({ event, step }) => {
    const { userId, conversationId, content } = event.data;

    // Step 1: Generate response (can be slow - LLM call)
    // Load user fresh in this step to avoid serialization issues
    const response = await step.run('generate-response', async () => {
      console.log('[Inngest] Loading user and generating response:', userId);
      const userRepo = new UserRepository();
      const user = await userRepo.findWithProfile(userId);

      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      const chatResponse = await chatService.handleIncomingMessage(
        user,
        content,
        conversationId
      );
      console.log('[Inngest] Response generated, length:', chatResponse.length);
      return chatResponse;
    });

    // Step 2: Send message
    // Load user fresh again to avoid serialization issues
    const messageResult = await step.run('send-message', async () => {
      console.log('[Inngest] Loading user and sending message:', userId);
      const userRepo = new UserRepository();
      const user = await userRepo.findWithProfile(userId);

      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      return await messageService.sendMessage(user, response);
    });

    console.log('[Inngest] Message processing complete:', {
      userId,
      conversationId,
      messageId: messageResult.messageId,
    });

    return {
      success: true,
      conversationId,
      messageId: messageResult.messageId,
      responseLength: response.length,
    };
  }
);
