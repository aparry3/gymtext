// Export singleton instances directly
export { chatService } from '@/server/services/messaging/chatService';
export { fitnessPlanService } from '@/server/services/training/fitnessPlanService';
export { progressService } from '@/server/services/training/progressService';
export { dailyMessageService } from '@/server/services/orchestration/dailyMessageService';
export { weeklyMessageService } from '@/server/services/orchestration/weeklyMessageService';
export { userService } from '@/server/services/user/userService';
export { messageService } from '@/server/services/messaging/messageService';
export { fitnessProfileService } from '@/server/services/user/fitnessProfileService';
export { onboardingDataService } from '@/server/services/user/onboardingDataService';
export { workoutInstanceService } from '@/server/services/training/workoutInstanceService';
export { microcycleService } from '@/server/services/training/microcycleService';
export { onboardingService } from '@/server/services/orchestration/onboardingService';
export { workoutModificationService } from '@/server/services/orchestration/workoutModificationService';

// Also export classes for type definitions when needed
export type { ChatService } from '@/server/services/messaging/chatService';
export type { FitnessPlanService } from '@/server/services/training/fitnessPlanService';
export type { ProgressService } from '@/server/services/training/progressService';
export type { DailyMessageService } from '@/server/services/orchestration/dailyMessageService';
export type { WeeklyMessageService } from '@/server/services/orchestration/weeklyMessageService';
export type { UserService, CreateUserRequest } from '@/server/services/user/userService';
export type { MessageService } from '@/server/services/messaging/messageService';
export type { FitnessProfileService, ProfileUpdateResult } from '@/server/services/user/fitnessProfileService';
export type { OnboardingDataService } from '@/server/services/user/onboardingDataService';
export type { WorkoutInstanceService } from '@/server/services/training/workoutInstanceService';
export type { MicrocycleService } from '@/server/services/training/microcycleService';
export type { OnboardingService } from '@/server/services/orchestration/onboardingService';
export type { WorkoutModificationService, ModifyWorkoutResult, ModifyWeekResult } from '@/server/services/orchestration/workoutModificationService';
