/**
 * Process Queued Message Function (Inngest)
 *
 * Handles ordered message delivery from message queues.
 * Triggered by queue events to send the next message in sequence.
 *
 * Events:
 * - 'message-queue/process-next': Find and trigger next pending message
 * - 'message-queue/send-message': Send a specific queued message
 *
 * Flow:
 * 1. Receive event with userId and queueName
 * 2. Load next pending message from queue
 * 3. Send message via MessageQueueService
 * 4. Wait for Twilio webhook to trigger next message
 */

import { inngest } from '@/server/connections/inngest/client';
import { messageQueueService } from '@/server/services/messaging/messageQueueService';

/**
 * Process next message in queue
 */
export const processNextQueuedMessageFunction = inngest.createFunction(
  {
    id: 'process-next-queued-message',
    name: 'Process Next Queued Message',
    retries: 2,
  },
  { event: 'message-queue/process-next' },
  async ({ event, step }) => {
    const { userId, queueName } = event.data;

    await step.run('process-next-message', async () => {
      console.log('[Inngest] Processing next queued message:', { userId, queueName });
      await messageQueueService.processNextMessage(userId, queueName);
    });

    return {
      success: true,
      userId,
      queueName,
    };
  }
);

/**
 * Send a specific queued message
 */
export const sendQueuedMessageFunction = inngest.createFunction(
  {
    id: 'send-queued-message',
    name: 'Send Queued Message',
    retries: 3,
  },
  { event: 'message-queue/send-message' },
  async ({ event, step }) => {
    const { queueEntryId, userId, queueName } = event.data;

    const message = await step.run('send-message', async () => {
      console.log('[Inngest] Sending queued message:', { queueEntryId, userId, queueName });
      return await messageQueueService.sendQueuedMessage(queueEntryId);
    });

    return {
      success: true,
      messageId: message.id,
      queueEntryId,
    };
  }
);
