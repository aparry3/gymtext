import type { MessagingOrchestratorInstance } from '@/server/services/orchestration/messagingOrchestrator';
import type { HookFn } from '../types';

/**
 * Create the sendMessage hook function
 *
 * Sends an immediate SMS message to the user via the messaging orchestrator.
 * Used as a preHook on modification tools to ack the user's request.
 */
export function createSendMessageHook(
  messagingOrchestrator: MessagingOrchestratorInstance
): HookFn {
  return async (user, value) => {
    await messagingOrchestrator.sendImmediate(user, String(value));
  };
}
