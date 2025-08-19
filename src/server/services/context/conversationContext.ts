import {
    ConversationContext,
    ContextRetrievalOptions,
    CachedContext,
    RecentMessage,
    UserContextProfile,
  } from '@/server/models/conversation';
  import { ContextConfig, getContextConfig } from '@/shared/config/context.config';
  import { ConversationRepository } from '@/server/repositories/conversationRepository';
  import { MessageRepository } from '@/server/repositories/messageRepository';
  import { UserRepository } from '@/server/repositories/userRepository';
  
  export class ConversationContextService {
    private config: ContextConfig;
    private contextCache: Map<string, CachedContext> = new Map();
    private conversationRepo: ConversationRepository;
    private messageRepo: MessageRepository;
    private userRepo: UserRepository;
  
    constructor(config?: Partial<ContextConfig>) {
      this.config = { ...getContextConfig(), ...config };
      this.conversationRepo = new ConversationRepository();
      this.messageRepo = new MessageRepository();
      this.userRepo = new UserRepository();
    }
  
    async getContext(
      userId: string,
      options: ContextRetrievalOptions = {}
    ): Promise<ConversationContext | null> {
      try {
        // Check cache first
        const cacheKey = `${userId}_${JSON.stringify(options)}`;
        const cached = this.contextCache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.config.cacheTTLSeconds * 1000) {
          return cached.context;
        }
  
        // Get current active conversation
        const currentConversation = await this.conversationRepo.findActiveByUserId(userId);
        
        let conversationId: string;
        let recentMessages: RecentMessage[] = [];
        let messageCount = 0;
        let isNewConversation = true;
        let startTime = new Date();
        let lastInteractionTime = new Date();
  
        if (currentConversation) {
          conversationId = currentConversation.id;
          isNewConversation = false;
          startTime = new Date(currentConversation.createdAt);
          lastInteractionTime = new Date(currentConversation.lastMessageAt);
  
          // Get recent messages for this conversation
          const messages = await this.messageRepo.findByConversationId(
            conversationId
          );
          
          messageCount = messages.length;
          
          // Convert to RecentMessage format and limit by options
          const messageLimit = options.messageLimit || this.config.messageHistoryLimit;
          recentMessages = messages
            .slice(-messageLimit)
            .map(msg => ({
              role: msg.direction === 'inbound' ? 'user' as const : 'assistant' as const,
              content: msg.content,
              timestamp: new Date(msg.createdAt),
              messageId: msg.id,
            }));
        } else {
          // No active conversation, create a temporary ID
          conversationId = `temp-${userId}-${Date.now()}`;
        }
  
        // Get user profile information
        let userProfile: UserContextProfile = {
          userId,
          fitnessGoals: undefined,
          skillLevel: undefined,
          currentProgram: undefined,
          recentTopics: [],
          preferences: {},
          lastWorkoutDate: undefined,
        };
  
        if (options.includeUserProfile !== false) {
          const userWithProfile = await this.userRepo.findWithProfile(userId);
          if (userWithProfile?.parsedProfile) {
            userProfile = {
              ...userProfile,
              fitnessGoals: userWithProfile.parsedProfile.fitnessGoals,
              skillLevel: userWithProfile.parsedProfile.skillLevel,
              // TODO: Add currentProgram and other fields as needed
            };
          }
        }
  
        const context: ConversationContext = {
          conversationId,
          recentMessages,
          userProfile,
          metadata: {
            startTime,
            messageCount,
            lastInteractionTime,
            isNewConversation,
            conversationGapMinutes: this.config.conversationGapMinutes,
          },
        };
  
        // Cache the result
        this.contextCache.set(cacheKey, {
          context,
          timestamp: Date.now(),
          ttl: this.config.cacheTTLSeconds * 1000,
        });
  
        return context;
      } catch (error) {
        console.error('Error getting conversation context:', error);
        return null;
      }
    }
  
    async updateContext(
      userId: string,
      updates: Partial<ConversationContext>
    ): Promise<void> {
      try {
        // Clear relevant cache entries for this user
        const keysToDelete = Array.from(this.contextCache.keys()).filter(key => 
          key.startsWith(`${userId}_`)
        );
        keysToDelete.forEach(key => this.contextCache.delete(key));
  
        // Update conversation metadata if provided
        if (updates.metadata && updates.conversationId && !updates.conversationId.startsWith('temp-')) {
          await this.conversationRepo.update(updates.conversationId, {
            lastMessageAt: updates.metadata.lastInteractionTime || new Date(),
          });
        }
  
        // Note: User profile updates should be handled through the user repository
        // and message updates through the message repository in their respective services
        console.log('Context updated for user:', userId);
      } catch (error) {
        console.error('Error updating conversation context:', error);
      }
    }
  
    async clearContext(userId: string): Promise<void> {
      try {
        // Clear from cache
        const keysToDelete = Array.from(this.contextCache.keys()).filter(key => 
          key.startsWith(`${userId}_`)
        );
        
        keysToDelete.forEach(key => this.contextCache.delete(key));
        
        // TODO: Implement context clearing with conversation repository
        console.log('Context cleared for user:', userId);
      } catch (error) {
        console.error('Error clearing conversation context:', error);
      }
    }
  }