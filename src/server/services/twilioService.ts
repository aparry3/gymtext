import { FitnessPlan } from '../models/fitnessPlan';
import { UserWithProfile } from '../models/userModel';
import { welcomeMessageAgent } from '../agents/messaging/welcomeMessage/chain';

export class MessageService {
  constructor(
  ) {}

  public async sendMessage(user: UserWithProfile, fitnessPlan: FitnessPlan): Promise<string> {
    const result = await welcomeMessageAgent.invoke({ user, context: { fitnessPlan } });
    return result.value;
  }
}