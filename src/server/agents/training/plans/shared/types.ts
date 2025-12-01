import type { UserWithProfile } from '@/server/models/userModel';

/**
 * Context that flows through the fitness plan chain
 * Used by both generate and modify operations
 */
export interface FitnessPlanChainContext {
  user: UserWithProfile;
  fitnessPlan: string;
}

/**
 * Interface for fitness profile context service (DI)
 */
export interface FitnessProfileContextService {
  getContext: (user: UserWithProfile) => Promise<string>;
}
