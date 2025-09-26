// Export singleton instances directly
export { chatService } from '@/server/services/chatService';
export { conversationService } from '@/server/services/conversationService';
export { fitnessPlanService } from '@/server/services/fitnessPlanService';
export { progressService } from '@/server/services/progressService';
export { dailyMessageService } from '@/server/services/dailyMessageService';
export { userService } from '@/server/services/userService';
export { messageService } from '@/server/services/messageService';
export { fitnessProfileService } from '@/server/services/fitnessProfileService';
export { conversationContextService } from '@/server/services/context/conversationContext';
export { workoutInstanceService } from '@/server/services/workoutInstanceService';
export { microcycleService } from '@/server/services/microcycleService';

// Also export classes for type definitions when needed
export type { ChatService } from '@/server/services/chatService';
export type { ConversationService } from '@/server/services/conversationService';
export type { FitnessPlanService } from '@/server/services/fitnessPlanService';
export type { ProgressService } from '@/server/services/progressService';
export type { DailyMessageService } from '@/server/services/dailyMessageService';
export type { UserService } from '@/server/services/userService';
export type { MessageService } from '@/server/services/messageService';
export type { FitnessProfileService } from '@/server/services/fitnessProfileService';
export type { ConversationContextService } from '@/server/services/context/conversationContext';
export type { WorkoutInstanceService } from '@/server/services/workoutInstanceService';
export type { MicrocycleService } from '@/server/services/microcycleService';
