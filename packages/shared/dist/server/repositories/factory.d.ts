/**
 * Repository Factory
 *
 * Creates repository instances with a specific database connection.
 * Used for environment switching in the admin app.
 *
 * @example
 * const ctx = await createEnvContext();
 * const repos = createRepositories(ctx.db);
 * const users = await repos.user.findAll();
 */
import type { Kysely } from 'kysely';
import type { DB } from '../models/_types';
import { UserRepository } from './userRepository';
import { MessageRepository } from './messageRepository';
import { ProfileRepository } from './profileRepository';
import { FitnessPlanRepository } from './fitnessPlanRepository';
import { WorkoutInstanceRepository } from './workoutInstanceRepository';
import { MicrocycleRepository } from './microcycleRepository';
import { SubscriptionRepository } from './subscriptionRepository';
import { OnboardingRepository } from './onboardingRepository';
import { PromptRepository } from './promptRepository';
import { DayConfigRepository } from './dayConfigRepository';
import { MessageQueueRepository } from './messageQueueRepository';
import { ShortLinkRepository } from './shortLinkRepository';
import { ReferralRepository } from './referralRepository';
import { PageVisitRepository } from './pageVisitRepository';
import { AdminActivityLogRepository } from './adminActivityLogRepository';
import { UploadedImageRepository } from './uploadedImageRepository';
import { ProfileUpdateRepository } from './profileUpdateRepository';
import { UserAuthRepository } from './userAuthRepository';
/**
 * Container for all repository instances
 */
export interface RepositoryContainer {
    user: UserRepository;
    message: MessageRepository;
    profile: ProfileRepository;
    fitnessPlan: FitnessPlanRepository;
    workoutInstance: WorkoutInstanceRepository;
    microcycle: MicrocycleRepository;
    subscription: SubscriptionRepository;
    onboarding: OnboardingRepository;
    prompt: PromptRepository;
    dayConfig: DayConfigRepository;
    messageQueue: MessageQueueRepository;
    shortLink: ShortLinkRepository;
    referral: ReferralRepository;
    pageVisit: PageVisitRepository;
    adminActivityLog: AdminActivityLogRepository;
    uploadedImage: UploadedImageRepository;
    profileUpdate: ProfileUpdateRepository;
    userAuth: UserAuthRepository;
}
/**
 * Create all repository instances with a specific database connection
 *
 * @param db - Kysely database instance
 * @returns Container with all repository instances
 */
export declare function createRepositories(db: Kysely<DB>): RepositoryContainer;
/**
 * Get repositories for a specific environment context
 * Convenience function that extracts db from context
 */
export declare function getRepositories(ctx: {
    db: Kysely<DB>;
}): RepositoryContainer;
//# sourceMappingURL=factory.d.ts.map