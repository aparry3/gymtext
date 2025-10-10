import { UserWithProfile } from '../models/userModel';
import { messagingClient, type MessageResult } from '../connections/messaging';
import { ConversationService } from './conversationService';
import { welcomeMessageAgent } from '../agents';
import { generateDailyWorkoutMessage, generateModifiedWorkoutMessage } from '../agents/messaging/workoutMessage/chain';
import { FitnessPlan } from '../models';
import { WorkoutInstance, EnhancedWorkoutInstance } from '../models/workout';
import type { WorkoutMessageContext } from '../agents/messaging/workoutMessage/types';

export class MessageService {
  private static instance: MessageService;
  private conversationService: ConversationService;

  private constructor() {
    this.conversationService = ConversationService.getInstance();
  }

  public static getInstance(): MessageService {
    if (!MessageService.instance) {
      MessageService.instance = new MessageService();
    }
    return MessageService.instance;
  }

  public async buildWelcomeMessage(user: UserWithProfile, fitnessPlan: FitnessPlan): Promise<string> {
    const welcomeAgentResponse = await welcomeMessageAgent.invoke({ user, context: { fitnessPlan } });
    const welcomeMessage = welcomeAgentResponse.value;

    return String(welcomeMessage);
  }

  public async buildDailyMessage(user: UserWithProfile, workout: WorkoutInstance): Promise<string> {
    return await generateDailyWorkoutMessage(user, workout);
  }

  public async buildModificationMessage(
    user: UserWithProfile,
    workout: EnhancedWorkoutInstance,
    context: Omit<WorkoutMessageContext, 'type'>
  ): Promise<string> {
    return await generateModifiedWorkoutMessage(user, workout, context);
  }


  public async sendMessage(user: UserWithProfile, message: string): Promise<MessageResult> {
    // Get the provider from the messaging client
    const provider = messagingClient.provider;

    try {
        const stored = await this.conversationService.storeOutboundMessage(
            user.id,
            user.phoneNumber,
            message,
            undefined, // from (uses default)
            provider, // messaging provider
            undefined  // providerMessageId (not available yet)
        );
        if (!stored) {
            console.warn('Circuit breaker prevented storing outbound message');
        }
        } catch (error) {
            // Log error but don't block SMS processing
            console.error('Failed to store outbound message:', error);
        }

    const messageResult = await messagingClient.sendMessage(user.phoneNumber, message);

    return messageResult;
  }
}

// Export singleton instance
export const messageService = MessageService.getInstance();