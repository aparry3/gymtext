import type { UserWithProfile } from '@/server/models/userModel';
import type { FitnessPlan } from '@/server/models/fitnessPlan';
import type { Microcycle } from '@/server/models/microcycle';
import type { AgentDeps } from '@/server/agents/base';

/**
 * Input for combined plan+microcycle message agent
 */
export interface PlanMicrocycleCombinedInput {
  user: UserWithProfile;
  plan: FitnessPlan;
  microcycle: Microcycle;
}

/**
 * Output from combined plan+microcycle message agent
 */
export interface PlanMicrocycleCombinedOutput {
  message: string;
}

/**
 * Dependencies for combined plan+microcycle message agent
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PlanMicrocycleCombinedAgentDeps extends AgentDeps {
  // Future: Could add SMS formatting service or message templates
}
