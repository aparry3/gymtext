/**
 * Chat Agent Registration
 *
 * Registers the chat:generate agent configuration in the AgentRegistry.
 * This is the main conversational agent that handles incoming SMS messages.
 *
 * The agent config is declarative - it references tools by name and
 * defines callbacks for post-execution side effects.
 */
import { agentRegistry } from '../agentRegistry';
import { PROMPT_IDS } from '../../promptIds';

/**
 * Register the chat agent configuration.
 * Called once during application initialization.
 */
export function registerChatAgent(): void {
  if (agentRegistry.has(PROMPT_IDS.CHAT_GENERATE)) return;

  agentRegistry.register({
    name: PROMPT_IDS.CHAT_GENERATE,
    // Prompts fetched from DB based on name
    tools: ['update_profile', 'get_workout', 'make_modification'],
    contextTypes: ['DATE_CONTEXT', 'CURRENT_WORKOUT'],
    callbacks: [
      { name: 'enforce_sms_length', when: 'on_success' },
    ],
  });
}
