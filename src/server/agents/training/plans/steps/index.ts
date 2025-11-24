// Generation step
export {
  FITNESS_PLAN_SYSTEM_PROMPT,
  fitnessPlanUserPrompt,
} from './generation/prompt';
export { createFitnessPlanGenerationRunnable } from './generation/chain';

// Structured step
export {
  STRUCTURED_FITNESS_PLAN_SYSTEM_PROMPT,
  fitnessPlanUserPrompt as structuredFitnessPlanUserPrompt,
} from './structured/prompt';
export { createStructuredFitnessPlanAgent } from './structured/chain';
export type {
  FitnessPlanOutput,
  StructuredFitnessPlanInput,
  FitnessPlanChainContext
} from './structured/types';

// Message step
export {
  PLAN_SUMMARY_MESSAGE_SYSTEM_PROMPT,
  planSummaryMessageUserPrompt,
} from './message/prompt';
export { createFitnessPlanMessageAgent } from './message/chain';
export type { FitnessPlanMessageConfig } from './message/types';

// Formatted step
export {
  buildFormattedFitnessPlanSystemPrompt,
  createFormattedFitnessPlanUserPrompt,
} from './formatted/prompt';
export { createFormattedFitnessPlanAgent } from './formatted/chain';
export type { FormattedFitnessPlanConfig } from './formatted/types';
