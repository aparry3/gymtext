import type { MesocycleOverview } from '@/server/models/fitnessPlan';
import type { MicrocyclePattern } from '@/server/models/microcycle';
import type { AgentDeps } from '@/server/agents/base';

/**
 * Input for microcycle pattern agent
 */
export interface MicrocyclePatternInput {
  mesocycle: MesocycleOverview;
  weekNumber: number;
  programType: string;
  notes?: string | null;
}

/**
 * Output from microcycle pattern agent
 */
export type MicrocyclePatternOutput = MicrocyclePattern;

/**
 * Dependencies for microcycle pattern agent
 * Currently extends only base AgentDeps (config), but allows for future extension
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface MicrocyclePatternAgentDeps extends AgentDeps {
  // Future: Could add pattern templates or progressive overload strategies
}
