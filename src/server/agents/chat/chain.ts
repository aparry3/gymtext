import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { RunnableSequence } from '@langchain/core/runnables';
import { chatPrompt, contextPrompt } from '@/server/agents/chat/prompts';
import { ConversationRepository } from '@/server/repositories/conversationRepository';
import { MessageRepository } from '@/server/repositories/messageRepository';
import { UserRepository } from '@/server/repositories/userRepository';
import { ConversationContextService } from '@/server/services/context/conversationContext';

const llm = new ChatGoogleGenerativeAI({ temperature: 0.7, model: "gemini-2.0-flash" });

export const chatChain = RunnableSequence.from([
  async ({ 
    userId, 
    message, 
    conversationId 
  }: { 
    userId: string;
    message: string;
    conversationId?: string;
  }) => {
    // Get or create conversation
    const conversationRepo = new ConversationRepository();
    const messageRepo = new MessageRepository();
    
    let conversation;
    if (conversationId) {
      conversation = await conversationRepo.findById(conversationId);
    }
    
    if (!conversation) {
      conversation = await conversationRepo.create({
        userId,
        lastMessageAt: new Date(),
        startedAt: new Date()
      });
    }
    
    // Store user message
    await messageRepo.create({
      conversationId: conversation.id,
      userId,
      direction: 'inbound',
      content: message,
      phoneFrom: 'user_phone', // TODO: Get from user
      phoneTo: 'system_phone' // TODO: Get from config
    });
    
    // Get conversation history
    const messages = await messageRepo.findByConversationId(conversation.id);
    
    return { 
      userId, 
      message, 
      conversation, 
      messages: messages.slice(-10) // Keep last 10 messages for context
    };
  },
  
  async ({ userId, message, conversation, messages }) => {
    // Get user context
    const userRepo = new UserRepository();
    const user = await userRepo.findWithProfile(userId);
    
    // Get conversation context
    const contextService = new ConversationContextService();
    const context = await contextService.getContext(userId, {
      includeUserProfile: true,
      includeWorkoutHistory: true,
      messageLimit: 5
    });
    
    return { user, message, conversation, messages, context };
  },
  
  async ({ user, message, conversation, messages, context }) => {
    // Generate response using chat prompt
    const prompt = chatPrompt(user, message, messages, context);
    const response = await llm.invoke(prompt);
    
    // Store assistant message
    const messageRepo = new MessageRepository();
    await messageRepo.create({
      conversationId: conversation.id,
      userId: user.id,
      direction: 'outbound',
      content: typeof response.content === 'string' ? response.content : JSON.stringify(response.content),
      phoneFrom: 'system_phone', // TODO: Get from config
      phoneTo: 'user_phone' // TODO: Get from user
    });
    
    return {
      conversationId: conversation.id,
      response: typeof response.content === 'string' ? response.content : JSON.stringify(response.content),
      context
    };
  }
]);

export const contextualChatChain = RunnableSequence.from([
  async ({ 
    userId, 
    message
  }: { 
    userId: string;
    message: string;
  }) => {
    // Get user info
    const userRepo = new UserRepository();
    const user = await userRepo.findWithProfile(userId);
    
    // Get conversation context
    const contextService = new ConversationContextService();
    const context = await contextService.getContext(userId, {
      includeUserProfile: true,
      includeWorkoutHistory: true,
      messageLimit: 5
    });
    
    return { user, message, context };
  },
  
  async ({ user, message, context }) => {
    const prompt = contextPrompt(user, message, context);
    const response = await llm.invoke(prompt);
    
    return {
      response: typeof response.content === 'string' ? response.content : JSON.stringify(response.content),
      context
    };
  }
]);