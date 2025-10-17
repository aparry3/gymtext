import { MessageRepository } from '@/server/repositories/messageRepository';
import type { Message } from '@/server/models/conversation';
import { CircuitBreaker } from '@/server/utils/circuitBreaker';
import { Json } from '../models/_types';
import { UserRepository } from '../repositories/userRepository';
import { UserWithProfile } from '../models/userModel';
import { summaryAgent } from '../agents/conversation/summary/chain';

interface StoreInboundMessageParams {
  userId: string;
  from: string;
  to: string;
  content: string;
  twilioData?: Record<string, unknown>;
}

export class ConversationService {
  private static instance: ConversationService;
  private userRepo: UserRepository;
  private messageRepo: MessageRepository;
  private circuitBreaker: CircuitBreaker;

  private constructor() {
    this.userRepo = new UserRepository();
    this.messageRepo = new MessageRepository();
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      resetTimeout: 60000, // 1 minute
      monitoringPeriod: 60000 // 1 minute
    });
  }

  public static getInstance(): ConversationService {
    if (!ConversationService.instance) {
      ConversationService.instance = new ConversationService();
    }
    return ConversationService.instance;
  }

  async storeInboundMessage(params: StoreInboundMessageParams): Promise<Message | null> {
    return await this.circuitBreaker.execute(async () => {
      const { userId, from, to, content, twilioData } = params;

      // Store the message directly (no conversation needed)
      const message = await this.messageRepo.create({
        conversationId: null, // No longer using conversations
        userId: userId,
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

  async storeOutboundMessage(
    userId: string,
    to: string,
    messageContent: string,
    from: string = process.env.TWILIO_NUMBER || '',
    provider: 'twilio' | 'local' | 'websocket' = 'twilio',
    providerMessageId?: string
  ): Promise<Message | null> {
    // TODO: Implement periodic message summarization
    return await this.circuitBreaker.execute(async () => {

      const user = await this.userRepo.findWithProfile(userId);
      if (!user) {
        return null;
      }

      // Store the message with initial delivery tracking
      const message = await this.messageRepo.create({
        conversationId: null, // No longer using conversations
        userId: userId,
        direction: 'outbound',
        content: messageContent,
        phoneFrom: from,
        phoneTo: to,
        provider,
        providerMessageId: providerMessageId || null,
        metadata: {} as Json,
        deliveryStatus: 'queued',
        deliveryAttempts: 1,
        lastDeliveryAttemptAt: new Date(),
      });

      // Optionally summarize messages periodically (implementation TBD)
      // For now, we'll skip summarization on every message to improve performance
      // const messages = await this.getRecentMessages(userId, 50);
      // const summary = await this.summarizeMessages(user, messages);
      // Store summary somewhere (TBD - maybe in a separate summaries table)

      return message;
    });
  }

  async summarizeMessages(user: UserWithProfile, messages: Message[]): Promise<string> {
    // Summarize a batch of messages
    const messagesText = messages.map(message => `${message.direction === 'inbound' ? 'User' : 'Coach'}: ${message.content}`).join('\n');

    const summary = await summaryAgent.invoke({ user, context: { messages: messagesText } });
    return summary.value;
  }

  async getMessages(userId: string, limit: number = 50): Promise<Message[]> {
    return await this.messageRepo.findByUserId(userId, limit);
  }

  /**
   * Get recent messages for a user
   *
   * Convenience method for retrieving the most recent messages for a user.
   * Useful for passing conversation context to agents.
   *
   * @param userId - The user ID
   * @param limit - Maximum number of recent messages to return (default: 10)
   * @returns Array of recent messages, ordered oldest to newest
   *
   * @example
   * ```typescript
   * // Get last 10 messages for context
   * const previousMessages = await conversationService.getRecentMessages(userId);
   * const response = await chatAgent(user, message, previousMessages);
   * ```
   */
  async getRecentMessages(userId: string, limit: number = 10): Promise<Message[]> {
    // Get recent messages directly by userId
    return await this.messageRepo.findRecentByUserId(userId, limit);
  }
}

// Export singleton instance
export const conversationService = ConversationService.getInstance();