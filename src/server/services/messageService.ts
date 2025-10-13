import { UserWithProfile } from '../models/userModel';
import { messagingClient, type MessageResult } from '../connections/messaging';
import { ConversationService } from './conversationService';
import { inngest } from '../connections/inngest/client';
import { replyAgent } from '../agents/conversation/reply/chain';

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

  private constructor() {
    this.conversationService = ConversationService.getInstance();
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

    // Get recent conversation history for context
    const allMessages = await this.conversationService.getMessages(storedMessage.conversationId);
    const conversationHistory = allMessages.slice(-10); // Last 10 messages for context

    // Generate reply using the reply agent (with routing decision)
    const replyResponse = await replyAgent(user, content, conversationHistory);

    console.log('[MessageService] Reply agent decision:', {
      needsFullPipeline: replyResponse.needsFullPipeline,
      reasoning: replyResponse.reasoning,
      replyLength: replyResponse.reply.length
    });

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
   * Receive an inbound message (sync path)
   *
   * Orchestrates the full inbound message flow synchronously:
   * 1. Store inbound message
   * 2. Generate response (if responseGenerator provided)
   * 3. Store outbound response (if generated)
   *
   * Note: This does NOT send the response - caller is responsible for that.
   * For webhook responses (Twilio), the response is returned via TwiML.
   * For API responses, the response is returned in JSON.
   *
   * @deprecated Use ingestMessage() for webhooks to avoid timeouts
   */
  public async receiveMessage(params: ReceiveMessageParams): Promise<ReceiveMessageResult> {
    const { user, content, from, to, twilioData, responseGenerator } = params;

    // Store the inbound message
    let conversationId: string | undefined;
    let inboundStored = false;

    try {
      const storedMessage = await this.conversationService.storeInboundMessage({
        userId: user.id,
        from,
        to,
        content,
        twilioData
      });

      if (storedMessage) {
        conversationId = storedMessage.conversationId;
        inboundStored = true;
      } else {
        console.warn('[MessageService] Circuit breaker prevented storing inbound message');
      }
    } catch (error) {
      console.error('[MessageService] Failed to store inbound message:', error);
    }

    // If no conversation ID, we can't proceed
    if (!conversationId) {
      throw new Error('Failed to store inbound message - no conversation ID');
    }

    // Generate response if a generator was provided
    let response: string | undefined;
    let outboundStored: boolean | undefined;

    if (responseGenerator) {
      try {
        response = await responseGenerator(user, content, conversationId);

        // Store the outbound response
        try {
          const stored = await this.conversationService.storeOutboundMessage(
            user.id,
            from, // User's number is the "to" for our response
            response,
            to // Our number is the "from" for our response
          );

          outboundStored = !!stored;

          if (!stored) {
            console.warn('[MessageService] Circuit breaker prevented storing outbound message');
          }
        } catch (error) {
          console.error('[MessageService] Failed to store outbound message:', error);
          outboundStored = false;
        }
      } catch (error) {
        console.error('[MessageService] Failed to generate response:', error);
        throw error;
      }
    }

    return {
      response,
      conversationId,
      inboundStored,
      outboundStored
    };
  }

  /**
   * Send a message to a user
   * Stores the message and sends it via the configured messaging client
   */
  public async sendMessage(user: UserWithProfile, message: string): Promise<MessageResult> {
    // Get the provider from the messaging client
    const provider = messagingClient.provider;

    try {
        const stored = await this.conversationService.storeOutboundMessage(
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

    const messageResult = await messagingClient.sendMessage(user, message);

    return messageResult;
  }
}

// Export singleton instance
export const messageService = MessageService.getInstance();