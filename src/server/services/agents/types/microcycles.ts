import type { ModelConfig } from '@/server/agents';
import type { MicrocycleStructure } from '@/server/models/microcycle';
import type { Microcycle } from '@/server/models/microcycle';
import type { UserWithProfile } from '@/server/models/userModel';
import type { DayOfWeek } from '@/shared/utils/date';
import type { ExperienceLevel } from '@/server/services/context';

// Re-export for convenience
export type { MicrocycleStructure };

// =============================================================================
// Generate Operation Types
// =============================================================================

/**
 * Input for microcycle generation agent
 *
 * Uses the fitness plan text and user profile to generate a weekly pattern
 */
export interface MicrocycleGenerateInput {
  planText: string;        // Full fitness plan description
  userProfile: string;     // User's markdown profile
  absoluteWeek: number;    // Week number from plan start (1-indexed)
  isDeload: boolean;       // Whether this should be a deload week
  experienceLevel?: ExperienceLevel;  // User's experience level for context
}

/**
 * Output from microcycle generation (flattened subAgent results)
 */
export interface MicrocycleGenerateOutput {
  response: {
    overview: string;
    days: string[];
    isDeload: boolean;
  };
  message: string;
  structure: MicrocycleStructure;
}

/**
 * Dependencies for microcycle generate agent
 */
export interface MicrocycleGenerateAgentDeps {
  config?: ModelConfig;
}

// Legacy type aliases for backward compatibility
export type MicrocycleGenerationInput = MicrocycleGenerateInput;
export type MicrocycleAgentDeps = MicrocycleGenerateAgentDeps;

// =============================================================================
// Modify Operation Types
// =============================================================================

/**
 * Input for microcycle modification
 */
export interface ModifyMicrocycleInput {
  user: UserWithProfile;
  currentMicrocycle: Microcycle;
  changeRequest: string;
  currentDayOfWeek: DayOfWeek;
  weekNumber: number;
}

/**
 * Output from microcycle modification (flattened subAgent results)
 */
export interface ModifyMicrocycleOutput {
  response: {
    overview: string;
    days: string[];
    isDeload: boolean;
    wasModified: boolean;
    modifications: string;
  };
  message: string;
  structure: MicrocycleStructure;
}

/**
 * Dependencies for microcycle modify agent
 */
export interface ModifyMicrocycleAgentDeps {
  config?: ModelConfig;
}

// =============================================================================
// Legacy Output Types (for backward compatibility with services)
// =============================================================================

/**
 * @deprecated Use MicrocycleGenerateOutput instead
 * Legacy output format maintained for service layer compatibility
 */
export interface BaseMicrocycleAgentOutput {
  days: string[];          // Array of 7 day overviews [Monday-Sunday]
  description: string;     // Long-form narrative description of the weekly microcycle
  isDeload: boolean;       // Whether this is a deload week (reduced volume and intensity)
  wasModified?: boolean;   // Whether the microcycle was modified (only present for update operations)
  modifications?: string;  // Explanation of changes made (only present for update operations when wasModified is true)
}

/**
 * @deprecated Use MicrocycleGenerateOutput instead
 */
export interface MicrocycleAgentOutput extends BaseMicrocycleAgentOutput {
  message: string;        // SMS-formatted weekly check-in/breakdown message
  structure?: MicrocycleStructure; // Structured microcycle data
}
