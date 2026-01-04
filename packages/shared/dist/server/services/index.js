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
export { workoutModificationService, planModificationService, } from './agents/modifications';
// Non-agent orchestration services (from /services/orchestration/)
export { dailyMessageService } from './orchestration/dailyMessageService';
export { weeklyMessageService } from './orchestration/weeklyMessageService';
export { onboardingService } from './orchestration/onboardingService';
export { userService } from './user/userService';
export { fitnessProfileService } from './user/fitnessProfileService';
export { onboardingDataService } from './user/onboardingDataService';
export { messageService } from './messaging/messageService';
export { subscriptionService } from './subscription/subscriptionService';
// Chain runner service for testing/improving AI outputs
export { ChainRunnerService } from './training/chainRunnerService';
// Calendar services
export { dayConfigService } from './calendar/dayConfigService';
// Service factory (for environment context switching)
export { getServices, clearServiceCache } from './factory';
