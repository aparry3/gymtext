import type { AgentDeps } from '@/server/agents/base';
import type { DayOverviews } from './steps/days/types';

/**
 * Input for microcycle pattern agent
 * Uses the specific microcycle overview from mesocycle.microcycles[index]
 */
export interface MicrocyclePatternInput {
  microcycleOverview: string; // Specific microcycle description from mesocycle.microcycles[index]
  weekNumber: number;
}

/**
 * Output from microcycle pattern agent
 */
export interface MicrocyclePatternOutput {
  dayOverviews: DayOverviews; // Individual day overviews extracted from description
  description: string; // Long-form narrative description of the weekly microcycle
  isDeload: boolean; // Whether this is a deload week (reduced volume and intensity)
  formatted: string; // Markdown-formatted weekly overview for frontend display
  message: string; // SMS-formatted weekly check-in/breakdown message
}

/**
 * Dependencies for microcycle pattern agent
 * Currently extends only base AgentDeps (config), but allows for future extension
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface MicrocyclePatternAgentDeps extends AgentDeps {
  // Future: Could add pattern templates or progressive overload strategies
}
