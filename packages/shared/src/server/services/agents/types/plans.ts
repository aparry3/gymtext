import type { ModelConfig } from '@/server/agents';
import type { PlanStructure } from '@/server/models/fitnessPlan';
import type { FitnessPlan } from '@/server/models/fitnessPlan';
import type { UserWithProfile } from '@/server/models/user';

// Re-export for convenience
export type { PlanStructure };

// =============================================================================
// Generate Operation Types
// =============================================================================

/**
 * Input for fitness plan generation
 */
export interface FitnessPlanGenerateInput {
  user: UserWithProfile;
}

/**
 * Output from fitness plan generation (flattened subAgent results)
 */
export interface FitnessPlanGenerateOutput {
  response: string;       // Main plan description
  message: string;        // SMS message
  structure: PlanStructure;
}

/**
 * Dependencies for fitness plan generate agent
 */
export interface FitnessPlanGenerateAgentDeps {
  config?: ModelConfig;
}

// =============================================================================
// Modify Operation Types
// =============================================================================

/**
 * Input for fitness plan modification
 */
export interface ModifyFitnessPlanInput {
  user: UserWithProfile;
  currentPlan: FitnessPlan;
  changeRequest: string;
}

/**
 * Output from fitness plan modification (flattened subAgent results)
 */
export interface ModifyFitnessPlanOutput {
  response: {
    description: string;
    wasModified: boolean;
    modifications: string;
  };
  structure: PlanStructure;
}

/**
 * Dependencies for fitness plan modify agent
 */
export interface ModifyFitnessPlanAgentDeps {
  config?: ModelConfig;
}

