/**
 * Check Stalled Queues Cron (Inngest)
 *
 * Scheduled job that runs every 5 minutes to detect and recover
 * from stalled message queues.
 *
 * A queue is stalled when:
 * - Message has been in 'sent' status for > 10 minutes
 * - No delivery webhook received from Twilio
 *
 * Recovery:
 * 1. Query Twilio API for actual message status
 * 2. Update queue entry based on actual status
 * 3. Trigger next message if blocked
 *
 * This prevents queues from getting permanently stuck due to
 * missed webhooks or network issues.
 */

import { inngest } from '@/server/connections/inngest/client';
import { messageQueueService } from '@/server/services/messaging/messageQueueService';

export const checkStalledQueuesFunction = inngest.createFunction(
  {
    id: 'check-stalled-queues',
    name: 'Check Stalled Message Queues',
  },
  { cron: '*/5 * * * *' }, // Run every 5 minutes
  async ({ step }) => {
    const result = await step.run('check-stalled-messages', async () => {
      console.log('[Inngest] Checking for stalled message queues');
      await messageQueueService.checkStalledMessages();
      return { success: true };
    });

    return result;
  }
);
