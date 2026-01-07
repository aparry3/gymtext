/**
 * Services Index
 *
 * This file exports all services and the service factory infrastructure.
 *
 * Usage:
 * - Factory pattern (RECOMMENDED): Use createServices(repos) or createServicesFromDb(db)
 */

// =============================================================================
// Service Factory (Primary Export)
// =============================================================================

export {
  createServices,
  createServicesFromDb,
  createContextServiceFromContainer,
} from './factory';
export type { ServiceContainer, ExternalClients } from './factory';

// Context service
export { createContextService } from './context/contextService';
export type { ContextService } from './context/contextService';

// =============================================================================
// Service Factory Functions
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
export { createShortLinkService } from './links/shortLinkService';
export { createPromptService } from './prompts/promptService';
export { createReferralService } from './referral/referralService';
export { createAdminAuthService } from './auth/adminAuthService';
export { createUserAuthService } from './auth/userAuthService';
export { createMessageQueueService } from './messaging/messageQueueService';
export { createDailyMessageService } from './orchestration/dailyMessageService';
export { createWeeklyMessageService } from './orchestration/weeklyMessageService';
export { createOnboardingService } from './orchestration/onboardingService';
export { createOnboardingCoordinator } from './orchestration/onboardingCoordinator';
export { createChainRunnerService } from './training/chainRunnerService';
export { createMessagingAgentService } from './agents/messaging/messagingAgentService';
export { createOnboardingSteps } from './orchestration/onboardingSteps';

// =============================================================================
// Service Instance Types
// =============================================================================

export type { UserServiceInstance, CreateUserRequest } from './user/userService';
export type { FitnessProfileServiceInstance, ProfileUpdateResult } from './user/fitnessProfileService';
export type { OnboardingDataServiceInstance } from './user/onboardingDataService';
export type { MessageServiceInstance, IngestMessageParams, IngestMessageResult, StoreInboundMessageParams } from './messaging/messageService';
export type { FitnessPlanServiceInstance } from './training/fitnessPlanService';
export type { WorkoutInstanceServiceInstance } from './training/workoutInstanceService';
export type { MicrocycleServiceInstance } from './training/microcycleService';
export type { ProgressServiceInstance, ProgressInfo } from './training/progressService';
export type { SubscriptionServiceInstance, CancelResult, ReactivateResult } from './subscription/subscriptionService';
export type { DayConfigServiceInstance } from './calendar/dayConfigService';
export type { ShortLinkServiceInstance } from './links/shortLinkService';
export type { PromptServiceInstance } from './prompts/promptService';
export type { ReferralServiceInstance } from './referral/referralService';
export type { AdminAuthServiceInstance } from './auth/adminAuthService';
export type { UserAuthServiceInstance } from './auth/userAuthService';
export type { MessageQueueServiceInstance, QueuedMessage } from './messaging/messageQueueService';
export type { DailyMessageServiceInstance } from './orchestration/dailyMessageService';
export type { WeeklyMessageServiceInstance } from './orchestration/weeklyMessageService';
export type { OnboardingServiceInstance } from './orchestration/onboardingService';
export type { OnboardingCoordinatorInstance } from './orchestration/onboardingCoordinator';
export type { ChainRunnerServiceInstance, ChainOperation, ChainRunResult, ProfileRegenerationResult } from './training/chainRunnerService';
export type { MessagingAgentServiceInstance } from './agents/messaging/messagingAgentService';
export type { OnboardingSteps } from './orchestration/onboardingSteps';

// =============================================================================
// Agent Services
// =============================================================================

// Chat service
export { createChatService, ChatService } from './agents/chat';
export type { ChatServiceInstance, ChatServiceDeps } from './agents/chat';

// Modification services
export {
  createModificationService,
  createWorkoutModificationService,
  createPlanModificationService,
  createModificationTools,
} from './agents/modifications';
export type {
  ModificationServiceInstance,
  ModificationServiceDeps,
  WorkoutModificationServiceInstance,
  WorkoutModificationServiceDeps,
  ModifyWorkoutResult,
  ModifyWeekResult,
  ModifyWorkoutParams,
  ModifyWeekParams,
  PlanModificationServiceInstance,
  PlanModificationServiceDeps,
  ModifyPlanResult,
  ModifyPlanParams,
  ModificationToolContext,
  ModificationToolDeps,
} from './agents/modifications';

// Profile service
export { ProfileService } from './agents/profile';
