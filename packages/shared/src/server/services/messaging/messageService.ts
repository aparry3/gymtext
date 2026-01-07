import { UserWithProfile } from '../../models/user';
import { FitnessPlan } from '../../models/fitnessPlan';
import { messagingClient } from '../../connections/messaging';
import { inngest } from '../../connections/inngest/client';
import { createWorkoutAgentService, type WorkoutAgentService } from '../agents/training';
import { WorkoutInstance, EnhancedWorkoutInstance } from '../../models/workout';
import { Message } from '../../models/conversation';
import { CircuitBreaker } from '@/server/utils/circuitBreaker';
import { getTwilioSecrets } from '@/server/config';
import type { RepositoryContainer } from '../../repositories/factory';
import type { UserServiceInstance } from '../user/userService';
import type { WorkoutInstanceServiceInstance } from '../training/workoutInstanceService';
import type { ContextService } from '../context';
import type { MessagingAgentServiceInstance } from '../agents/messaging/messagingAgentService';
import type { MessageQueueServiceInstance } from './messageQueueService';
import type { Json } from '../../models/_types';

/**
 * Parameters for storing an inbound message
 */
export interface StoreInboundMessageParams {
  clientId: string;
  from: string;
  to: string;
  content: string;
  twilioData?: Record<string, unknown>;
}

/**
 * Parameters for ingesting an inbound message (async path)
 */
export interface IngestMessageParams {
  user: UserWithProfile;
  content: string;
  from: string;
  to: string;
  twilioData?: Record<string, unknown>;
}

/**
 * Result of ingesting an inbound message
 */
export interface IngestMessageResult {
  jobId?: string;
  ackMessage: string;
  action: 'resendWorkout' | 'fullChatAgent' | null;
  reasoning: string;
}

/**
 * MessageServiceInstance interface
 */
export interface MessageServiceInstance {
  storeInboundMessage(params: StoreInboundMessageParams): Promise<Message | null>;
  storeOutboundMessage(
    clientId: string,
    to: string,
    messageContent: string,
    from?: string,
    provider?: 'twilio' | 'local' | 'websocket',
    providerMessageId?: string,
    metadata?: Record<string, unknown>
  ): Promise<Message | null>;
  getMessages(clientId: string, limit?: number, offset?: number): Promise<Message[]>;
  getRecentMessages(clientId: string, limit?: number): Promise<Message[]>;
  splitMessages(messages: Message[], contextMinutes: number): { pending: Message[]; context: Message[] };
  getPendingMessages(clientId: string): Promise<Message[]>;
  ingestMessage(params: IngestMessageParams): Promise<IngestMessageResult>;
  sendMessage(user: UserWithProfile, message?: string, mediaUrls?: string[]): Promise<Message>;
  sendWelcomeMessage(user: UserWithProfile): Promise<Message>;
  sendPlanSummary(user: UserWithProfile, plan: FitnessPlan, previousMessages?: Message[]): Promise<Message[]>;
  sendWorkoutMessage(user: UserWithProfile, workout: WorkoutInstance | EnhancedWorkoutInstance): Promise<Message>;
}

/**
 * Dependencies for MessageService
 */
export interface MessageServiceDeps {
  user: UserServiceInstance;
  workoutInstance: WorkoutInstanceServiceInstance;
  workoutAgent?: WorkoutAgentService;
  contextService?: ContextService;
  messagingAgent?: MessagingAgentServiceInstance;
  messageQueue?: MessageQueueServiceInstance;
}

/**
 * Create a MessageService instance with injected dependencies
 */
export function createMessageService(
  repos: RepositoryContainer,
  deps: MessageServiceDeps
): MessageServiceInstance {
  let workoutAgent: WorkoutAgentService | null = deps.workoutAgent ?? null;
  let messagingAgent: MessagingAgentServiceInstance | null = deps.messagingAgent ?? null;
  let messageQueue: MessageQueueServiceInstance | null = deps.messageQueue ?? null;

  const getWorkoutAgent = (): WorkoutAgentService => {
    if (!workoutAgent) {
      if (!deps.contextService) {
        throw new Error('MessageService requires either workoutAgent or contextService to be provided');
      }
      workoutAgent = createWorkoutAgentService(deps.contextService);
    }
    return workoutAgent;
  };

  const getMessagingAgent = async (): Promise<MessagingAgentServiceInstance> => {
    if (!messagingAgent) {
      const { createMessagingAgentService } = await import('../agents/messaging/messagingAgentService');
      messagingAgent = createMessagingAgentService();
    }
    return messagingAgent;
  };

  const getMessageQueue = async (): Promise<MessageQueueServiceInstance | null> => {
    if (!messageQueue) {
      // Lazy load message queue service if not provided
      const { createServicesFromDb } = await import('../factory');
      const { postgresDb } = await import('@/server/connections/postgres/postgres');
      const services = createServicesFromDb(postgresDb);
      messageQueue = services.messageQueue;
    }
    return messageQueue;
  };

  const circuitBreaker = new CircuitBreaker({
    failureThreshold: 5,
    resetTimeout: 60000,
    monitoringPeriod: 60000,
  });

  const simulateLocalDelivery = async (messageId: string): Promise<void> => {
    const delay = 1500;
    console.log(`[MessageService] Simulating local delivery in ${delay}ms for message ${messageId}`);

    await new Promise((resolve) => setTimeout(resolve, delay));

    await repos.message.updateDeliveryStatus(messageId, 'delivered');

    const queue = await getMessageQueue();
    if (queue) {
      await queue.markMessageDelivered(messageId);
    }

    console.log(`[MessageService] Local delivery simulation complete for message ${messageId}`);
  };

  const instance: MessageServiceInstance = {
    async storeInboundMessage(params: StoreInboundMessageParams): Promise<Message | null> {
      return await circuitBreaker.execute(async () => {
        const { clientId, from, to, content, twilioData } = params;

        const message = await repos.message.create({
          conversationId: null,
          clientId: clientId,
          direction: 'inbound',
          content,
          phoneFrom: from,
          phoneTo: to,
          provider: 'twilio',
          providerMessageId: (twilioData?.MessageSid as string) || null,
          metadata: (twilioData || {}) as Json,
        });

        return message;
      });
    },

    async storeOutboundMessage(
      clientId: string,
      to: string,
      messageContent: string,
      from: string = getTwilioSecrets().phoneNumber,
      provider: 'twilio' | 'local' | 'websocket' = 'twilio',
      providerMessageId?: string,
      metadata?: Record<string, unknown>
    ): Promise<Message | null> {
      return await circuitBreaker.execute(async () => {
        const user = await deps.user.getUser(clientId);
        if (!user) {
          return null;
        }

        const message = await repos.message.create({
          conversationId: null,
          clientId: clientId,
          direction: 'outbound',
          content: messageContent,
          phoneFrom: from,
          phoneTo: to,
          provider,
          providerMessageId: providerMessageId || null,
          metadata: (metadata || {}) as Json,
          deliveryStatus: 'queued',
          deliveryAttempts: 1,
          lastDeliveryAttemptAt: new Date(),
        });

        return message;
      });
    },

    async getMessages(clientId: string, limit: number = 50, offset: number = 0): Promise<Message[]> {
      return await repos.message.findByClientId(clientId, limit, offset);
    },

    async getRecentMessages(clientId: string, limit: number = 10): Promise<Message[]> {
      return await repos.message.findRecentByClientId(clientId, limit);
    },

    splitMessages(messages: Message[], contextMinutes: number): { pending: Message[]; context: Message[] } {
      const cutoffTime = new Date(Date.now() - contextMinutes * 60 * 1000);

      let lastOutboundIndex = -1;
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].direction === 'outbound') {
          lastOutboundIndex = i;
          break;
        }
      }

      const pending =
        lastOutboundIndex >= 0
          ? messages.slice(lastOutboundIndex + 1)
          : messages.filter((m) => m.direction === 'inbound');

      const allContext = lastOutboundIndex >= 0 ? messages.slice(0, lastOutboundIndex + 1) : [];
      const context = allContext.filter((m) => new Date(m.createdAt) >= cutoffTime);

      return { pending, context };
    },

    async getPendingMessages(clientId: string): Promise<Message[]> {
      const recentMessages = await this.getRecentMessages(clientId, 20);

      const pendingMessages: Message[] = [];

      for (let i = recentMessages.length - 1; i >= 0; i--) {
        const message = recentMessages[i];

        if (message.direction === 'outbound') {
          break;
        }

        if (message.direction === 'inbound') {
          pendingMessages.unshift(message);
        }
      }

      return pendingMessages;
    },

    async ingestMessage(params: IngestMessageParams): Promise<IngestMessageResult> {
      const { user, content, from, to, twilioData } = params;

      const storedMessage = await this.storeInboundMessage({
        clientId: user.id,
        from,
        to,
        content,
        twilioData,
      });

      if (!storedMessage) {
        throw new Error('Failed to store inbound message');
      }

      const { ids } = await inngest.send({
        name: 'message/received',
        data: {
          userId: user.id,
          content,
          from,
          to,
        },
      });
      const jobId = ids[0];

      console.log('[MessageService] Message stored and queued:', {
        userId: user.id,
        messageId: storedMessage.id,
        jobId,
      });

      return {
        jobId,
        ackMessage: '',
        action: 'fullChatAgent',
        reasoning: 'Queued for processing',
      };
    },

    async sendMessage(user: UserWithProfile, message?: string, mediaUrls?: string[]): Promise<Message> {
      const provider = messagingClient.provider;

      let stored: Message | null = null;
      try {
        stored = await this.storeOutboundMessage(
          user.id,
          user.phoneNumber,
          message || '[MMS only]',
          undefined,
          provider,
          undefined,
          mediaUrls ? { mediaUrls } : undefined
        );
        if (!stored) {
          console.warn('Circuit breaker prevented storing outbound message');
        }
      } catch (error) {
        console.error('Failed to store outbound message:', error);
      }

      if (!stored) {
        throw new Error('Failed to store message');
      }

      const result = await messagingClient.sendMessage(user, message, mediaUrls);

      if (result.messageId) {
        try {
          await repos.message.updateProviderMessageId(stored.id, result.messageId);
          console.log('[MessageService] Updated message with provider ID:', {
            messageId: stored.id,
            providerMessageId: result.messageId,
          });
        } catch (error) {
          console.error('[MessageService] Failed to update provider message ID:', error);
        }
      }

      if (provider === 'local') {
        simulateLocalDelivery(stored.id).catch((error) => {
          console.error('[MessageService] Local delivery simulation failed:', error);
        });
      }

      return stored;
    },

    async sendWelcomeMessage(user: UserWithProfile): Promise<Message> {
      const agent = await getMessagingAgent();
      const welcomeMessage = await agent.generateWelcomeMessage(user);
      return await this.sendMessage(user, welcomeMessage);
    },

    async sendPlanSummary(
      user: UserWithProfile,
      plan: FitnessPlan,
      previousMessages?: Message[]
    ): Promise<Message[]> {
      const agent = await getMessagingAgent();
      const generatedMessages = await agent.generatePlanSummary(user, plan, previousMessages);

      const sentMessages: Message[] = [];
      for (const message of generatedMessages) {
        const storedMessage = await this.sendMessage(user, message);
        sentMessages.push(storedMessage);
        if (generatedMessages.length > 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      if (sentMessages.length === 0) {
        throw new Error('No messages were sent');
      }

      return sentMessages;
    },

    async sendWorkoutMessage(
      user: UserWithProfile,
      workout: WorkoutInstance | EnhancedWorkoutInstance
    ): Promise<Message> {
      let message: string;
      const workoutId = 'id' in workout ? workout.id : 'unknown';

      if ('message' in workout && workout.message) {
        console.log(`[MessageService] Using pre-generated message from workout ${workoutId}`);
        message = workout.message;
        return await this.sendMessage(user, message);
      }

      if ('description' in workout && 'reasoning' in workout && workout.description && workout.reasoning) {
        console.log(`[MessageService] Generating fallback message for workout ${workoutId}`);

        try {
          const messageAgent = await getWorkoutAgent().getMessageAgent();
          const result = await messageAgent.invoke(workout.description);
          message = result.response;

          if ('id' in workout && workout.id) {
            await deps.workoutInstance.updateWorkoutMessage(workout.id, message);
            console.log(`[MessageService] Saved fallback message to workout ${workout.id}`);
          }

          return await this.sendMessage(user, message);
        } catch (error) {
          console.error(`[MessageService] Failed to generate fallback message for workout ${workoutId}:`, error);
          throw new Error('Failed to generate workout message');
        }
      }

      throw new Error(
        `Workout ${workoutId} missing required fields (description/reasoning or message) for SMS generation`
      );
    },
  };

  return instance;
}

// =============================================================================
