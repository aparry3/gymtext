// Import all repository classes
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
// Cache repositories by database connection string (approximated by object identity)
const repoCache = new WeakMap();
/**
 * Create all repository instances with a specific database connection
 *
 * @param db - Kysely database instance
 * @returns Container with all repository instances
 */
export function createRepositories(db) {
    // Return cached instance if available
    const cached = repoCache.get(db);
    if (cached) {
        return cached;
    }
    // Create new repository instances
    const repos = {
        user: new UserRepository(db),
        message: new MessageRepository(db),
        profile: new ProfileRepository(db),
        fitnessPlan: new FitnessPlanRepository(db),
        workoutInstance: new WorkoutInstanceRepository(db),
        microcycle: new MicrocycleRepository(db),
        subscription: new SubscriptionRepository(db),
        onboarding: new OnboardingRepository(db),
        prompt: new PromptRepository(db),
        dayConfig: new DayConfigRepository(db),
        messageQueue: new MessageQueueRepository(db),
        shortLink: new ShortLinkRepository(db),
        referral: new ReferralRepository(db),
        pageVisit: new PageVisitRepository(db),
        adminActivityLog: new AdminActivityLogRepository(db),
        uploadedImage: new UploadedImageRepository(db),
        profileUpdate: new ProfileUpdateRepository(db),
        userAuth: new UserAuthRepository(db),
    };
    // Cache for reuse
    repoCache.set(db, repos);
    return repos;
}
/**
 * Get repositories for a specific environment context
 * Convenience function that extracts db from context
 */
export function getRepositories(ctx) {
    return createRepositories(ctx.db);
}
