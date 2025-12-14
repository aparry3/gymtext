import type { ModelConfig } from '@/server/agents/configurable';
import type { WorkoutStructure } from '@/server/agents/training/schemas';
import type { UserWithProfile } from '@/server/models/userModel';
import type { WorkoutInstance } from '@/server/models/workout';

// Re-export for convenience
export type { WorkoutStructure };

// =============================================================================
// Base Types
// =============================================================================

/**
 * Base input for all workout operations
 */
export interface BaseWorkoutChainInput {
  user: UserWithProfile;
  date: Date;
}

/**
 * Input that subAgents receive from parent agent
 * The parent's output is passed as `response`
 */
export interface WorkoutSubAgentInput {
  response: string;
}

// =============================================================================
// Generate Operation Types
// =============================================================================

/**
 * Input for workout generation operation
 */
export interface WorkoutGenerateInput {
  user: UserWithProfile;
  date: Date;
  dayOverview: string;
  isDeload?: boolean;
}

/**
 * Output from workout generation (flattened subAgent results)
 */
export interface WorkoutGenerateOutput {
  response: string;
  formatted: string;
  message: string;
  structure: WorkoutStructure;
}

/**
 * Dependencies for workout generate agent
 */
export interface WorkoutGenerateAgentDeps {
  config?: ModelConfig;
}

// Alias for result type
export type WorkoutGenerateResult = WorkoutGenerateOutput;

// =============================================================================
// Modify Operation Types
// =============================================================================

/**
 * Input for workout modification
 */
export interface ModifyWorkoutInput {
  user: UserWithProfile;
  date: Date;
  workout: WorkoutInstance;
  changeRequest: string;
}

/**
 * Output from workout modification (flattened subAgent results)
 */
export interface ModifyWorkoutOutput {
  response: {
    overview: string;
    wasModified: boolean;
    modifications: string;
  };
  formatted: string;
  message: string;
  structure: WorkoutStructure;
}

/**
 * Dependencies for workout modification agent
 */
export interface ModifyWorkoutAgentDeps {
  config?: ModelConfig;
}

// Alias for result type
export type WorkoutModifyResult = ModifyWorkoutOutput;

// =============================================================================
// Formatted Step Types
// =============================================================================

/**
 * Configuration for formatted workout agent
 */
export interface FormattedWorkoutConfig {
  includeModifications?: boolean;
  operationName: string;
  agentConfig?: ModelConfig;
}

/**
 * Input for formatted workout agent (as subAgent)
 */
export interface FormattedWorkoutInput {
  response: string;
}

/**
 * Output from formatted workout agent
 */
export type FormattedWorkoutOutput = string;

// =============================================================================
// Message Step Types
// =============================================================================

/**
 * Configuration for workout message agent
 */
export interface WorkoutMessageConfig {
  operationName?: string;
  agentConfig?: ModelConfig;
}

/**
 * Input for workout message agent (as subAgent)
 */
export interface WorkoutMessageInput {
  response: string;
}

/**
 * Output from workout message agent
 */
export type WorkoutMessageOutput = string;

// =============================================================================
// Structured Step Types
// =============================================================================

/**
 * Configuration for structured workout agent
 */
export interface StructuredWorkoutConfig {
  operationName?: string;
  agentConfig?: ModelConfig;
}

/**
 * Input for structured workout agent (as subAgent)
 */
export interface StructuredWorkoutInput {
  response: string;
}

/**
 * Output from structured workout agent
 */
export type StructuredWorkoutOutput = WorkoutStructure;

// =============================================================================
// Legacy Types (deprecated)
// =============================================================================

/**
 * @deprecated Use WorkoutSubAgentInput instead
 */
export interface WorkoutChainContext extends BaseWorkoutChainInput {
  description: string;
  wasModified?: boolean;
  modifications?: string;
}

/**
 * @deprecated Use WorkoutGenerateResult or WorkoutModifyResult instead
 */
export interface WorkoutChainResult {
  formatted: string;
  message: string;
  description: string;
  structure?: WorkoutStructure;
}
