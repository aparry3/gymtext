import type { AgentDeps } from '@/server/agents/base';

/**
 * Input for combined plan+microcycle message agent
 * Uses pre-generated SMS messages from plan and microcycle
 */
export interface PlanMicrocycleCombinedInput {
  planMessage: string;
  microcycleMessage: string;
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
