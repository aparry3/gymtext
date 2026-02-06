import type { MessagingOrchestratorInstance } from '@/server/services/orchestration/messagingOrchestrator';
import type { HookRegistry } from '../hookRegistry';
import { createSendMessageHook } from './sendMessage';

/**
 * Register all hook definitions with the hook registry
 */
export function registerAllHooks(
  registry: HookRegistry,
  deps: { messagingOrchestrator: MessagingOrchestratorInstance }
): void {
  registry.register('sendMessage', createSendMessageHook(deps.messagingOrchestrator));
}
