import type { AgentDeps } from '@/server/agents/base';
import type { DayOfWeek } from '@/shared/utils/date';

/**
 * Input for combined plan+microcycle message agent
 * Uses fitness plan summary and week one breakdown
 */
export interface PlanMicrocycleCombinedInput {
  fitnessPlan: string;
  weekOne: string;
  currentWeekday: DayOfWeek;
}

/**
 * Output from combined plan+microcycle message agent
 */
export type PlanMicrocycleCombinedOutput = string;

/**
 * Dependencies for combined plan+microcycle message agent
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PlanMicrocycleCombinedAgentDeps extends AgentDeps {
  // Future: Could add SMS formatting service or message templates
}
