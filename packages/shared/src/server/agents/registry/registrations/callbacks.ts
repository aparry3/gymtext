/**
 * Callback Registrations
 *
 * Registers deterministic post-agent callbacks in the CallbackRegistry.
 * These run after agents complete, regardless of LLM decisions.
 */
import { callbackRegistry } from '../callbackRegistry';
import { getChatConfig } from '@/shared/config';

/**
 * Register all shared callbacks.
 * Called once during application initialization.
 */
export function registerCallbacks(): void {
  const { smsMaxLength: SMS_MAX_LENGTH } = getChatConfig();

  // Enforce SMS length constraints on agent response messages
  if (!callbackRegistry.has('enforce_sms_length')) {
    callbackRegistry.register({
      name: 'enforce_sms_length',
      description: 'Truncate messages that exceed SMS character limit',
      execute: async (context) => {
        const result = context.agentResult as { response?: string; messages?: string[] };
        if (!result) return;

        // Truncate response if needed
        if (result.response && result.response.length > SMS_MAX_LENGTH) {
          result.response = result.response.substring(0, SMS_MAX_LENGTH - 3) + '...';
        }

        // Truncate accumulated messages if needed
        if (result.messages) {
          result.messages = result.messages.map(msg => {
            if (msg && msg.length > SMS_MAX_LENGTH) {
              return msg.substring(0, SMS_MAX_LENGTH - 3) + '...';
            }
            return msg;
          });
        }
      },
    });
  }
}
