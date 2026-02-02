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
// Domain Service Factory Functions
// =============================================================================

export { createUserService } from './domain/user/userService';
export { createFitnessProfileService } from './domain/user/fitnessProfileService';
export { createOnboardingDataService } from './domain/user/onboardingDataService';
export { createMessageService } from './domain/messaging/messageService';
export { createQueueService } from './domain/messaging/queueService';
export { createFitnessPlanService } from './domain/training/fitnessPlanService';
export { createWorkoutInstanceService } from './domain/training/workoutInstanceService';
export { createMicrocycleService } from './domain/training/microcycleService';
export { createProgressService } from './domain/training/progressService';
export { createSubscriptionService } from './domain/subscription/subscriptionService';
export { createDayConfigService } from './domain/calendar/dayConfigService';
export { createShortLinkService } from './domain/links/shortLinkService';
export { createPromptService } from './domain/prompts/promptService';
export { createReferralService } from './domain/referral/referralService';
export { createAdminAuthService } from './domain/auth/adminAuthService';
export { createUserAuthService } from './domain/auth/userAuthService';
export { createChainRunnerService } from './domain/training/chainRunnerService';

// Orchestration service factory functions
export { createDailyMessageService } from './orchestration/dailyMessageService';
export { createWeeklyMessageService } from './orchestration/weeklyMessageService';
export { createOnboardingService } from './orchestration/onboardingService';
export { createOnboardingCoordinator } from './orchestration/onboardingCoordinator';
export { createOnboardingSteps } from './orchestration/onboardingSteps';
export { createMessagingOrchestrator } from './orchestration/messagingOrchestrator';

// Agent service factory functions
export { createMessagingAgentService } from './agents/messaging/messagingAgentService';

// =============================================================================
// Domain Service Instance Types
// =============================================================================

export type { UserServiceInstance, CreateUserRequest } from './domain/user/userService';
export type { FitnessProfileServiceInstance, ProfileUpdateResult } from './domain/user/fitnessProfileService';
export type { OnboardingDataServiceInstance } from './domain/user/onboardingDataService';
export type { MessageServiceInstance, IngestMessageParams, IngestMessageResult, StoreInboundMessageParams } from './domain/messaging/messageService';
export type { QueueServiceInstance } from './domain/messaging/queueService';
export type { FitnessPlanServiceInstance } from './domain/training/fitnessPlanService';
export type { WorkoutInstanceServiceInstance } from './domain/training/workoutInstanceService';
export type { MicrocycleServiceInstance } from './domain/training/microcycleService';
export type { ProgressServiceInstance, ProgressInfo } from './domain/training/progressService';
export type { SubscriptionServiceInstance, CancelResult, ReactivateResult } from './domain/subscription/subscriptionService';
export type { DayConfigServiceInstance } from './domain/calendar/dayConfigService';
export type { ShortLinkServiceInstance } from './domain/links/shortLinkService';
export type { PromptServiceInstance } from './domain/prompts/promptService';
export type { ReferralServiceInstance } from './domain/referral/referralService';
export type { AdminAuthServiceInstance } from './domain/auth/adminAuthService';
export type { UserAuthServiceInstance } from './domain/auth/userAuthService';
export type { ChainRunnerServiceInstance, ChainOperation, ChainRunResult, ProfileRegenerationResult } from './domain/training/chainRunnerService';

// Orchestration service instance types
export type { DailyMessageServiceInstance } from './orchestration/dailyMessageService';
export type { WeeklyMessageServiceInstance } from './orchestration/weeklyMessageService';
export type { OnboardingServiceInstance } from './orchestration/onboardingService';
export type { OnboardingCoordinatorInstance } from './orchestration/onboardingCoordinator';
export type { OnboardingSteps } from './orchestration/onboardingSteps';
export type { MessagingOrchestratorInstance, QueuedMessageContent, SendResult } from './orchestration/messagingOrchestrator';

// Agent service instance types
export type { MessagingAgentServiceInstance } from './agents/messaging/messagingAgentService';

// =============================================================================
// Orchestration Services
// =============================================================================

// Chat orchestration service
export { createChatService } from './orchestration/chatService';
export type { ChatServiceInstance, ChatServiceDeps } from './orchestration/chatService';

// =============================================================================
// Agent Services
// =============================================================================

// Chat agent service
export { createChatAgentService } from './agents/chat';
export type { ChatAgentServiceInstance, ChatAgentResult } from './agents/chat';

// Modification orchestration service
export { createModificationService } from './orchestration/modificationService';
export type { ModificationServiceInstance, ModificationServiceDeps } from './orchestration/modificationService';

// Modification agent services (helpers)
export {
  createWorkoutModificationService,
  createPlanModificationService,
  createModificationTools,
} from './agents/modifications';
export type {
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

// Exercise resolution service
export { createExerciseResolutionService } from './domain/exercise/exerciseResolutionService';
export type { ExerciseResolutionServiceInstance } from './domain/exercise/exerciseResolutionService';

// Exercise metrics service
export { createExerciseMetricsService } from './domain/training/exerciseMetricsService';
export type {
  ExerciseMetricsServiceInstance,
  ExerciseMetricData,
  StrengthMetricData,
  StrengthSetData,
  CardioMetricData,
  MobilityMetricData,
  UserExerciseMetric,
} from './domain/training/exerciseMetricsService';

// Profile service
export { createProfileService } from './agents/profile';
export type { ProfileServiceInstance, ProfileServiceDeps } from './agents/profile';

// Program agent service
export { createProgramAgentService } from './agents/programs';
export type { ProgramAgentServiceInstance, ProgramParseResult } from './agents/programs';
