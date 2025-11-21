import type { UserWithProfile } from '@/server/models/userModel';

/**
 * Interface for fitness profile context service (DI)
 */
export interface FitnessProfileContextService {
  getContext: (user: UserWithProfile) => Promise<string>;
}


// Re-export step types for convenience
export type {
  FitnessPlanOutput,
  FitnessPlanChainContext,
} from './steps/generation/types';

export type {
  FitnessPlanMessageConfig,
} from './steps/message/types';
export type {
  FormattedFitnessPlanConfig,
} from './steps/formatted/types';
