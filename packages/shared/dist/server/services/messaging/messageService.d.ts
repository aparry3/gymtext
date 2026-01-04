import { UserWithProfile } from '../../models/user';
import { FitnessPlan } from '../../models/fitnessPlan';
import { WorkoutInstance, EnhancedWorkoutInstance } from '../../models/workout';
import { Message } from '../../models/conversation';
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
    responseGenerator?: (user: UserWithProfile, content: string) => Promise<string>;
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
export declare class MessageService {
    private static instance;
    private messageRepo;
    private userService;
    private workoutInstanceService;
    private circuitBreaker;
    private constructor();
    static getInstance(): MessageService;
    /**
     * Store an inbound message to the database
     */
    storeInboundMessage(params: StoreInboundMessageParams): Promise<Message | null>;
    /**
     * Store an outbound message to the database
     */
    storeOutboundMessage(clientId: string, to: string, messageContent: string, from?: string, provider?: 'twilio' | 'local' | 'websocket', providerMessageId?: string, metadata?: Record<string, unknown>): Promise<Message | null>;
    /**
     * Get messages for a client with pagination support
     */
    getMessages(clientId: string, limit?: number, offset?: number): Promise<Message[]>;
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
    getRecentMessages(clientId: string, limit?: number): Promise<Message[]>;
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
    splitMessages(messages: Message[], contextMinutes: number): {
        pending: Message[];
        context: Message[];
    };
    /**
     * Get pending (unanswered) inbound messages for a client
     *
     * Retrieves the tail of inbound messages that have occurred since the last outbound message.
     * Used for batch processing in the debounced chat flow.
     *
     * @param clientId - The client ID
     * @returns Array of pending inbound messages, ordered oldest to newest
     */
    getPendingMessages(clientId: string): Promise<Message[]>;
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
    ingestMessage(params: IngestMessageParams): Promise<IngestMessageResult>;
    /**
     * Send a message to a user
     * Stores the message and sends it via the configured messaging client
     * @param user - User to send message to
     * @param message - Optional message content (can be undefined for MMS-only messages)
     * @param mediaUrls - Optional array of media URLs for MMS (images, videos, etc.)
     * @returns The stored Message object
     */
    sendMessage(user: UserWithProfile, message?: string, mediaUrls?: string[]): Promise<Message>;
    /**
     * Simulate message delivery for local development
     *
     * Called when using the local messaging client to simulate the Twilio
     * webhook callback that normally triggers queue processing.
     *
     * @param messageId - ID of the message to mark as delivered
     */
    private simulateLocalDelivery;
    /**
     * Send welcome message to a user
     * Uses messagingAgentService and sends the generated message
     * @returns The stored Message object
     */
    sendWelcomeMessage(user: UserWithProfile): Promise<Message>;
    /**
     * Send fitness plan summary messages to a user
     * Uses messagingAgentService and sends the generated messages
     * @param user - The user to send to
     * @param plan - The fitness plan to summarize
     * @param previousMessages - Optional previous messages for context
     * @returns Array of stored Message objects
     */
    sendPlanSummary(user: UserWithProfile, plan: FitnessPlan, previousMessages?: Message[]): Promise<Message[]>;
    /**
     * Send workout message to a user
     * Generates SMS from workout data and sends it
     * @param user - The user to send to
     * @param workout - The workout instance (should have pre-generated message or description/reasoning)
     * @returns The stored Message object
     */
    sendWorkoutMessage(user: UserWithProfile, workout: WorkoutInstance | EnhancedWorkoutInstance): Promise<Message>;
}
export declare const messageService: MessageService;
//# sourceMappingURL=messageService.d.ts.map