import { UserWithProfile } from '@/server/models/userModel';
import { fitnessProfileSubstring } from './template';

export class FitnessProfileContext {
  constructor(
  ) {}

  public async getContext(user: UserWithProfile): Promise<string> {
   return fitnessProfileSubstring(user);
  }
}