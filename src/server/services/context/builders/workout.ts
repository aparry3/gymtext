import type { WorkoutInstance } from '@/server/models';

/**
 * Build current workout context string
 *
 * @param workout - Current workout instance (optional)
 * @returns Formatted context string with XML tags
 */
export const buildWorkoutContext = (workout: WorkoutInstance | null | undefined): string => {
  if (!workout) {
    return '<CurrentWorkout>No workout scheduled</CurrentWorkout>';
  }

  // Include workout description or session type
  const description = workout.description || workout.sessionType || 'Workout';

  return `<CurrentWorkout>${description}</CurrentWorkout>`;
};
