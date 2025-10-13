import { UserWithProfile } from '../models/userModel';
import { welcomeMessageAgent } from '../agents/messaging/welcomeMessage/chain';

export class MessageService {
  constructor(
  ) {}

  public async sendMessage(user: UserWithProfile): Promise<string> {
    const result = await welcomeMessageAgent.invoke({ user });
    return result.value;
  }
}