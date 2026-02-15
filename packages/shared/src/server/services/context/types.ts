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
  CURRENT_MICROCYCLE = 'currentMicrocycle',
  UPCOMING_MICROCYCLE = 'upcomingMicrocycle',
  PROGRAM_VERSION = 'programVersion',
  AVAILABLE_EXERCISES = 'availableExercises',
}
