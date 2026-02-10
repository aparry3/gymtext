import type { ContextProvider } from '../types';
import type { ExerciseRepository } from '@/server/repositories/exerciseRepository';
import { buildExercisesContext } from '@/server/services/context/builders';

export function createAvailableExercisesProvider(deps: {
  exerciseRepo: ExerciseRepository;
}): ContextProvider {
  return {
    name: 'availableExercises',
    description: 'List of available exercises from the database',
    params: {},
    resolve: async () => {
      const exercises = await deps.exerciseRepo.listActiveNames();
      return buildExercisesContext(exercises);
    },
  };
}
