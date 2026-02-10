import type { ContextProvider } from '../types';
import type { UserWithProfile, WorkoutInstance } from '@/server/models';
import type { WorkoutInstanceServiceInstance } from '@/server/services/domain/training/workoutInstanceService';
import { buildWorkoutContext } from '@/server/services/context/builders';
import { today } from '@/shared/utils/date';

export function createCurrentWorkoutProvider(deps: {
  workoutInstanceService: WorkoutInstanceServiceInstance;
}): ContextProvider {
  return {
    name: 'currentWorkout',
    description: 'Current workout instance for today',
    params: { required: ['user'], optional: ['date', 'workout'] },
    resolve: async (params) => {
      const user = params.user as UserWithProfile;
      let workout = params.workout as WorkoutInstance | null | undefined;

      if (workout === undefined) {
        const targetDate = (params.date as Date | undefined) || today(user.timezone);
        workout = await deps.workoutInstanceService.getWorkoutByUserIdAndDate(user.id, targetDate);
      }

      return buildWorkoutContext(workout);
    },
  };
}
