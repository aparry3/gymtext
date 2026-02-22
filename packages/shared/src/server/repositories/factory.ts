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

// Import all repository classes
import { UserRepository } from './userRepository';
import { MessageRepository } from './messageRepository';
import { ProfileRepository } from './profileRepository';
import { FitnessPlanRepository } from './fitnessPlanRepository';

import { MicrocycleRepository } from './microcycleRepository';
import { SubscriptionRepository } from './subscriptionRepository';
import { OnboardingRepository } from './onboardingRepository';
import { DayConfigRepository } from './dayConfigRepository';
import { MessageQueueRepository } from './messageQueueRepository';
import { ShortLinkRepository } from './shortLinkRepository';
import { ReferralRepository } from './referralRepository';
import { PageVisitRepository } from './pageVisitRepository';
import { AdminActivityLogRepository } from './adminActivityLogRepository';
import { UploadedImageRepository } from './uploadedImageRepository';
import { ProfileUpdateRepository } from './profileUpdateRepository';
import { UserAuthRepository } from './userAuthRepository';
import { ProgramOwnerRepository } from './programOwnerRepository';
import { ProgramRepository } from './programRepository';
import { ProgramEnrollmentRepository } from './programEnrollmentRepository';
import { ProgramVersionRepository } from './programVersionRepository';
import { ProgramFamilyRepository } from './programFamilyRepository';
import { ExerciseRepository } from './exerciseRepository';
import { ExerciseAliasRepository } from './exerciseAliasRepository';
import { ExerciseUseRepository } from './exerciseUseRepository';
import { MovementRepository } from './movementRepository';
import { ExerciseMetricsRepository } from './exerciseMetricsRepository';
import { EventLogRepository } from './eventLogRepository';
import { BlogPostRepository } from './blogPostRepository';
import { OrganizationRepository } from './organizationRepository';
import { AgentDefinitionRepository } from './agentDefinitionRepository';
import { AgentLogRepository } from './agentLogRepository';
import { WorkoutInstanceRepository } from './workoutInstanceRepository';

/**
 * Container for all repository instances
 */
export interface RepositoryContainer {
  user: UserRepository;
  message: MessageRepository;
  profile: ProfileRepository;
  fitnessPlan: FitnessPlanRepository;

  microcycle: MicrocycleRepository;
  subscription: SubscriptionRepository;
  onboarding: OnboardingRepository;
  dayConfig: DayConfigRepository;
  messageQueue: MessageQueueRepository;
  shortLink: ShortLinkRepository;
  referral: ReferralRepository;
  pageVisit: PageVisitRepository;
  adminActivityLog: AdminActivityLogRepository;
  uploadedImage: UploadedImageRepository;
  profileUpdate: ProfileUpdateRepository;
  userAuth: UserAuthRepository;
  programOwner: ProgramOwnerRepository;
  program: ProgramRepository;
  programEnrollment: ProgramEnrollmentRepository;
  programVersion: ProgramVersionRepository;
  programFamily: ProgramFamilyRepository;
  exercise: ExerciseRepository;
  exerciseAlias: ExerciseAliasRepository;
  exerciseUse: ExerciseUseRepository;
  movement: MovementRepository;
  exerciseMetrics: ExerciseMetricsRepository;
  eventLog: EventLogRepository;
  blogPost: BlogPostRepository;
  organization: OrganizationRepository;
  agentDefinition: AgentDefinitionRepository;
  agentLog: AgentLogRepository;
  workoutInstance: WorkoutInstanceRepository;
  // Direct db access for complex queries
  db: Kysely<DB>;
}

// Cache repositories by database connection string (approximated by object identity)
const repoCache = new WeakMap<Kysely<DB>, RepositoryContainer>();

/**
 * Create all repository instances with a specific database connection
 *
 * @param db - Kysely database instance
 * @returns Container with all repository instances
 */
export function createRepositories(db: Kysely<DB>): RepositoryContainer {
  // Return cached instance if available
  const cached = repoCache.get(db);
  if (cached) {
    return cached;
  }

  // Create new repository instances
  const repos: RepositoryContainer = {
    user: new UserRepository(db),
    message: new MessageRepository(db),
    profile: new ProfileRepository(db),
    fitnessPlan: new FitnessPlanRepository(db),

    microcycle: new MicrocycleRepository(db),
    subscription: new SubscriptionRepository(db),
    onboarding: new OnboardingRepository(db),
    dayConfig: new DayConfigRepository(db),
    messageQueue: new MessageQueueRepository(db),
    shortLink: new ShortLinkRepository(db),
    referral: new ReferralRepository(db),
    pageVisit: new PageVisitRepository(db),
    adminActivityLog: new AdminActivityLogRepository(db),
    uploadedImage: new UploadedImageRepository(db),
    profileUpdate: new ProfileUpdateRepository(db),
    userAuth: new UserAuthRepository(db),
    programOwner: new ProgramOwnerRepository(db),
    program: new ProgramRepository(db),
    programEnrollment: new ProgramEnrollmentRepository(db),
    programVersion: new ProgramVersionRepository(db),
    programFamily: new ProgramFamilyRepository(db),
    exercise: new ExerciseRepository(db),
    exerciseAlias: new ExerciseAliasRepository(db),
    exerciseUse: new ExerciseUseRepository(db),
    movement: new MovementRepository(db),
    exerciseMetrics: new ExerciseMetricsRepository(db),
    eventLog: new EventLogRepository(db),
    blogPost: new BlogPostRepository(db),
    organization: new OrganizationRepository(db),
    agentDefinition: new AgentDefinitionRepository(db),
    agentLog: new AgentLogRepository(db),
    workoutInstance: new WorkoutInstanceRepository(db),
    db,
  };

  // Cache for reuse
  repoCache.set(db, repos);
  return repos;
}

/**
 * Get repositories for a specific environment context
 * Convenience function that extracts db from context
 */
export function getRepositories(ctx: { db: Kysely<DB> }): RepositoryContainer {
  return createRepositories(ctx.db);
}
