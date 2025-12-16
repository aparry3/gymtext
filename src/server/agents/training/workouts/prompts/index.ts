// Generate workout prompts
export { DAILY_WORKOUT_SYSTEM_PROMPT, dailyWorkoutUserPrompt } from './generate';

// Modify workout prompts + schema
export {
  MODIFY_WORKOUT_SYSTEM_PROMPT,
  modifyWorkoutUserPrompt,
  ModifyWorkoutGenerationOutputSchema,
  type ModifyWorkoutGenerationOutput,
} from './modify';

// Message (SMS) prompts
export { WORKOUT_SMS_FORMATTER_SYSTEM_PROMPT, workoutSmsUserPrompt } from './message';

// Structured workout prompts
export { STRUCTURED_WORKOUT_SYSTEM_PROMPT, structuredWorkoutUserPrompt } from './structured';
