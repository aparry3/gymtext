// Main operation
export { createModifyFitnessPlanAgent, type ModifyFitnessPlanResult } from './chain';

// Types
export type { ModifyFitnessPlanInput, ModifyFitnessPlanOutput } from './steps/generation/types';
export { ModifyFitnessPlanOutputSchema } from './steps/generation/types';

// Generation prompts (for reference/testing)
export { FITNESS_PLAN_MODIFY_SYSTEM_PROMPT, modifyFitnessPlanUserPrompt } from './steps/generation/prompt';
