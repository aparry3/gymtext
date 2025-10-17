import { UserWithProfile } from '../models/userModel';
import { FitnessPlan } from '../models/fitnessPlan';
import { messagingClient } from '../connections/messaging';
import { ConversationService } from './conversationService';
import { inngest } from '../connections/inngest/client';
import { replyAgent } from '../agents/conversation/reply/chain';
import { welcomeMessageAgent, planSummaryMessageAgent } from '../agents';
import { generateDailyWorkoutMessage } from '../agents/messaging/workoutMessage/chain';
import { WorkoutInstance, EnhancedWorkoutInstance, WorkoutBlock } from '../models/workout';
import { Message } from '../models/conversation';
import { FitnessPlanRepository } from '../repositories/fitnessPlanRepository';
import { MicrocycleRepository } from '../repositories/microcycleRepository';
import { WorkoutInstanceRepository } from '../repositories/workoutInstanceRepository';
import { MessageRepository } from '../repositories/messageRepository';
import { postgresDb } from '../connections/postgres/postgres';
import { DateTime } from 'luxon';

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
  /** The conversation ID */
  conversationId: string;
  /** Inngest job ID for tracking (undefined if full pipeline not needed) */
  jobId?: string;
  /** Quick acknowledgment or full answer message */
  ackMessage: string;
  /** Whether this message needs the full chat pipeline */
  needsFullPipeline: boolean;
  /** Reasoning for pipeline decision (for debugging) */
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
    content: string,
    conversationId?: string
  ) => Promise<string>;
}

/**
 * Result of receiving an inbound message
 */
export interface ReceiveMessageResult {
  /** The generated response (if responseGenerator was provided) */
  response?: string;
  /** The conversation ID */
  conversationId: string;
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
  private conversationService: ConversationService;
  private fitnessPlanRepo: FitnessPlanRepository;
  private microcycleRepo: MicrocycleRepository;
  private workoutRepo: WorkoutInstanceRepository;

  private constructor() {
    this.conversationService = ConversationService.getInstance();
    this.fitnessPlanRepo = new FitnessPlanRepository(postgresDb);
    this.microcycleRepo = new MicrocycleRepository(postgresDb);
    this.workoutRepo = new WorkoutInstanceRepository(postgresDb);
  }

  public static getInstance(): MessageService {
    if (!MessageService.instance) {
      MessageService.instance = new MessageService();
    }
    return MessageService.instance;
  }

  /**
   * Ingest an inbound message (async path)
   *
   * Fast path for webhook acknowledgment with intelligent routing:
   * 1. Store inbound message
   * 2. Generate reply using reply agent (may be full answer or quick ack)
   * 3. Conditionally queue async processing job via Inngest (only if needed)
   * 4. Return immediate response
   *
   * The reply agent determines if the message needs full pipeline processing.
   * For general questions, full answer is provided immediately with no async job.
   * For updates/modifications, quick ack is sent and full processing happens async.
   *
   * @returns IngestMessageResult with conversationId, optional jobId, and response
   */
  public async ingestMessage(params: IngestMessageParams): Promise<IngestMessageResult> {
    const { user, content, from, to, twilioData } = params;

    // Store the inbound message
    const storedMessage = await this.conversationService.storeInboundMessage({
      userId: user.id,
      from,
      to,
      content,
      twilioData
    });

    if (!storedMessage) {
      throw new Error('Failed to store inbound message');
    }

    // Get recent conversation history for context (last 10 messages)
    const previousMessages = await this.conversationService.getRecentMessages(user.id, 10);

    // Fetch current context for the reply agent
    // 1. Fetch fitness plan
    const fitnessPlan = await this.fitnessPlanRepo.getCurrentPlan(user.id);
    const planContext = fitnessPlan ? {
      overview: fitnessPlan.overview ?? null,
      planDescription: fitnessPlan.planDescription ?? null,
      reasoning: fitnessPlan.reasoning ?? null,
    } : undefined;

    // 2. Fetch current microcycle
    const currentMicrocycle = await this.microcycleRepo.getCurrentMicrocycle(user.id);
    const microcycleContext = currentMicrocycle?.pattern;

    // 3. Fetch today's workout
    const nowInUserTz = DateTime.now().setZone(user.timezone);
    const todayDate = nowInUserTz.startOf('day').toJSDate();
    const todayWorkout = await this.workoutRepo.findByClientIdAndDate(user.id, todayDate);

    let workoutContext: { description: string | null; reasoning: string | null; blocks: WorkoutBlock[] } | undefined;
    if (todayWorkout) {
      // Parse the workout details to extract blocks
      let blocks: WorkoutBlock[] = [];
      try {
        const details = typeof todayWorkout.details === 'string'
          ? JSON.parse(todayWorkout.details as string)
          : todayWorkout.details;

        // Check if details has the new enhanced structure with blocks
        if (details && typeof details === 'object' && 'blocks' in details) {
          blocks = details.blocks as WorkoutBlock[];
        }
      } catch (error) {
        console.error('[MessageService] Error parsing workout details:', error);
      }

      workoutContext = {
        description: (todayWorkout as WorkoutInstance & { description?: string | null, reasoning?: string | null }).description || null,
        reasoning: (todayWorkout as WorkoutInstance & { description?: string | null, reasoning?: string | null }).reasoning || null,
        blocks,
      };
    }

    // Generate reply using the reply agent (with routing decision and context)
    const replyResponse = await replyAgent(
      user,
      content,
      previousMessages,
      workoutContext,
      microcycleContext,
      planContext
    );

    console.log('[MessageService] Reply agent decision:', {
      needsFullPipeline: replyResponse.needsFullPipeline,
      reasoning: replyResponse.reasoning,
      replyLength: replyResponse.reply.length
    });

    // Store the outbound response
    try {
      await this.conversationService.storeOutboundMessage(
        user.id,
        from, // User's phone number
        replyResponse.reply,
        to // Our Twilio number
      );
    } catch (error) {
      console.error('[MessageService] Failed to store outbound reply:', error);
      // Don't block the response
    }

    // Conditionally queue the message processing job via Inngest
    let jobId: string | undefined;
    if (replyResponse.needsFullPipeline) {
      const { ids } = await inngest.send({
        name: 'message/received',
        data: {
          userId: user.id,
          conversationId: storedMessage.conversationId,
          content,
          from,
          to,
        },
      });
      jobId = ids[0];

      console.log('[MessageService] Message ingested and queued for full pipeline:', {
        userId: user.id,
        conversationId: storedMessage.conversationId,
        jobId,
      });
    } else {
      console.log('[MessageService] Message fully handled by reply agent, no pipeline needed:', {
        userId: user.id,
        conversationId: storedMessage.conversationId,
      });
    }

    // Return response with routing information
    return {
      conversationId: storedMessage.conversationId,
      jobId,
      ackMessage: replyResponse.reply,
      needsFullPipeline: replyResponse.needsFullPipeline,
      reasoning: replyResponse.reasoning,
    };
  }

  /**
   * Send a message to a user
   * Stores the message and sends it via the configured messaging client
   * @returns The stored Message object
   */
  public async sendMessage(user: UserWithProfile, message: string): Promise<Message> {
    // Get the provider from the messaging client
    const provider = messagingClient.provider;

    let stored: Message | null = null;
    try {
        stored = await this.conversationService.storeOutboundMessage(
            user.id,
            user.phoneNumber,
            message,
            undefined, // from (uses default)
            provider, // messaging provider
            undefined  // providerMessageId (not available yet)
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
    const result = await messagingClient.sendMessage(user, message);

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

    return stored;
  }

  /**
   * Send welcome message to a user
   * Wraps welcomeMessageAgent and sends the generated message
   * @returns The stored Message object
   */
  public async sendWelcomeMessage(user: UserWithProfile): Promise<Message> {
    const agentResponse = await welcomeMessageAgent.invoke({ user });
    const welcomeMessage = String(agentResponse.value);
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
   * Wraps generateDailyWorkoutMessage agent and sends the generated message
   * @param user - The user to send to
   * @param workout - The workout instance
   * @param previousMessages - Optional previous messages for context
   * @returns The stored Message object
   */
  public async sendWorkoutMessage(
    user: UserWithProfile,
    workout: WorkoutInstance | EnhancedWorkoutInstance,
    previousMessages?: Message[]
  ): Promise<Message> {
    // Check if workout already has a message stored
    let message: string;
    const workoutId = 'id' in workout ? workout.id : 'unknown';
    if ('message' in workout && workout.message) {
      console.log(`[MessageService] Using pre-generated message from workout ${workoutId}`);
      message = workout.message;
    } else {
      console.log(`[MessageService] Generating new message for workout ${workoutId}`);
      message = await generateDailyWorkoutMessage(user, workout, previousMessages);
    }
    return await this.sendMessage(user, message);
  }
}

// Export singleton instance
export const messageService = MessageService.getInstance();