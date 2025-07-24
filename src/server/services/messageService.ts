import { UserWithProfile } from '../models/userModel';
import { twilioClient } from '../connections/twilio/twilio';
import { ConversationService } from './conversationService';
import { dailyMessageAgent, welcomeMessageAgent } from '../agents';
import { FitnessPlan } from '../models';
import { WorkoutInstance } from '../models/workout';

export class MessageService {
  private conversationService: ConversationService;
  constructor(
  ) {
    this.conversationService = new ConversationService();
  }

  public async buildWelcomeMessage(user: UserWithProfile, fitnessPlan: FitnessPlan): Promise<string> {
    const welcomeAgentResponse = await welcomeMessageAgent.invoke({ user, context: { fitnessPlan } });
    const welcomeMessage = welcomeAgentResponse.value;

    return String(welcomeMessage);
  }

  public async buildDailyMessage(user: UserWithProfile, workout: WorkoutInstance): Promise<string> {
    const welcomeAgentResponse = await dailyMessageAgent.invoke({ user, context: { workout } });
    const welcomeMessage = welcomeAgentResponse.value;

    return String(welcomeMessage);
  }


  public async sendMessage(user: UserWithProfile, message: string): Promise<string> {
    try {
        const stored = await this.conversationService.storeOutboundMessage(
            user.id,
            user.phoneNumber,
            message
        );
        if (!stored) {
            console.warn('Circuit breaker prevented storing outbound message');
        }
        } catch (error) {
            // Log error but don't block SMS processing
            console.error('Failed to store outbound message:', error);
        }

    await twilioClient.sendSMS(user.phoneNumber, message);

    return message;
  }
}