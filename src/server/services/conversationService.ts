import { ConversationRepository } from '@/server/repositories/conversationRepository';
import { MessageRepository } from '@/server/repositories/messageRepository';
import type { Conversation, Message } from '@/server/models/conversation';
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
  private conversationRepo: ConversationRepository;
  private userRepo: UserRepository;
  private messageRepo: MessageRepository;
  private conversationTimeoutMinutes: number;
  private circuitBreaker: CircuitBreaker;

  private constructor() {
    this.conversationRepo = new ConversationRepository();
    this.userRepo = new UserRepository();
    this.messageRepo = new MessageRepository();
    this.conversationTimeoutMinutes = parseInt(process.env.CONVERSATION_TIMEOUT_MINUTES || '1440');
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
      
      // Get or create conversation
      const conversation = await this.getOrCreateConversation(userId);

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

  async storeOutboundMessage(userId: string, to: string, messageContent: string, from: string = process.env.TWILIO_NUMBER || '', twilioMessageSid?: string): Promise<Message | null> {
    // TODO: Summarize and save conversation as memory - update previous conversation memory
    return await this.circuitBreaker.execute(async () => {
      
      // Get or create conversation
      const conversation = await this.getOrCreateConversation(userId);

      const messages = await this.messageRepo.findByConversationId(conversation.id);

      const user = await this.userRepo.findWithProfile(userId);
      if (!user) {
        return null;
      }

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

      const summary = await this.summarizeConversation(user, messages);
      await this.conversationRepo.update(conversation.id, { summary });
      return message;
    });
  }

  async summarizeConversation(user: UserWithProfile, messages: Message[]): Promise<string> {
    // TODO: Summarize conversation
    const messagesText = messages.map(message => `${message.direction === 'inbound' ? 'User' : 'Coach'}: ${message.content}`).join('\n');

    const summary = await summaryAgent.invoke({ user, context: { messages: messagesText } });
    return summary.value;
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

// Export singleton instance
export const conversationService = ConversationService.getInstance();