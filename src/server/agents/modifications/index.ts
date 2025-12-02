// Types
export type { ModificationsAgentInput, ModificationsResponse } from './types';
export { ModificationsResponseSchema } from './types';

// Agent factory
export { createModificationsAgent, type ModificationsAgentDeps } from './chain';

// Tools
export {
  createModificationTools,
  type ModificationToolDeps,
  type ModificationToolContext,
  type ModifyWorkoutParams,
  type ModifyWeekParams,
  type ModifyPlanParams,
  type WorkoutModificationService,
  type MicrocycleModificationService,
  type PlanModificationServiceInterface,
} from './tools';

// Prompts
export { MODIFICATIONS_SYSTEM_PROMPT, buildModificationsUserMessage } from './prompts';

// Message sub-agent
export { createModificationMessageRunnable } from './message/chain';
