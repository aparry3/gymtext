// Generation step
export {
  FITNESS_PLAN_SYSTEM_PROMPT,
  fitnessPlanUserPrompt,
} from './generation/prompt';
export { createLongFormPlanRunnable, type FitnessPlanChainContext } from './generation/chain';
export type {
  LongFormPlanConfig,
  LongFormPlanInput,
  LongFormPlanOutput,
} from './generation/types';

// Structure step
export {
  STRUCTURED_FITNESS_PLAN_SYSTEM_PROMPT,
  structuredFitnessPlanUserPrompt,
} from './structure/prompt';
export { createStructuredPlanAgent } from './structure/chain';
export type { StructuredPlanConfig } from './structure/types';

// Message step
export {
  PLAN_SUMMARY_MESSAGE_SYSTEM_PROMPT,
  planSummaryMessageUserPrompt,
} from './message/prompt';
export { createPlanMessageAgent } from './message/chain';
export type { PlanMessageConfig } from './message/types';
