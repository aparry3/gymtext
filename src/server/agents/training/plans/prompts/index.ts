// Generate prompts
export {
  FITNESS_PLAN_SYSTEM_PROMPT,
  fitnessPlanUserPrompt,
} from './generate';

// Modify prompts and schema
export {
  FITNESS_PLAN_MODIFY_SYSTEM_PROMPT,
  modifyFitnessPlanUserPrompt,
  ModifyFitnessPlanOutputSchema,
} from './modify';

// Formatted prompts
export {
  buildFormattedFitnessPlanSystemPrompt,
  createFormattedFitnessPlanUserPrompt,
} from './formatted';

// Message prompts
export {
  PLAN_SUMMARY_MESSAGE_SYSTEM_PROMPT,
  planSummaryMessageUserPrompt,
} from './message';

// Structured prompts
export {
  STRUCTURED_PLAN_SYSTEM_PROMPT,
  structuredPlanUserPrompt,
} from './structured';
