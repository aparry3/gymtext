import { UserWithProfile } from '../../models/userModel';
import { FitnessPlan } from '../../models/fitnessPlan';
import { messagingClient } from '../../connections/messaging';
import { inngest } from '../../connections/inngest/client';
import { createWelcomeMessageAgent, planSummaryMessageAgent } from '../../agents';
import { workoutAgentService } from '../agents/training';
import { WorkoutInstance, EnhancedWorkoutInstance } from '../../models/workout';
import { Message } from '../../models/conversation';
import { MessageRepository } from '../../repositories/messageRepository';
import { postgresDb } from '../../connections/postgres/postgres';
import { CircuitBreaker } from '@/server/utils/circuitBreaker';
import { Json } from '../../models/_types';
import { UserService } from '../user/userService';
import { WorkoutInstanceService } from '../training/workoutInstanceService';

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
  /** User receiving the message */
  user: UserWithProfile;
  /** Message content */
  content: string;
  /** Phone number message is from */
  from: string;
  /** Phone number message is to */
  to: string;
  /** Optional Twilio webhook data */
  twilioData?: Record<string, unknown>;
}

/**
 * Result of ingesting an inbound message
 */
export interface IngestMessageResult {
  /** Inngest job ID for tracking (undefined if no async processing needed) */
  jobId?: string;
  /** Quick acknowledgment or full answer message */
  ackMessage: string;
  /** Action taken: resendWorkout, fullChatAgent, or null */
  action: 'resendWorkout' | 'fullChatAgent' | null;
  /** Reasoning for the decision (for debugging) */
  reasoning: string;
}

/**
 * Parameters for receiving an inbound message (sync path)
 */
export interface ReceiveMessageParams {
  /** User receiving the message */
  user: UserWithProfile;
  /** Message content */
  content: string;
  /** Phone number message is from */
  from: string;
  /** Phone number message is to */
  to: string;
  /** Optional Twilio webhook data */
  twilioData?: Record<string, unknown>;
  /** Optional callback to generate a response */
  responseGenerator?: (
    user: UserWithProfile,
    content: string
  ) => Promise<string>;
}

/**
 * Result of receiving an inbound message
 */
export interface ReceiveMessageResult {
  /** The generated response (if responseGenerator was provided) */
  response?: string;
  /** Whether the inbound message was stored successfully */
  inboundStored: boolean;
  /** Whether the outbound response was stored successfully (if response was generated) */
  outboundStored?: boolean;
}

/**
 * MessageService
 *
 * Handles message transport, storage, and flow orchestration.
 * Does NOT handle message content generation - that's for agents/generators.
 *
 * Responsibilities:
 * - Send messages via messaging clients (Twilio, local, etc.)
 * - Receive and store inbound messages
 * - Orchestrate message flow (receive → store → respond)
 * - Store outbound messages
 */
export class MessageService {
  private static instance: MessageService;
  private messageRepo: MessageRepository;
  private userService: UserService;
  private workoutInstanceService: WorkoutInstanceService;
  private circuitBreaker: CircuitBreaker;

  private constructor() {
    this.messageRepo = new MessageRepository(postgresDb);
    this.userService = UserService.getInstance();
    this.workoutInstanceService = WorkoutInstanceService.getInstance();
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      resetTimeout: 60000, // 1 minute
      monitoringPeriod: 60000 // 1 minute
    });
  }

  public static getInstance(): MessageService {
    if (!MessageService.instance) {
      MessageService.instance = new MessageService();
    }
    return MessageService.instance;
  }

  // ==========================================
  // Message Storage Methods
  // ==========================================

  /**
   * Store an inbound message to the database
   */
  async storeInboundMessage(params: StoreInboundMessageParams): Promise<Message | null> {
    return await this.circuitBreaker.execute(async () => {
      const { clientId, from, to, content, twilioData } = params;

      // Store the message directly (no conversation needed)
      const message = await this.messageRepo.create({
        conversationId: null, // No longer using conversations
        clientId: clientId,
        direction: 'inbound',
        content,
        phoneFrom: from,
        phoneTo: to,
        provider: 'twilio', // Inbound messages always come from Twilio webhook
        providerMessageId: (twilioData?.MessageSid as string) || null,
        metadata: (twilioData || {}) as Json
      });

      return message;
    });
  }

  /**
   * Store an outbound message to the database
   */
  async storeOutboundMessage(
    clientId: string,
    to: string,
    messageContent: string,
    from: string = process.env.TWILIO_NUMBER || '',
    provider: 'twilio' | 'local' | 'websocket' = 'twilio',
    providerMessageId?: string,
    metadata?: Record<string, unknown>
  ): Promise<Message | null> {
    // TODO: Implement periodic message summarization
    return await this.circuitBreaker.execute(async () => {

      const user = await this.userService.getUser(clientId);
      if (!user) {
        return null;
      }

      // Store the message with initial delivery tracking
      const message = await this.messageRepo.create({
        conversationId: null, // No longer using conversations
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

      // Optionally summarize messages periodically (implementation TBD)
      // For now, we'll skip summarization on every message to improve performance
      // const messages = await this.getRecentMessages(clientId, 50);
      // const summary = await this.summarizeMessages(user, messages);
      // Store summary somewhere (TBD - maybe in a separate summaries table)

      return message;
    });
  }

  /**
   * Get messages for a client with pagination support
   */
  async getMessages(clientId: string, limit: number = 50, offset: number = 0): Promise<Message[]> {
    return await this.messageRepo.findByClientId(clientId, limit, offset);
  }

  /**
   * Get recent messages for a client
   *
   * Convenience method for retrieving the most recent messages for a client.
   * Useful for passing conversation context to agents.
   *
   * @param clientId - The client ID
   * @param limit - Maximum number of recent messages to return (default: 10)
   * @returns Array of recent messages, ordered oldest to newest
   *
   * @example
   * ```typescript
   * // Get last 10 messages for context
   * const previousMessages = await messageService.getRecentMessages(clientId);
   * const response = await chatAgent(user, message, previousMessages);
   * ```
   */
  async getRecentMessages(clientId: string, limit: number = 10): Promise<Message[]> {
    // Get recent messages directly by clientId
    return await this.messageRepo.findRecentByClientId(clientId, limit);
  }

  /**
   * Split messages into pending (to be processed) and context (conversation history).
   *
   * Pure function - no DB calls. Used to separate messages that need responses
   * from messages that serve as conversation context.
   *
   * @param messages - Array of messages ordered oldest to newest
   * @param contextMinutes - Time window in minutes for context messages
   * @returns Object with pending (ALL inbound after last outbound) and context (messages within time window up to last outbound)
   */
  splitMessages(messages: Message[], contextMinutes: number): { pending: Message[]; context: Message[] } {
    // Calculate time threshold for context messages
    const cutoffTime = new Date(Date.now() - contextMinutes * 60 * 1000);

    // Find index of last outbound message
    let lastOutboundIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].direction === 'outbound') {
        lastOutboundIndex = i;
        break;
      }
    }

    // Pending: ALL inbound messages after last outbound (no time limit - always include unresponded messages)
    const pending = lastOutboundIndex >= 0
      ? messages.slice(lastOutboundIndex + 1)
      : messages.filter(m => m.direction === 'inbound');

    // Context: Messages up to last outbound, filtered by time window
    const allContext = lastOutboundIndex >= 0 ? messages.slice(0, lastOutboundIndex + 1) : [];
    const context = allContext.filter(m => new Date(m.createdAt) >= cutoffTime);

    return { pending, context };
  }

  /**
   * Get pending (unanswered) inbound messages for a client
   *
   * Retrieves the tail of inbound messages that have occurred since the last outbound message.
   * Used for batch processing in the debounced chat flow.
   *
   * @param clientId - The client ID
   * @returns Array of pending inbound messages, ordered oldest to newest
   */
  async getPendingMessages(clientId: string): Promise<Message[]> {
    // Get a reasonable batch of recent messages (e.g., last 20)
    // We assume the user hasn't sent more than 20 messages without a reply
    const recentMessages = await this.getRecentMessages(clientId, 20);

    const pendingMessages: Message[] = [];
    
    // Iterate backwards from the most recent message
    for (let i = recentMessages.length - 1; i >= 0; i--) {
      const message = recentMessages[i];
      
      // If we hit an outbound message, stop - we've found the break point
      if (message.direction === 'outbound') {
        break;
      }
      
      // Collect inbound messages
      if (message.direction === 'inbound') {
        pendingMessages.unshift(message); // Add to front to maintain time order
      }
    }
    
    return pendingMessages;
  }


  // ==========================================
  // Message Transport & Orchestration Methods
  // ==========================================

  /**
   * Ingest an inbound message (async path)
   *
   * Fast path for webhook acknowledgment:
   * 1. Store inbound message
   * 2. Queue processing job via Inngest
   * 3. Return success
   *
   * @returns IngestMessageResult with optional jobId
   */
  public async ingestMessage(params: IngestMessageParams): Promise<IngestMessageResult> {
    const { user, content, from, to, twilioData } = params;

    // Store the inbound message
    const storedMessage = await this.storeInboundMessage({
      clientId: user.id,
      from,
      to,
      content,
      twilioData
    });

    if (!storedMessage) {
      throw new Error('Failed to store inbound message');
    }

    // Always queue the message processing job via Inngest
    // The Inngest function handles debouncing and batch processing
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

    // Return simple acknowledgment
    return {
      jobId,
      ackMessage: '', // No immediate reply
      action: 'fullChatAgent', // Always full agent now
      reasoning: 'Queued for processing',
    };
  }

  /**
   * Send a message to a user
   * Stores the message and sends it via the configured messaging client
   * @param user - User to send message to
   * @param message - Optional message content (can be undefined for MMS-only messages)
   * @param mediaUrls - Optional array of media URLs for MMS (images, videos, etc.)
   * @returns The stored Message object
   */
  public async sendMessage(user: UserWithProfile, message?: string, mediaUrls?: string[]): Promise<Message> {
    // Get the provider from the messaging client
    const provider = messagingClient.provider;

    let stored: Message | null = null;
    try {
        stored = await this.storeOutboundMessage(
            user.id,
            user.phoneNumber,
            message || '[MMS only]', // Store placeholder for MMS-only messages
            undefined, // from (uses default)
            provider, // messaging provider
            undefined,  // providerMessageId (not available yet)
            mediaUrls ? { mediaUrls } : undefined // store media URLs in metadata
        );
        if (!stored) {
            console.warn('Circuit breaker prevented storing outbound message');
        }
        } catch (error) {
            // Log error but don't block SMS processing
            console.error('Failed to store outbound message:', error);
        }

    if (!stored) {
      throw new Error('Failed to store message');
    }

    // Send via messaging client and get the result
    const result = await messagingClient.sendMessage(user, message, mediaUrls);

    // Update the stored message with provider message ID from the send result
    if (result.messageId) {
      try {
        const messageRepo = new MessageRepository(postgresDb);
        await messageRepo.updateProviderMessageId(stored.id, result.messageId);
        console.log('[MessageService] Updated message with provider ID:', {
          messageId: stored.id,
          providerMessageId: result.messageId,
        });
      } catch (error) {
        console.error('[MessageService] Failed to update provider message ID:', error);
        // Don't throw - message was sent successfully
      }
    }

    // Simulate delivery for local messages (for queue processing)
    if (provider === 'local') {
      // Fire-and-forget delivery simulation (non-blocking)
      this.simulateLocalDelivery(stored.id).catch(error => {
        console.error('[MessageService] Local delivery simulation failed:', error);
      });
    }

    return stored;
  }

  /**
   * Simulate message delivery for local development
   *
   * Called when using the local messaging client to simulate the Twilio
   * webhook callback that normally triggers queue processing.
   *
   * @param messageId - ID of the message to mark as delivered
   */
  private async simulateLocalDelivery(messageId: string): Promise<void> {
    const delay = 1500; // 1.5 seconds to simulate realistic SMS timing
    console.log(`[MessageService] Simulating local delivery in ${delay}ms for message ${messageId}`);

    await new Promise(resolve => setTimeout(resolve, delay));

    // Update message delivery status in database
    await this.messageRepo.updateDeliveryStatus(messageId, 'delivered');

    // Trigger queue processing (simulates Twilio webhook calling queue service)
    const { messageQueueService } = await import('./messageQueueService');
    await messageQueueService.markMessageDelivered(messageId);

    console.log(`[MessageService] Local delivery simulation complete for message ${messageId}`);
  }

  /**
   * Send welcome message to a user
   * Wraps welcomeMessageAgent and sends the generated message
   * @returns The stored Message object
   */
  public async sendWelcomeMessage(user: UserWithProfile): Promise<Message> {
    const welcomeMessageAgent = createWelcomeMessageAgent();
    const agentResponse = await welcomeMessageAgent.invoke({ user });
    const welcomeMessage = agentResponse.message;
    return await this.sendMessage(user, welcomeMessage);
  }

  /**
   * Send fitness plan summary messages to a user
   * Wraps planSummaryMessageAgent and sends the generated messages
   * @param user - The user to send to
   * @param plan - The fitness plan to summarize
   * @param previousMessages - Optional previous messages for context
   * @returns Array of stored Message objects
   */
  public async sendPlanSummary(
    user: UserWithProfile,
    plan: FitnessPlan,
    previousMessages?: Message[]
  ): Promise<Message[]> {
    const agentResponse = await planSummaryMessageAgent({ user, plan, previousMessages });

    // Send each message in sequence
    const sentMessages: Message[] = [];
    for (const message of agentResponse.messages) {
      const storedMessage = await this.sendMessage(user, message);
      sentMessages.push(storedMessage);
      // Small delay between messages to ensure proper ordering
      if (agentResponse.messages.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    if (sentMessages.length === 0) {
      throw new Error('No messages were sent');
    }

    return sentMessages;
  }

  /**
   * Send workout message to a user
   * Generates SMS from workout data and sends it
   * @param user - The user to send to
   * @param workout - The workout instance (should have pre-generated message or description/reasoning)
   * @returns The stored Message object
   */
  public async sendWorkoutMessage(
    user: UserWithProfile,
    workout: WorkoutInstance | EnhancedWorkoutInstance
  ): Promise<Message> {
    let message: string;
    const workoutId = 'id' in workout ? workout.id : 'unknown';

    // Fast path: Use pre-generated message if available
    if ('message' in workout && workout.message) {
      console.log(`[MessageService] Using pre-generated message from workout ${workoutId}`);
      message = workout.message;
      return await this.sendMessage(user, message);
    }

    // Fallback: Generate from description/reasoning (shouldn't happen in production)
    if ('description' in workout && 'reasoning' in workout && workout.description && workout.reasoning) {
      console.log(`[MessageService] Generating fallback message for workout ${workoutId}`);

      try {
        // Get message agent from workout agent service
        const messageAgent = workoutAgentService.getMessageAgent();

        // Invoke with workout description string
        const result = await messageAgent.invoke(workout.description);
        message = result.response;

        // Save generated message for future use
        if ('id' in workout && workout.id) {
          await this.workoutInstanceService.updateWorkoutMessage(workout.id, message);
          console.log(`[MessageService] Saved fallback message to workout ${workout.id}`);
        }

        return await this.sendMessage(user, message);
      } catch (error) {
        console.error(`[MessageService] Failed to generate fallback message for workout ${workoutId}:`, error);
        throw new Error('Failed to generate workout message');
      }
    }

    // Should never reach here in production
    throw new Error(`Workout ${workoutId} missing required fields (description/reasoning or message) for SMS generation`);
  }
}

// Export singleton instance
export const messageService = MessageService.getInstance();