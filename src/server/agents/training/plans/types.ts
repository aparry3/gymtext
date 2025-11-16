import type { UserWithProfile } from '@/server/models/userModel';

/**
 * Interface for fitness profile context service (DI)
 */
export interface FitnessProfileContextService {
  getContext: (user: UserWithProfile) => Promise<string>;
}

/**
 * Dependencies for FitnessPlan Agent (DI)
 */
export interface FitnessPlanAgentDeps {
  contextService: FitnessProfileContextService;
}

// Re-export step types for convenience
export type {
  LongFormPlanConfig,
  LongFormPlanInput,
  LongFormPlanOutput,
  FitnessPlanChainContext,
} from './steps';

export type {
  MesocycleExtractorConfig,
} from './steps';

export type {
  PlanMessageConfig,
} from './steps';
