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

// Entity services (from /services/training/, /services/user/, /services/messaging/)
export { fitnessPlanService } from './training/fitnessPlanService';
export { progressService } from './training/progressService';
export { workoutInstanceService } from './training/workoutInstanceService';
export { microcycleService } from './training/microcycleService';

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
