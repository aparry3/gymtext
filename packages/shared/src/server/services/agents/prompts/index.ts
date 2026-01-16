/**
 * Centralized prompts for all agent services
 *
 * NOTE: System prompt string constants have been removed from this module.
 * Runtime prompts are fetched from the database via PROMPT_IDS.
 *
 * Schemas have been moved to schemas/*.ts
 * Types have been moved to types/*.ts
 *
 * This module now only exports template functions for building user messages.
 */

// Modifications prompts
export { buildModificationsUserMessage } from './modifications';

// Profile prompts
export {
  buildProfileUpdateUserMessage,
  buildUserFieldsUserMessage,
  buildStructuredProfileUserMessage,
} from './profile';

// Plans prompts
export {
  planSummaryMessageUserPrompt,
  structuredPlanUserPrompt,
} from './plans';

// Microcycles prompts
export {
  microcycleMessageUserPrompt,
  structuredMicrocycleUserPrompt,
} from './microcycles';
