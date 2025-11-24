import type { UserWithProfile } from '@/server/models/userModel';
import { AgentConfig } from '../../base';

export interface FitnessPlanConfig {
  agentConfig?: AgentConfig;
  maxRetries?: number;
}

/**
 * Interface for fitness profile context service (DI)
 */
export interface FitnessProfileContextService {
  getContext: (user: UserWithProfile) => Promise<string>;
}


export type {
  FitnessPlanMessageConfig,
} from './steps/message/types';
export type {
  FormattedFitnessPlanConfig,
} from './steps/formatted/types';
