import type { AgentDeps } from '@/server/agents/base';
import type { MicrocycleStructure } from '@/server/agents/training/schemas';

/**
 * Input for microcycle generation agent
 *
 * Uses the fitness plan text and user profile to generate a weekly pattern
 */
export interface MicrocycleGenerationInput {
  planText: string;        // Full fitness plan description
  userProfile: string;     // User's markdown profile
  absoluteWeek: number;    // Week number from plan start (1-indexed)
  isDeload: boolean;       // Whether this should be a deload week
}

/**
 * Output from microcycle agent
 */
export interface BaseMicrocycleAgentOutput {
  days: string[];          // Array of 7 day overviews [Monday-Sunday]
  description: string;     // Long-form narrative description of the weekly microcycle
  isDeload: boolean;       // Whether this is a deload week (reduced volume and intensity)
  formatted: string;       // Markdown-formatted weekly overview for frontend display
  wasModified?: boolean;   // Whether the microcycle was modified (only present for update operations)
  modifications?: string;  // Explanation of changes made (only present for update operations when wasModified is true)
}

export interface MicrocycleAgentOutput extends BaseMicrocycleAgentOutput {
  message: string;        // SMS-formatted weekly check-in/breakdown message
  structure?: MicrocycleStructure; // Structured microcycle data
}


/**
 * Dependencies for microcycle pattern agent
 * Currently extends only base AgentDeps (config), but allows for future extension
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface MicrocycleAgentDeps extends AgentDeps {
  // Future: Could add pattern templates or progressive overload strategies
}
