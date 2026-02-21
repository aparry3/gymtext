/**
 * Domain Services Index
 *
 * Barrel export for all domain services (business logic & CRUD operations).
 * Domain services call repositories and are called by orchestration/agent services.
 */

// Training services
export { createFitnessPlanService } from './training/fitnessPlanService';

export { createMicrocycleService } from './training/microcycleService';
export { createProgressService } from './training/progressService';
export type { FitnessPlanServiceInstance } from './training/fitnessPlanService';

export type { MicrocycleServiceInstance } from './training/microcycleService';
export type { ProgressServiceInstance, ProgressInfo } from './training/progressService';

// User services
export { createUserService } from './user/userService';
export { createFitnessProfileService } from './user/fitnessProfileService';
export { createOnboardingDataService } from './user/onboardingDataService';
export type { UserServiceInstance, CreateUserRequest } from './user/userService';
export type { FitnessProfileServiceInstance, ProfileUpdateResult } from './user/fitnessProfileService';
export type { OnboardingDataServiceInstance } from './user/onboardingDataService';

// Messaging services
export { createMessageService } from './messaging/messageService';
export { createQueueService } from './messaging/queueService';
export type { MessageServiceInstance, IngestMessageParams, IngestMessageResult, StoreInboundMessageParams } from './messaging/messageService';
export type { QueueServiceInstance } from './messaging/queueService';

// Auth services
export { createAdminAuthService } from './auth/adminAuthService';
export { createUserAuthService } from './auth/userAuthService';
export type { AdminAuthServiceInstance } from './auth/adminAuthService';
export type { UserAuthServiceInstance } from './auth/userAuthService';

// Other domain services
export { createSubscriptionService } from './subscription/subscriptionService';
export { createShortLinkService } from './links/shortLinkService';
export { createReferralService } from './referral/referralService';
export { createDayConfigService } from './calendar/dayConfigService';
export type { SubscriptionServiceInstance, CancelResult, ReactivateResult } from './subscription/subscriptionService';
export type { ShortLinkServiceInstance } from './links/shortLinkService';
export type { ReferralServiceInstance } from './referral/referralService';
export type { DayConfigServiceInstance } from './calendar/dayConfigService';
