import { Kysely } from 'kysely';
import type { DB, Json } from '@/shared/types/generated';
import { ConversationRepository, Conversation } from '@/server/repositories/conversationRepository';
import { MessageRepository, Message } from '@/server/repositories/messageRepository';
import { CircuitBreaker } from '@/server/utils/circuitBreaker';

interface StoreInboundMessageParams {
  userId: string;
  from: string;
  to: string;
  content: string;
  twilioData?: Record<string, unknown>;
}

interface StoreOutboundMessageParams {
  userId: string;
  from: string;
  to: string;
  messageContent: string;
  twilioMessageSid?: string;
}

export class ConversationStorageService {
  private conversationRepo: ConversationRepository;
  private messageRepo: MessageRepository;
  private conversationTimeoutMinutes: number;
  private circuitBreaker: CircuitBreaker;

  constructor(db: Kysely<DB>) {
    this.conversationRepo = new ConversationRepository(db);
    this.messageRepo = new MessageRepository(db);
    this.conversationTimeoutMinutes = parseInt(process.env.CONVERSATION_TIMEOUT_MINUTES || '1440');
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      resetTimeout: 60000, // 1 minute
      monitoringPeriod: 60000 // 1 minute
    });
  }

  async storeInboundMessage(params: StoreInboundMessageParams): Promise<Message | null> {
    return await this.circuitBreaker.execute(async () => {
      const { userId, from, to, content, twilioData } = params;
      
      // Get or create conversation
      const conversation = await this.getOrCreateConversation(userId);
      console.log('INBOUND CONVERSATION', conversation);
      // Store the message
      const message = await this.messageRepo.create({
        conversationId: conversation.id,
        userId: userId,
        direction: 'inbound',
        content,
        phoneFrom: from,
        phoneTo: to,
        twilioMessageSid: (twilioData?.MessageSid as string) || null,
        metadata: (twilioData || {}) as Json
      });

      return message;
    });
  }

  async storeOutboundMessage(params: StoreOutboundMessageParams): Promise<Message | null> {
    return await this.circuitBreaker.execute(async () => {
      const { userId, from, to, messageContent, twilioMessageSid } = params;
      
      // Get or create conversation
      const conversation = await this.getOrCreateConversation(userId);
      
      // Store the message
      const message = await this.messageRepo.create({
        conversationId: conversation.id,
        userId: userId,
        direction: 'outbound',
        content: messageContent,
        phoneFrom: from,
        phoneTo: to,
        twilioMessageSid: twilioMessageSid,
        metadata: {} as Json,
      });

      return message;
    });
  }

  async getOrCreateConversation(userId: string): Promise<Conversation> {
    // Get the user's last conversation
    const lastConversation = await this.conversationRepo.getLastConversationForUser(userId);

    // Check if we should continue the existing conversation
    if (lastConversation && this.shouldContinueConversation(lastConversation)) {
      return lastConversation;
    }
    
    // Mark previous conversation as inactive if exists
    if (lastConversation && lastConversation.status === 'active') {
      await this.conversationRepo.markAsInactive(lastConversation.id);
    }
    // console.log('conversation', lastConversation);

    // Create a new conversation
    const now = new Date();
    const newConversation = await this.conversationRepo.create({
      userId: userId,
      startedAt: now.toISOString(),
      lastMessageAt: now.toISOString(),
      status: 'active',
      messageCount: 0,
      metadata: {} as Json
    });
    
    return newConversation;
  }

  private shouldContinueConversation(conversation: Conversation): boolean {
    // Check if conversation is still active
    if (conversation.status !== 'active') {
      return false;
    }
    
    // Check timeout
    const lastMessageTime = new Date(conversation.lastMessageAt);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastMessageTime.getTime()) / (1000 * 60);
    
    return diffMinutes < this.conversationTimeoutMinutes;
  }

  async getConversationHistory(userId: string): Promise<Conversation[]> {
    return await this.conversationRepo.findByUserId(userId);
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    return await this.messageRepo.findByConversationId(conversationId);
  }
}