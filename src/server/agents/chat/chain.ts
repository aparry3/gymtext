import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { RunnableSequence } from '@langchain/core/runnables';
import { chatPrompt, contextPrompt } from './prompts';
import { ConversationRepository } from '../../repositories/conversationRepository';
import { MessageRepository } from '../../repositories/messageRepository';
import { UserRepository } from '../../repositories/userRepository';
import { ContextService } from '../../services/ai/contextService';

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
      conversation = await conversationRepo.create(userId);
    }
    
    // Store user message
    await messageRepo.create({
      conversationId: conversation.id,
      role: 'user',
      content: message
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
    
    // Get relevant context using vector search
    const contextService = new ContextService();
    const context = await contextService.getRelevantContext(userId, message);
    
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
      role: 'assistant',
      content: response.content
    });
    
    return {
      conversationId: conversation.id,
      response: response.content,
      context
    };
  }
]);

export const contextualChatChain = RunnableSequence.from([
  async ({ 
    userId, 
    message,
    contextKeys 
  }: { 
    userId: string;
    message: string;
    contextKeys?: string[];
  }) => {
    // Get user info
    const userRepo = new UserRepository();
    const user = await userRepo.findWithProfile(userId);
    
    // Get specific context if keys provided
    const contextService = new ContextService();
    const context = contextKeys 
      ? await contextService.getContextByKeys(userId, contextKeys)
      : await contextService.getRelevantContext(userId, message);
    
    return { user, message, context };
  },
  
  async ({ user, message, context }) => {
    const prompt = contextPrompt(user, message, context);
    const response = await llm.invoke(prompt);
    
    return {
      response: response.content,
      context
    };
  }
]);