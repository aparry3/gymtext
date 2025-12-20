// Entity services (from /services/training/, /services/user/, /services/messaging/)
// NOTE: These must be imported first as they're used to initialize ContextService
import { fitnessPlanService } from './training/fitnessPlanService';
import { workoutInstanceService } from './training/workoutInstanceService';
import { microcycleService } from './training/microcycleService';
import { progressService } from './training/progressService';
export { fitnessPlanService, workoutInstanceService, microcycleService, progressService };

// Context service initialization (must happen before any agent services are used)
import { ContextService } from './context';
import { ProfileRepository } from '@/server/repositories/profileRepository';

ContextService.initialize({
  fitnessPlanService,
  workoutInstanceService,
  microcycleService,
  profileRepository: new ProfileRepository(),
});

// Agent orchestration services (from /services/agents/)
// These use static methods - call directly e.g. ChatService.handleIncomingMessage()
export { ChatService } from './agents/chat';
export { ModificationService } from './agents/modifications';
export { ProfileService } from './agents/profile';

// Sub-services for modifications (still use singleton pattern)
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

// Non-agent orchestration services (from /services/orchestration/)
export { dailyMessageService } from './orchestration/dailyMessageService';
export { weeklyMessageService } from './orchestration/weeklyMessageService';
export { onboardingService } from './orchestration/onboardingService';

export type { DailyMessageService } from './orchestration/dailyMessageService';
export type { WeeklyMessageService } from './orchestration/weeklyMessageService';
export type { OnboardingService } from './orchestration/onboardingService';

export type { FitnessPlanService } from './training/fitnessPlanService';
export type { ProgressService } from './training/progressService';
export type { WorkoutInstanceService } from './training/workoutInstanceService';
export type { MicrocycleService } from './training/microcycleService';

export { userService } from './user/userService';
export { fitnessProfileService } from './user/fitnessProfileService';
export { onboardingDataService } from './user/onboardingDataService';

export type { UserService, CreateUserRequest } from './user/userService';
export type { FitnessProfileService, ProfileUpdateResult } from './user/fitnessProfileService';
export type { OnboardingDataService } from './user/onboardingDataService';

export { messageService } from './messaging/messageService';

export type { MessageService } from './messaging/messageService';

export { subscriptionService } from './subscription/subscriptionService';

export type {
  SubscriptionService,
  CancelResult,
  ReactivateResult,
} from './subscription/subscriptionService';

// Chain runner service for testing/improving AI outputs
export { ChainRunnerService } from './training/chainRunnerService';
export type { ChainOperation, ChainRunResult, ProfileRegenerationResult } from './training/chainRunnerService';
