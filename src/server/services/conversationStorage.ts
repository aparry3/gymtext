import { Kysely } from 'kysely';
import { Database } from '@/shared/types/schema';
import { ConversationRepository, Conversation } from '../repositories/conversation.repository';
import { MessageRepository, Message } from '../repositories/message.repository';
import { CircuitBreaker } from '../utils/circuitBreaker';

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
  content: string;
  twilioMessageSid?: string;
}

export class ConversationStorageService {
  private conversationRepo: ConversationRepository;
  private messageRepo: MessageRepository;
  private conversationTimeoutMinutes: number;
  private circuitBreaker: CircuitBreaker;

  constructor(db: Kysely<Database>) {
    this.conversationRepo = new ConversationRepository(db);
    this.messageRepo = new MessageRepository(db);
    this.conversationTimeoutMinutes = parseInt(process.env.CONVERSATION_TIMEOUT_MINUTES || '30');
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
      
      // Store the message
      const message = await this.messageRepo.create({
        conversation_id: conversation.id,
        user_id: userId,
        direction: 'inbound',
        content,
        phone_from: from,
        phone_to: to,
        twilio_message_sid: (twilioData?.MessageSid as string) || null,
        metadata: twilioData || {}
      });

      return message;
    });
  }

  async storeOutboundMessage(params: StoreOutboundMessageParams): Promise<Message | null> {
    return await this.circuitBreaker.execute(async () => {
      const { userId, from, to, content, twilioMessageSid } = params;
      
      // Get or create conversation
      const conversation = await this.getOrCreateConversation(userId);
      
      // Store the message
      const message = await this.messageRepo.create({
        conversation_id: conversation.id,
        user_id: userId,
        direction: 'outbound',
        content,
        phone_from: from,
        phone_to: to,
        twilio_message_sid: twilioMessageSid || null,
        metadata: {}
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
    
    // Create a new conversation
    const now = new Date();
    const newConversation = await this.conversationRepo.create({
      user_id: userId,
      started_at: now.toISOString(),
      last_message_at: now.toISOString(),
      status: 'active',
      message_count: 0,
      metadata: {}
    });
    
    return newConversation;
  }

  private shouldContinueConversation(conversation: Conversation): boolean {
    // Check if conversation is still active
    if (conversation.status !== 'active') {
      return false;
    }
    
    // Check timeout
    const lastMessageTime = new Date(conversation.last_message_at);
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