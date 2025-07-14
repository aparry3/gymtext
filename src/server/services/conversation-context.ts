import {
  ConversationContext,
  UserContextProfile,
  ConversationMetadata,
  ContextRetrievalOptions,
  CachedContext,
} from '@/shared/types/conversation-context';
import { ContextConfig, getContextConfig } from '@/shared/config/context.config';
import { ConversationRepository } from '@/server/repositories/conversation.repository';
import { MessageRepository } from '@/server/repositories/message.repository';
import { UserRepository } from '@/server/repositories/user.repository';
import { WorkoutRepository } from '@/server/repositories/workout.repository';
import { Kysely } from 'kysely';
import { Database } from '@/shared/types/schema';

export class ConversationContextService {
  private config: ContextConfig;
  private conversationRepository: ConversationRepository;
  private messageRepository: MessageRepository;
  private userRepository: UserRepository;
  private workoutRepository: WorkoutRepository;

  constructor(db: Kysely<Database>, config?: Partial<ContextConfig>) {
    this.config = { ...getContextConfig(), ...config };
    this.conversationRepository = new ConversationRepository(db);
    this.messageRepository = new MessageRepository(db);
    this.userRepository = new UserRepository(db);
    this.workoutRepository = new WorkoutRepository(db);
  }

  async getContext(
    userId: string,
    options: ContextRetrievalOptions = {}
  ): Promise<ConversationContext | null> {
    try {
      // Check cache first if enabled
      if (this.config.enableCaching && !options.skipCache) {
        const cached = await this.getCachedContext(userId);
        if (cached?.context) {
          return cached.context;
        }
      }

      // Get or create active conversation
      const activeConversation = await this.conversationRepository.getActiveConversation(
        userId,
        this.config.conversationGapMinutes
      );

      if (!activeConversation) {
        // No active conversation, return minimal context
        const userProfile = await this.buildUserProfile(userId, options);
        return {
          conversationId: '',
          recentMessages: [],
          userProfile,
          metadata: {
            startTime: new Date(),
            messageCount: 0,
            lastInteractionTime: new Date(),
            isNewConversation: true,
            conversationGapMinutes: this.config.conversationGapMinutes,
          },
        };
      }

      // Get recent messages
      const messageLimit = options.messageLimit || this.config.messageHistoryLimit;
      const recentMessages = await this.messageRepository.getRecentMessages(
        activeConversation.id,
        messageLimit
      );

      // Build user profile
      const userProfile = await this.buildUserProfile(userId, options);

      // Build metadata
      const metadata: ConversationMetadata = {
        startTime: activeConversation.startedAt,
        messageCount: activeConversation.messageCount,
        lastInteractionTime: activeConversation.lastMessageAt,
        isNewConversation: activeConversation.messageCount === 0,
        conversationGapMinutes: this.config.conversationGapMinutes,
      };

      // Construct context
      const context: ConversationContext = {
        conversationId: activeConversation.id,
        recentMessages: recentMessages.map(msg => ({
          role: msg.direction === 'inbound' ? 'user' : 'assistant',
          content: msg.content,
          timestamp: msg.createdAt,
          messageId: msg.id,
        })),
        userProfile,
        metadata,
      };

      // Cache the context if enabled
      if (this.config.enableCaching) {
        await this.setCachedContext(userId, {
          context,
          timestamp: Date.now(),
          ttl: this.config.cacheTTLSeconds,
        });
      }

      return context;
    } catch (error) {
      console.error('Error retrieving conversation context:', error);
      return null;
    }
  }

  private async buildUserProfile(
    userId: string,
    options: ContextRetrievalOptions
  ): Promise<UserContextProfile> {
    const profile: UserContextProfile = {
      userId,
    };

    if (options.includeUserProfile !== false) {
      const fitnessProfile = await this.userRepository.getUserFitnessProfile(userId);

      if (fitnessProfile) {
        profile.fitnessGoals = fitnessProfile.fitnessGoals;
        profile.skillLevel = fitnessProfile.skillLevel;
        profile.preferences = {
          age: fitnessProfile.age,
          gender: fitnessProfile.gender,
          exerciseFrequency: fitnessProfile.exerciseFrequency,
        };
      }
    }

    if (options.includeWorkoutHistory) {
      const recentWorkouts = await this.workoutRepository.getRecentWorkouts(userId, 3);
      if (recentWorkouts.length > 0) {
        profile.lastWorkoutDate = recentWorkouts[0].date;
        profile.currentProgram = recentWorkouts[0].workoutType;
      }
    }

    return profile;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getCachedContext(_userId: string): Promise<CachedContext | null> {
    // Redis implementation will be added in Phase 2.5
    // For now, return null to skip caching
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async setCachedContext(_userId: string, _context: CachedContext): Promise<void> {
    // Redis implementation will be added in Phase 2.5
    // For now, this is a no-op
  }

  async summarizeConversation(conversationId: string): Promise<string | null> {
    try {
      const messages = await this.messageRepository.getAllConversationMessages(conversationId);
      
      if (messages.length === 0) {
        return null;
      }

      // For now, return a simple summary
      // In the future, this could use AI to generate better summaries
      const summary = `Conversation with ${messages.length} messages discussing fitness and workouts.`;

      return summary;
    } catch (error) {
      console.error('Error summarizing conversation:', error);
      return null;
    }
  }

  async getContextWithSummary(
    userId: string,
    options: ContextRetrievalOptions = {}
  ): Promise<ConversationContext | null> {
    const context = await this.getContext(userId, options);
    
    if (!context || !context.conversationId) {
      return context;
    }

    // Only add summary for longer conversations
    if (context.metadata.messageCount > 10) {
      const summary = await this.summarizeConversation(context.conversationId);
      if (summary) {
        context.summary = summary;
      }
    }

    return context;
  }
}