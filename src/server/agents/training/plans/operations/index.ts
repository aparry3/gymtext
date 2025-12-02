// Generate operation
export {
  createFitnessPlanGenerateAgent,
  createFitnessPlanAgent,
  FITNESS_PLAN_SYSTEM_PROMPT,
  fitnessPlanUserPrompt,
  type FitnessPlanConfig,
  type FitnessPlanInput,
  type FitnessPlanChainContext,
} from './generate';

// Modify operation
export {
  createModifyFitnessPlanAgent,
  FITNESS_PLAN_MODIFY_SYSTEM_PROMPT,
  modifyFitnessPlanUserPrompt,
  ModifyFitnessPlanOutputSchema,
  type ModifyFitnessPlanResult,
  type ModifyFitnessPlanInput,
  type ModifyFitnessPlanOutput,
} from './modify';
