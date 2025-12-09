// Formatted step (shared across all fitness plan operations)
export {
  buildFormattedFitnessPlanSystemPrompt,
  createFormattedFitnessPlanUserPrompt,
} from './formatted/prompt';
export { createFormattedFitnessPlanAgent } from './formatted/chain';
export type { FormattedFitnessPlanConfig } from './formatted/types';

// Message step (shared across all fitness plan operations)
export {
  PLAN_SUMMARY_MESSAGE_SYSTEM_PROMPT,
  planSummaryMessageUserPrompt,
} from './message/prompt';
export { createFitnessPlanMessageAgent } from './message/chain';
export type { FitnessPlanMessageConfig } from './message/types';

// Structured step (shared across all fitness plan operations)
export {
  STRUCTURED_PLAN_SYSTEM_PROMPT,
  structuredPlanUserPrompt,
} from './structured/prompt';
export { createStructuredPlanAgent } from './structured/chain';
export type { StructuredPlanConfig, StructuredPlanOutput } from './structured/types';
