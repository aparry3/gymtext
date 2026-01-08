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
 * 1. Receive event with clientId and queueName
 * 2. Load next pending message from queue
 * 3. Send message via MessageQueueService
 * 4. Wait for Twilio webhook to trigger next message
 */

import { inngest } from '@/server/connections/inngest/client';
import { createServicesFromDb } from '@/server/services';
import { postgresDb } from '@/server/connections/postgres/postgres';

// Create services container at module level (Inngest always uses production)
const services = createServicesFromDb(postgresDb);

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
    const { clientId, queueName } = event.data;

    await step.run('process-next-message', async () => {
      console.log('[Inngest] Processing next queued message:', { clientId, queueName });
      await services.messageQueue.processNextMessage(clientId, queueName);
    });

    return {
      success: true,
      clientId,
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
    const { queueEntryId, clientId, queueName } = event.data;

    const message = await step.run('send-message', async () => {
      console.log('[Inngest] Sending queued message:', { queueEntryId, clientId, queueName });
      return await services.messageQueue.sendQueuedMessage(queueEntryId);
    });

    return {
      success: true,
      messageId: message.id,
      queueEntryId,
    };
  }
);
