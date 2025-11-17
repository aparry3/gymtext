import type { UserWithProfile } from '@/server/models/userModel';

/**
 * Interface for fitness profile context service (DI)
 */
export interface FitnessProfileContextService {
  getContext: (user: UserWithProfile) => Promise<string>;
}

/**
 * Dependencies for Mesocycle Agent (DI)
 */
export interface MesocycleAgentDeps {
  contextService: FitnessProfileContextService;
}

/**
 * Mesocycle overview returned by the agent
 */
export interface MesocycleOverview {
  description: string; // Long-form mesocycle description with microcycle delimiters
  microcycles: string[]; // Extracted microcycle overview strings
  formatted: string; // Markdown-formatted mesocycle for frontend display
  durationWeeks: number; // Number of weeks in the mesocycle (derived from microcycles.length)
}

// Re-export step types for convenience
export type {
  LongFormMesocycleConfig,
  LongFormMesocycleInput,
  LongFormMesocycleOutput,
  MesocycleChainContext,
} from './steps';

export type {
  FormattedMesocycleConfig,
} from './steps';
