// Main agent
export { createFitnessPlanGenerateAgent, createFitnessPlanAgent } from './chain';

// Generation prompts
export { FITNESS_PLAN_SYSTEM_PROMPT, fitnessPlanUserPrompt } from './steps/generation/prompt';

// Types
export type { FitnessPlanConfig, FitnessPlanInput } from './steps/generation/types';
export type { FitnessPlanChainContext } from '../../shared/types';
