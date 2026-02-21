/**
 * Chat Orchestration Service
 *
 * Orchestrates chat message handling by coordinating between:
 * - Message service (fetching/splitting messages)
 * - SimpleAgentRunner (AI response generation with tools)
 * - Dossier service (profile, plan, week context)
 *
 * This service handles:
 * - Message fetching and splitting (pending vs context)
 * - Fetching dossier context (profile, plan, week)
 * - SMS length constraint enforcement
 * - Error handling and fallback messages
 */
import type { UserWithProfile } from '@/server/models/user';
import { getChatConfig } from '@/shared/config';
import { getEnvironmentSettings } from '@/server/config';
import { now } from '@/shared/utils/date';
import type { MessageServiceInstance } from '../domain/messaging/messageService';
import type { UserServiceInstance } from '../domain/user/userService';
import type { MarkdownServiceInstance } from '../domain/markdown/markdownService';
import type { SimpleAgentRunnerInstance } from '@/server/agents/runner';

// Configuration from shared config
const { smsMaxLength: SMS_MAX_LENGTH, contextMinutes: CHAT_CONTEXT_MINUTES } = getChatConfig();

/**
 * ChatServiceInstance interface
 */
export interface ChatServiceInstance {
  handleIncomingMessage(user: UserWithProfile): Promise<string[]>;
}

export interface ChatServiceDeps {
  message: MessageServiceInstance;
  user: UserServiceInstance;
  markdown: MarkdownServiceInstance;
  agentRunner: SimpleAgentRunnerInstance;
}

/**
 * Create a ChatService instance with injected dependencies
 *
 * ChatService handles incoming SMS messages and generates AI-powered responses.
 * Context (profile, plan, week dossiers) is fetched and passed as XML-tagged strings.
 */
export function createChatService(deps: ChatServiceDeps): ChatServiceInstance {
  const {
    message: messageService,
    user: userService,
    markdown: markdownService,
    agentRunner: simpleAgentRunner,
  } = deps;

  return {
    async handleIncomingMessage(user: UserWithProfile): Promise<string[]> {
      try {
        // Single DB fetch: get enough messages for pending + context window
        const allMessages = await messageService.getRecentMessages(user.id, 20);

        // Split into pending (needs response) and context (conversation history)
        const { pending, context } = messageService.splitMessages(allMessages, CHAT_CONTEXT_MINUTES);

        // Early return if no pending messages
        if (pending.length === 0) {
          console.log('[ChatService] No pending messages, skipping');
          return [];
        }

        // Aggregate pending message content
        const message = pending.map(m => m.content).join('\n\n');

        console.log('[ChatService] Processing pending messages:', {
          pendingCount: pending.length,
          contextCount: context.length,
          aggregatedContent: message.substring(0, 100) + (message.length > 100 ? '...' : '')
        });

        // Fetch user with profile (if not already included)
        const userWithProfile = user.profile !== undefined
          ? user
          : await userService.getUser(user.id) || user;

        // Fetch dossier context in parallel
        const timezone = user.timezone || 'America/New_York';
        const todayDate = now(timezone).toJSDate();

        const [profileDossier, planDossier, weekDossier] = await Promise.all([
          markdownService.getProfile(user.id),
          markdownService.getPlan(user.id),
          markdownService.getWeekForDate(user.id, todayDate),
        ]);

        // Build context strings
        const dossierContext: string[] = [];
        if (profileDossier) {
          dossierContext.push(`<Profile>${profileDossier}</Profile>`);
        }
        if (planDossier?.content) {
          dossierContext.push(`<Plan>${planDossier.content}</Plan>`);
        } else if (planDossier?.description) {
          dossierContext.push(`<Plan>${planDossier.description}</Plan>`);
        }
        if (weekDossier?.content) {
          dossierContext.push(`<Week>${weekDossier.content}</Week>`);
        }

        // Convert context messages to the agent message format
        const previousMessages = context.map(m => ({
          role: m.direction === 'inbound' ? 'user' as const : 'assistant' as const,
          content: m.content,
        }));

        // Invoke chat agent via SimpleAgentRunner with dossier context
        const result = await simpleAgentRunner.invoke('chat:generate', {
          input: message,
          context: dossierContext,
          params: { user: userWithProfile },
          previousMessages,
        });

        // Map to ChatOutput format
        // Order: [agent's final response, ...accumulated tool messages]
        const messages = [result.response as string, ...(result.messages || [])].filter(m => m && m.trim());

        if (!messages || messages.length === 0) {
          throw new Error('Chat agent returned no messages');
        }

        // Enforce SMS length constraints on each message
        const validatedMessages = messages
          .filter((msg: string) => msg && msg.trim())
          .map((msg: string) => {
            const trimmed = msg.trim();
            if (trimmed.length > SMS_MAX_LENGTH) {
              return trimmed.substring(0, SMS_MAX_LENGTH - 3) + '...';
            }
            return trimmed;
          });

        return validatedMessages;

      } catch (error) {
        console.error('[ChatService] Error handling message:', error);

        // Log additional context in development
        if (getEnvironmentSettings().isDevelopment) {
          console.error('Error details:', {
            userId: user.id,
            error: error instanceof Error ? error.stack : error
          });
        }

        // Return a helpful fallback message
        return ["Sorry, I'm having trouble processing that. Try asking about your workout or fitness goals!"];
      }
    },
  };
}
