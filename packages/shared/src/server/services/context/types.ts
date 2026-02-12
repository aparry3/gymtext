/**
 * Context types that can be requested from the ContextRegistry
 */
export enum ContextType {
  USER = 'user',
  USER_PROFILE = 'userProfile',
  FITNESS_PLAN = 'fitnessPlan',
  DAY_OVERVIEW = 'dayOverview',
  CURRENT_WORKOUT = 'currentWorkout',
  DATE_CONTEXT = 'dateContext',
  TRAINING_META = 'trainingMeta',
  CURRENT_MICROCYCLE = 'currentMicrocycle',
  PROGRAM_VERSION = 'programVersion',
  AVAILABLE_EXERCISES = 'availableExercises',
}
