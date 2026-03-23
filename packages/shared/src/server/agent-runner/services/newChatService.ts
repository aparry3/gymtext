/**
 * New Chat Service (V2)
 *
 * Handles incoming user messages using agent-runner.
 * Replaces the old ChatService (~120 lines) with ~30 lines.
 *
 * Flow:
 * 1. Fetch pending messages from DB
 * 2. Invoke chat agent with fitness context + session
 * 3. Return response(s)
 */
import type { Runner } from '@agent-runner/core';
import type { UserWithProfile } from '@/server/models/user';
import type { MessageServiceInstance } from '@/server/services/domain/messaging/messageService';
import { fitnessContextId, chatSessionId } from '../helpers';
import { agentLogger } from '../logger';

/** SMS max length and context window defaults (from ChatConfigSchema) */
const SMS_MAX_LENGTH = 1600;
const CHAT_CONTEXT_MINUTES = 10;

export interface NewChatServiceInstance {
  handleIncomingMessage(user: UserWithProfile): Promise<string[]>;
}

export interface NewChatServiceDeps {
  runner: Runner;
  message: MessageServiceInstance;
}

export function createNewChatService(deps: NewChatServiceDeps): NewChatServiceInstance {
  const { runner, message: messageService } = deps;

  return {
    async handleIncomingMessage(user: UserWithProfile): Promise<string[]> {
      const SVC = 'NewChatService';
      try {
        // Fetch recent messages and split into pending/context
        const allMessages = await messageService.getRecentMessages(user.id, 20);
        const { pending } = messageService.splitMessages(allMessages, CHAT_CONTEXT_MINUTES);

        if (pending.length === 0) {
          agentLogger.info({ service: SVC, event: 'no_pending_messages', userId: user.id });
          return [];
        }

        const userMessage = pending.map(m => m.content).join('\n\n');
        const timezone = user.timezone || 'America/New_York';

        agentLogger.info({ service: SVC, event: 'invoking', userId: user.id, agentId: 'chat', meta: { messageCount: pending.length } });

        // Invoke chat agent with fitness context and session history
        const result = await runner.invoke('chat', userMessage, {
          contextIds: [fitnessContextId(user.id)],
          sessionId: chatSessionId(user.id),
          toolContext: {
            runner,
            userId: user.id,
            timezone,
            user,
          },
        });

        agentLogger.invocation(SVC, user.id, result, 'chat');

        if (!result.output || !result.output.trim()) {
          throw new Error('Chat agent returned empty response');
        }

        // Enforce SMS length constraints
        const response = result.output.trim();
        if (response.length > SMS_MAX_LENGTH) {
          agentLogger.warn({ service: SVC, event: 'response_truncated', userId: user.id, meta: { originalLength: response.length } });
          return [response.substring(0, SMS_MAX_LENGTH - 3) + '...'];
        }

        return [response];
      } catch (error) {
        agentLogger.error({ service: SVC, event: 'error', userId: user.id, error: error instanceof Error ? error.message : String(error) });
        return ["Sorry, I'm having trouble processing that. Try asking about your workout or fitness goals!"];
      }
    },
  };
}
