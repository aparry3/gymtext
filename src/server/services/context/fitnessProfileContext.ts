import { UserWithProfile } from '@/server/models/userModel';
import { fitnessProfileSubstring } from './template';

export class FitnessProfileContext {
  constructor(
    private user: UserWithProfile
  ) {}

  public async getContext(): Promise<string> {
   return fitnessProfileSubstring(this.user);
  }
}