/**
 * Context Provider Registration
 *
 * Registers all context providers with a ContextRegistry instance.
 * Providers that need service dependencies are created via closures.
 *
 * Note: experienceLevel and dayFormat are now handled as agent extensions,
 * not as context providers. See agent_extensions table.
 */
import type { ContextRegistry } from '../contextRegistry';
import type { FitnessPlanServiceInstance } from '@/server/services/domain/training/fitnessPlanService';
import type { WorkoutInstanceServiceInstance } from '@/server/services/domain/training/workoutInstanceService';
import type { MicrocycleServiceInstance } from '@/server/services/domain/training/microcycleService';
import type { EnrollmentServiceInstance } from '@/server/services/domain/program/enrollmentService';
import type { ExerciseRepository } from '@/server/repositories/exerciseRepository';
import type { ContextTemplateServiceInstance } from '@/server/services/domain/context/contextTemplateService';

// Simple providers (no service deps)
import { createUserProvider } from './user';
import { createUserProfileProvider } from './userProfile';
import { createDateContextProvider } from './dateContext';

// Factory providers (need service deps)
import { createDayOverviewProvider } from './dayOverview';
import { createTrainingMetaProvider } from './trainingMeta';
import { createFitnessPlanProvider } from './fitnessPlan';
import { createCurrentWorkoutProvider } from './currentWorkout';
import { createCurrentMicrocycleProvider } from './currentMicrocycle';
import { createProgramVersionProvider } from './programVersion';
import { createAvailableExercisesProvider } from './availableExercises';

export interface ContextRegistryDeps {
  fitnessPlanService: FitnessPlanServiceInstance;
  workoutInstanceService: WorkoutInstanceServiceInstance;
  microcycleService: MicrocycleServiceInstance;
  enrollmentService: EnrollmentServiceInstance;
  exerciseRepo?: ExerciseRepository;
  contextTemplateService: ContextTemplateServiceInstance;
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
  const { contextTemplateService } = deps;

  // Simple providers (now with template support)
  registry.register(createUserProvider({ contextTemplateService }));
  registry.register(createUserProfileProvider({ contextTemplateService }));
  registry.register(createDateContextProvider({ contextTemplateService }));

  // Service-dependent providers
  registry.register(createDayOverviewProvider({
    microcycleService: deps.microcycleService,
    contextTemplateService,
  }));

  registry.register(createTrainingMetaProvider({
    microcycleService: deps.microcycleService,
    contextTemplateService,
  }));

  registry.register(createFitnessPlanProvider({
    fitnessPlanService: deps.fitnessPlanService,
    contextTemplateService,
  }));

  registry.register(createCurrentWorkoutProvider({
    workoutInstanceService: deps.workoutInstanceService,
    contextTemplateService,
  }));

  registry.register(createCurrentMicrocycleProvider({
    microcycleService: deps.microcycleService,
    contextTemplateService,
  }));

  registry.register(createProgramVersionProvider({
    enrollmentService: deps.enrollmentService,
    contextTemplateService,
  }));

  if (deps.exerciseRepo) {
    registry.register(createAvailableExercisesProvider({
      exerciseRepo: deps.exerciseRepo,
      contextTemplateService,
    }));
  }
}
