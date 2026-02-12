import type { WorkoutInstance } from '@/server/models';

/**
 * Build current workout context content (raw, without XML wrapper)
 *
 * @param workout - Current workout instance (optional)
 * @returns Raw content string (XML wrapper applied by template)
 */
export const buildWorkoutContext = (workout: WorkoutInstance | null | undefined): string => {
  if (!workout) {
    return 'No workout scheduled';
  }

  return workout.description || workout.sessionType || 'Workout';
};
