import { UserWithProfile } from '@/server/models/userModel';
import { formatFitnessProfile } from '@/server/utils/formatters';

/**
 * Fitness Profile Context Service
 *
 * Wrapper service for fitness profile formatting to support dependency injection.
 * For direct usage, prefer importing formatFitnessProfile from @/server/utils/formatters.
 */
export class FitnessProfileContext {
  constructor() {}

  public async getContext(user: UserWithProfile): Promise<string> {
    return formatFitnessProfile(user);
  }
}