/**
 * Centralized prompts for all agent services
 */

// Chat prompts
export { CHAT_SYSTEM_PROMPT } from './chat';

// Modifications prompts
export {
  MODIFICATIONS_SYSTEM_PROMPT,
  buildModificationsUserMessage,
  type ModificationsUserMessageInput,
} from './modifications';

// Profile prompts
export {
  PROFILE_UPDATE_SYSTEM_PROMPT,
  buildProfileUpdateUserMessage,
  USER_FIELDS_SYSTEM_PROMPT,
  buildUserFieldsUserMessage,
  STRUCTURED_PROFILE_SYSTEM_PROMPT,
  buildStructuredProfileUserMessage,
} from './profile';

// Plans prompts
export {
  FITNESS_PLAN_SYSTEM_PROMPT,
  FITNESS_PLAN_GENERATE_USER_PROMPT,
  FITNESS_PLAN_MODIFY_SYSTEM_PROMPT,
  FITNESS_PLAN_MODIFY_USER_PROMPT,
  ModifyFitnessPlanOutputSchema,
  type ModifyFitnessPlanOutput,
  PLAN_SUMMARY_MESSAGE_SYSTEM_PROMPT,
  planSummaryMessageUserPrompt,
  type PlanMessageData,
  STRUCTURED_PLAN_SYSTEM_PROMPT,
  structuredPlanUserPrompt,
} from './plans';

// Workouts prompts
export {
  DAILY_WORKOUT_SYSTEM_PROMPT,
  dailyWorkoutUserPrompt,
  MODIFY_WORKOUT_SYSTEM_PROMPT,
  modifyWorkoutUserPrompt,
  ModifyWorkoutGenerationOutputSchema,
  type ModifyWorkoutGenerationOutput,
  WORKOUT_SMS_FORMATTER_SYSTEM_PROMPT,
  workoutSmsUserPrompt,
  STRUCTURED_WORKOUT_SYSTEM_PROMPT,
  structuredWorkoutUserPrompt,
} from './workouts';

// Microcycles prompts
export {
  MICROCYCLE_SYSTEM_PROMPT,
  microcycleUserPrompt,
  MicrocycleGenerationOutputSchema,
  type MicrocycleGenerationOutput,
  MICROCYCLE_MODIFY_SYSTEM_PROMPT,
  modifyMicrocycleUserPrompt,
  ModifyMicrocycleOutputSchema,
  type ModifyMicrocycleOutput,
  MICROCYCLE_MESSAGE_SYSTEM_PROMPT,
  microcycleMessageUserPrompt,
  STRUCTURED_MICROCYCLE_SYSTEM_PROMPT,
  structuredMicrocycleUserPrompt,
} from './microcycles';
