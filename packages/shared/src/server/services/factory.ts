/**
 * Service Factory
 *
 * Creates service instances with injected repositories.
 * Services are stateless - repos are passed to each factory function.
 *
 * @example
 * const repos = createRepositories(db);
 * const services = createServices(repos);
 * await services.user.getUserById(userId);
 */
import type { Kysely } from 'kysely';
import type { DB } from '../models/_types';
import { createRepositories, type RepositoryContainer } from '../repositories/factory';

// Import service factory functions (to be created)
import { createUserService, type UserServiceInstance } from './user/userService';
import { createFitnessProfileService, type FitnessProfileServiceInstance } from './user/fitnessProfileService';
import { createOnboardingDataService, type OnboardingDataServiceInstance } from './user/onboardingDataService';
import { createMessageService, type MessageServiceInstance } from './messaging/messageService';
import { createFitnessPlanService, type FitnessPlanServiceInstance } from './training/fitnessPlanService';
import { createWorkoutInstanceService, type WorkoutInstanceServiceInstance } from './training/workoutInstanceService';
import { createMicrocycleService, type MicrocycleServiceInstance } from './training/microcycleService';
import { createProgressService, type ProgressServiceInstance } from './training/progressService';
import { createSubscriptionService, type SubscriptionServiceInstance } from './subscription/subscriptionService';
import { createDayConfigService, type DayConfigServiceInstance } from './calendar/dayConfigService';
import { createContextService, type ContextService } from './context/contextService';

/**
 * Container for all service instances
 */
export interface ServiceContainer {
  user: UserServiceInstance;
  fitnessProfile: FitnessProfileServiceInstance;
  onboardingData: OnboardingDataServiceInstance;
  message: MessageServiceInstance;
  fitnessPlan: FitnessPlanServiceInstance;
  workoutInstance: WorkoutInstanceServiceInstance;
  microcycle: MicrocycleServiceInstance;
  progress: ProgressServiceInstance;
  subscription: SubscriptionServiceInstance;
  dayConfig: DayConfigServiceInstance;
}

/**
 * Create all service instances with the given repositories
 *
 * Services are created in dependency order:
 * 1. Services with no service dependencies (only repos)
 * 2. Services that depend on other services
 *
 * @param repos - Repository container
 * @returns Service container with all service instances
 */
export function createServices(repos: RepositoryContainer): ServiceContainer {
  // Phase 1: Create services with no service dependencies
  const user = createUserService(repos);
  const fitnessProfile = createFitnessProfileService(repos);
  const onboardingData = createOnboardingDataService(repos);
  const fitnessPlan = createFitnessPlanService(repos);
  const workoutInstance = createWorkoutInstanceService(repos);
  const microcycle = createMicrocycleService(repos);
  const progress = createProgressService(repos);
  const subscription = createSubscriptionService(repos);
  const dayConfig = createDayConfigService(repos);

  // Phase 2: Create services that depend on other services
  const message = createMessageService(repos, {
    user,
    workoutInstance,
  });

  return {
    user,
    fitnessProfile,
    onboardingData,
    message,
    fitnessPlan,
    workoutInstance,
    microcycle,
    progress,
    subscription,
    dayConfig,
  };
}

/**
 * Create services directly from a database instance
 *
 * Convenience function that creates repositories and services in one call.
 *
 * @param db - Kysely database instance
 * @returns Service container
 */
export function createServicesFromDb(db: Kysely<DB>): ServiceContainer {
  return createServices(createRepositories(db));
}

/**
 * Create a ContextService from a ServiceContainer
 *
 * Convenience function for creating a ContextService with services from the container.
 *
 * @param services - Service container
 * @returns ContextService instance
 */
export function createContextServiceFromContainer(services: ServiceContainer): ContextService {
  return createContextService({
    fitnessPlanService: services.fitnessPlan,
    workoutInstanceService: services.workoutInstance,
    microcycleService: services.microcycle,
    fitnessProfileService: services.fitnessProfile,
  });
}

// Re-export types for convenience
export type {
  UserServiceInstance,
  FitnessProfileServiceInstance,
  OnboardingDataServiceInstance,
  MessageServiceInstance,
  FitnessPlanServiceInstance,
  WorkoutInstanceServiceInstance,
  MicrocycleServiceInstance,
  ProgressServiceInstance,
  SubscriptionServiceInstance,
  DayConfigServiceInstance,
  ContextService,
};
