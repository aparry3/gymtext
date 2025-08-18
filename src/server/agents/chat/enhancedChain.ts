import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { Kysely } from 'kysely';
import { DB } from '../../models/_types';
import { ProfileDetector } from './profileDetector';
import { ProfileUpdateService } from '../../services/profileUpdateService';
import { AIContextService } from '../../services/aiContextService';
import { FitnessProfileRepository } from '../../repositories/fitnessProfileRepository';
import { ConversationRepository } from '../../repositories/conversationRepository';
import { MessageRepository } from '../../repositories/messageRepository';

const llm = new ChatGoogleGenerativeAI({ 
  temperature: 0.7, 
  model: "gemini-2.0-flash" 
});

export interface EnhancedChatInput {
  userId: string;
  message: string;
  conversationId?: string;
  db: Kysely<DB>;
  detectProfileUpdates?: boolean;
}

export interface EnhancedChatResponse {
  response: string;
  conversationId: string;
  profileUpdated: boolean;
  detectedUpdates?: any[];
  requiresConfirmation?: boolean;
}

const enhancedChatPrompt = `You are a supportive fitness coach responding to a user's SMS message.

Current user profile:
{profileContext}

Recent conversation:
{conversationHistory}

User message: {userMessage}

Instructions:
1. Provide a helpful, encouraging response
2. Keep your response under 160 characters for SMS
3. Be conversational and personalized based on their profile
4. If they mention injuries or limitations, be supportive
5. If they report progress, celebrate with them

Response:`;

export class EnhancedChatAgent {
  private profileDetector: ProfileDetector;
  private aiContextService: AIContextService;

  constructor(private db: Kysely<DB>) {
    this.profileDetector = new ProfileDetector();
    this.aiContextService = new AIContextService();
  }

  async processMessage(input: EnhancedChatInput): Promise<EnhancedChatResponse> {
    const { userId, message, conversationId } = input;
    
    // Get or create conversation
    const conversationRepo = new ConversationRepository(this.db);
    const messageRepo = new MessageRepository(this.db);
    
    let conversation = conversationId 
      ? await conversationRepo.findById(conversationId)
      : null;
    
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
      phoneFrom: 'user_phone',
      phoneTo: 'system_phone'
    });
    
    // Get profile and context
    const profileRepo = new FitnessProfileRepository(this.db);
    const profile = await profileRepo.getProfile(userId);
    const context = this.aiContextService.buildAIContext(profile);
    
    // Get recent conversation history
    const recentMessages = await messageRepo.findByConversationId(
      conversation.id,
      { limit: 10 }
    );
    const conversationHistory = recentMessages
      .map(m => `${m.direction === 'inbound' ? 'User' : 'Coach'}: ${m.content}`)
      .join('\n');
    
    let response: string;
    let profileUpdated = false;
    let detectedUpdates: any[] = [];
    let requiresConfirmation = false;
    
    if (input.detectProfileUpdates) {
      // Detect profile updates in the message
      const detection = await this.profileDetector.detectUpdates(
        message,
        context.prose,
        conversationHistory
      );
      
      response = detection.reply;
      requiresConfirmation = detection.requiresConfirmation;
      
      if (detection.detectedUpdates && detection.detectedUpdates.length > 0) {
        detectedUpdates = detection.detectedUpdates;
        
        // Apply high-confidence updates automatically if no confirmation needed
        if (!requiresConfirmation) {
          const ops = this.profileDetector.convertToOps(detection.detectedUpdates);
          const updateService = new ProfileUpdateService(this.db);
          
          for (const op of ops) {
            try {
              await updateService.applyOp(
                userId,
                op,
                'sms_chat',
                `Detected in SMS: "${message.slice(0, 50)}..."`
              );
              profileUpdated = true;
            } catch (error) {
              console.error('Failed to apply profile update:', error);
            }
          }
        }
      }
    } else {
      // Generate standard chat response
      const prompt = enhancedChatPrompt
        .replace('{profileContext}', context.prose)
        .replace('{conversationHistory}', conversationHistory)
        .replace('{userMessage}', message);
      
      const llmResponse = await llm.invoke(prompt);
      response = typeof llmResponse.content === 'string' 
        ? llmResponse.content 
        : JSON.stringify(llmResponse.content);
      
      // Truncate for SMS
      if (response.length > 160) {
        response = response.slice(0, 157) + '...';
      }
    }
    
    // Store assistant response
    await messageRepo.create({
      conversationId: conversation.id,
      userId,
      direction: 'outbound',
      content: response,
      phoneFrom: 'system_phone',
      phoneTo: 'user_phone'
    });
    
    // Update conversation
    await conversationRepo.updateLastMessage(conversation.id);
    
    return {
      response,
      conversationId: conversation.id,
      profileUpdated,
      detectedUpdates,
      requiresConfirmation,
    };
  }
}