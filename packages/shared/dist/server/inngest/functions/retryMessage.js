/**
 * Retry Message Function (Inngest)
 *
 * Async function that retries failed message deliveries with exponential backoff.
 * Triggered by the 'message/delivery-failed' event from the status callback.
 *
 * Flow:
 * 1. Check delivery attempts (max 4)
 * 2. Wait using step.sleepUntil() with backoff (immediate, 5min, 30min)
 * 3. Retry sending the message
 * 4. Increment delivery attempts
 *
 * Benefits:
 * - Non-blocking sleep (no server capacity used)
 * - Custom backoff schedule
 * - Automatic tracking of attempts
 */
import { inngest } from '@/server/connections/inngest/client';
import { MessageRepository } from '@/server/repositories';
import { userService } from '@/server/services/user/userService';
import { messagingClient } from '@/server/connections/messaging';
import { postgresDb } from '@/server/connections/postgres/postgres';
// Retry delays in seconds: [immediate, 5min, 30min]
const RETRY_DELAYS = [0, 300, 1800];
const MAX_ATTEMPTS = 4; // Initial + 3 retries
export const retryMessageFunction = inngest.createFunction({
    id: 'retry-failed-message',
    name: 'Retry Failed Message Delivery',
    retries: 0, // We handle retries manually
}, { event: 'message/delivery-failed' }, async ({ event, step }) => {
    const { messageId, userId, error } = event.data;
    console.log('[Inngest Retry] Starting retry process:', {
        messageId,
        userId,
        error,
    });
    // Step 1: Load message and check attempts
    const messageCheck = await step.run('check-message', async () => {
        const messageRepo = new MessageRepository(postgresDb);
        const message = await messageRepo.findById(messageId);
        if (!message) {
            throw new Error(`Message ${messageId} not found`);
        }
        const attempts = message.deliveryAttempts || 1;
        console.log('[Inngest Retry] Message check:', {
            messageId,
            attempts,
            maxAttempts: MAX_ATTEMPTS,
        });
        return {
            message,
            attempts,
            shouldRetry: attempts < MAX_ATTEMPTS,
        };
    });
    // If max attempts reached, log and exit
    if (!messageCheck.shouldRetry) {
        console.error('[Inngest Retry] Max attempts reached, giving up:', {
            messageId,
            attempts: messageCheck.attempts,
            maxAttempts: MAX_ATTEMPTS,
        });
        return {
            success: false,
            reason: 'max_attempts_reached',
            attempts: messageCheck.attempts,
        };
    }
    // Step 2: Wait with backoff (if not first retry)
    const currentAttempt = messageCheck.attempts;
    const retryIndex = currentAttempt - 1; // 0-based index for RETRY_DELAYS
    if (retryIndex > 0 && retryIndex < RETRY_DELAYS.length) {
        const delaySeconds = RETRY_DELAYS[retryIndex];
        if (delaySeconds > 0) {
            const resumeAt = new Date(Date.now() + delaySeconds * 1000);
            console.log('[Inngest Retry] Sleeping before retry:', {
                messageId,
                attempt: currentAttempt,
                delaySeconds,
                resumeAt: resumeAt.toISOString(),
            });
            await step.sleepUntil('wait-before-retry', resumeAt);
            console.log('[Inngest Retry] Resuming after sleep:', {
                messageId,
                attempt: currentAttempt,
            });
        }
    }
    // Step 3: Load user and retry sending
    const retryResult = await step.run('retry-send-message', async () => {
        const messageRepo = new MessageRepository(postgresDb);
        const user = await userService.getUser(userId);
        if (!user) {
            throw new Error(`User ${userId} not found`);
        }
        const message = messageCheck.message;
        console.log('[Inngest Retry] Retrying message send:', {
            messageId,
            userId,
            attempt: currentAttempt + 1,
        });
        try {
            // Retry sending via messaging client
            const result = await messagingClient.sendMessage(user, message.content);
            // Update message with new provider message ID and increment attempts
            await messageRepo.incrementDeliveryAttempts(messageId);
            if (result.messageId) {
                await messageRepo.updateProviderMessageId(messageId, result.messageId);
            }
            // Update delivery status to queued (will be updated by status callback)
            await messageRepo.updateDeliveryStatus(messageId, 'queued');
            console.log('[Inngest Retry] Message retry successful:', {
                messageId,
                providerMessageId: result.messageId,
                attempt: currentAttempt + 1,
            });
            return {
                success: true,
                providerMessageId: result.messageId,
                attempt: currentAttempt + 1,
            };
        }
        catch (error) {
            console.error('[Inngest Retry] Retry send failed:', {
                messageId,
                attempt: currentAttempt + 1,
                error,
            });
            // Increment attempts even on failure
            await messageRepo.incrementDeliveryAttempts(messageId);
            // Update delivery status with error
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            await messageRepo.updateDeliveryStatus(messageId, 'failed', errorMessage);
            throw error;
        }
    });
    return retryResult;
});
