/**
 * Context Provider Registration
 *
 * Registers all context providers with a ContextRegistry instance.
 * Providers that need service dependencies are created via closures.
 */
import type { ContextRegistry } from '../contextRegistry';
import type { FitnessPlanServiceInstance } from '@/server/services/domain/training/fitnessPlanService';
import type { WorkoutInstanceServiceInstance } from '@/server/services/domain/training/workoutInstanceService';
import type { MicrocycleServiceInstance } from '@/server/services/domain/training/microcycleService';
import type { FitnessProfileServiceInstance } from '@/server/services/domain/user/fitnessProfileService';
import type { EnrollmentServiceInstance } from '@/server/services/domain/program/enrollmentService';
import type { ExerciseRepository } from '@/server/repositories/exerciseRepository';

// Simple providers (no service deps)
import { userProvider } from './user';
import { userProfileProvider } from './userProfile';
import { dateContextProvider } from './dateContext';

// Factory providers (need service deps)
import { createDayOverviewProvider } from './dayOverview';
import { createTrainingMetaProvider } from './trainingMeta';
import { createDayFormatProvider } from './dayFormat';
import { createFitnessPlanProvider } from './fitnessPlan';
import { createCurrentWorkoutProvider } from './currentWorkout';
import { createCurrentMicrocycleProvider } from './currentMicrocycle';
import { createExperienceLevelProvider } from './experienceLevel';
import { createProgramVersionProvider } from './programVersion';
import { createAvailableExercisesProvider } from './availableExercises';

export interface ContextRegistryDeps {
  fitnessPlanService: FitnessPlanServiceInstance;
  workoutInstanceService: WorkoutInstanceServiceInstance;
  microcycleService: MicrocycleServiceInstance;
  fitnessProfileService: FitnessProfileServiceInstance;
  enrollmentService: EnrollmentServiceInstance;
  exerciseRepo?: ExerciseRepository;
}

/**
 * Register all context providers with the given registry.
 *
 * Simple providers are registered directly.
 * Service-dependent providers are created via factory closures.
 */
export function registerAllContextProviders(
  registry: ContextRegistry,
  deps: ContextRegistryDeps
): void {
  // Simple providers
  registry.register(userProvider);
  registry.register(userProfileProvider);
  registry.register(dateContextProvider);

  // Service-dependent providers
  registry.register(createDayOverviewProvider({
    microcycleService: deps.microcycleService,
  }));

  registry.register(createTrainingMetaProvider({
    microcycleService: deps.microcycleService,
  }));

  registry.register(createDayFormatProvider({
    microcycleService: deps.microcycleService,
  }));

  registry.register(createFitnessPlanProvider({
    fitnessPlanService: deps.fitnessPlanService,
  }));

  registry.register(createCurrentWorkoutProvider({
    workoutInstanceService: deps.workoutInstanceService,
  }));

  registry.register(createCurrentMicrocycleProvider({
    microcycleService: deps.microcycleService,
  }));

  registry.register(createExperienceLevelProvider({
    fitnessProfileService: deps.fitnessProfileService,
  }));

  registry.register(createProgramVersionProvider({
    enrollmentService: deps.enrollmentService,
  }));

  if (deps.exerciseRepo) {
    registry.register(createAvailableExercisesProvider({
      exerciseRepo: deps.exerciseRepo,
    }));
  }
}
