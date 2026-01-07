/**
 * Services Index
 *
 * This file exports all services and the service factory infrastructure.
 *
 * Usage patterns:
 * 1. Factory pattern (RECOMMENDED): Use createServices(repos) or createServicesFromDb(db)
 * 2. Singleton pattern (DEPRECATED): Import individual services like userService
 */

// =============================================================================
// Service Factory (Primary Export)
// =============================================================================

export { createServices, createServicesFromDb } from './factory';
export type { ServiceContainer } from './factory';

// =============================================================================
// Service Factory Functions (for custom service creation)
// =============================================================================

export { createUserService } from './user/userService';
export { createFitnessProfileService } from './user/fitnessProfileService';
export { createOnboardingDataService } from './user/onboardingDataService';
export { createMessageService } from './messaging/messageService';
export { createFitnessPlanService } from './training/fitnessPlanService';
export { createWorkoutInstanceService } from './training/workoutInstanceService';
export { createMicrocycleService } from './training/microcycleService';
export { createProgressService } from './training/progressService';
export { createSubscriptionService } from './subscription/subscriptionService';
export { createDayConfigService } from './calendar/dayConfigService';

// =============================================================================
// Service Instance Types
// =============================================================================

export type { UserServiceInstance } from './user/userService';
export type { FitnessProfileServiceInstance, ProfileUpdateResult } from './user/fitnessProfileService';
export type { OnboardingDataServiceInstance } from './user/onboardingDataService';
export type { MessageServiceInstance, IngestMessageParams, IngestMessageResult, StoreInboundMessageParams } from './messaging/messageService';
export type { FitnessPlanServiceInstance } from './training/fitnessPlanService';
export type { WorkoutInstanceServiceInstance } from './training/workoutInstanceService';
export type { MicrocycleServiceInstance } from './training/microcycleService';
export type { ProgressServiceInstance, ProgressInfo } from './training/progressService';
export type { SubscriptionServiceInstance, CancelResult, ReactivateResult } from './subscription/subscriptionService';
export type { DayConfigServiceInstance } from './calendar/dayConfigService';

// =============================================================================
// DEPRECATED: Singleton Exports (for backward compatibility)
// These will be removed after migration to factory pattern is complete
// =============================================================================

// Training services
export { fitnessPlanService } from './training/fitnessPlanService';
export { workoutInstanceService } from './training/workoutInstanceService';
export { microcycleService } from './training/microcycleService';
export { progressService } from './training/progressService';

// User services
export { userService } from './user/userService';
export { fitnessProfileService } from './user/fitnessProfileService';
export { onboardingDataService } from './user/onboardingDataService';

// Messaging services
export { messageService } from './messaging/messageService';

// Subscription services
export { subscriptionService } from './subscription/subscriptionService';

// Calendar services
export { dayConfigService } from './calendar/dayConfigService';

// =============================================================================
// Deprecated Class Types (for backward compatibility)
// =============================================================================

export type { FitnessPlanService } from './training/fitnessPlanService';
export type { ProgressService } from './training/progressService';
export type { WorkoutInstanceService } from './training/workoutInstanceService';
export type { MicrocycleService } from './training/microcycleService';
export type { UserService, CreateUserRequest } from './user/userService';
export type { FitnessProfileService } from './user/fitnessProfileService';
export type { OnboardingDataService } from './user/onboardingDataService';
export type { MessageService } from './messaging/messageService';
export type { SubscriptionService } from './subscription/subscriptionService';
export type { DayConfigService } from './calendar/dayConfigService';

// =============================================================================
// Agent Orchestration Services
// =============================================================================

export { ChatService, createChatService } from './agents/chat';
export { ModificationService } from './agents/modifications';
export { ProfileService } from './agents/profile';

export {
  workoutModificationService,
  planModificationService,
} from './agents/modifications';

export type {
  WorkoutModificationService,
  ModifyWorkoutResult,
  ModifyWeekResult,
  PlanModificationService,
  ModifyPlanParams,
  ModifyPlanResult,
} from './agents/modifications';

// =============================================================================
// Orchestration Services (unchanged)
// =============================================================================

export { dailyMessageService } from './orchestration/dailyMessageService';
export { weeklyMessageService } from './orchestration/weeklyMessageService';
export { onboardingService } from './orchestration/onboardingService';

export type { DailyMessageService } from './orchestration/dailyMessageService';
export type { WeeklyMessageService } from './orchestration/weeklyMessageService';
export type { OnboardingService } from './orchestration/onboardingService';

// =============================================================================
// Chain Runner Service (unchanged)
// =============================================================================

export { ChainRunnerService } from './training/chainRunnerService';
export type { ChainOperation, ChainRunResult, ProfileRegenerationResult } from './training/chainRunnerService';
