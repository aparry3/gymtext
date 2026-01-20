/**
 * Service Factory
 *
 * Creates service instances with injected repositories.
 * Services are stateless - repos are passed to each factory function.
 *
 * @example
 * const repos = createRepositories(db);
 * const services = createServices(repos);
 * await services.user.getUserById(userId);
 */
import type { Kysely } from 'kysely';
import type { DB } from '../models/_types';
import type Stripe from 'stripe';
import { createRepositories, type RepositoryContainer } from '../repositories/factory';
import type { ITwilioClient } from '../connections/twilio/factory';

// Domain service factory functions
import { createUserService, type UserServiceInstance } from './domain/user/userService';
import { createFitnessProfileService, type FitnessProfileServiceInstance } from './domain/user/fitnessProfileService';
import { createOnboardingDataService, type OnboardingDataServiceInstance } from './domain/user/onboardingDataService';
import { createMessageService, type MessageServiceInstance } from './domain/messaging/messageService';
import { createFitnessPlanService, type FitnessPlanServiceInstance } from './domain/training/fitnessPlanService';
import { createWorkoutInstanceService, type WorkoutInstanceServiceInstance } from './domain/training/workoutInstanceService';
import { createMicrocycleService, type MicrocycleServiceInstance } from './domain/training/microcycleService';
import { createProgressService, type ProgressServiceInstance } from './domain/training/progressService';
import { createSubscriptionService, type SubscriptionServiceInstance } from './domain/subscription/subscriptionService';
import { createDayConfigService, type DayConfigServiceInstance } from './domain/calendar/dayConfigService';
import { createContextService, type ContextService } from './context/contextService';

// More domain service factory functions
import { createShortLinkService, type ShortLinkServiceInstance } from './domain/links/shortLinkService';
import { createPromptService, type PromptServiceInstance } from './domain/prompts/promptService';
import { createReferralService, type ReferralServiceInstance } from './domain/referral/referralService';
import { createAdminAuthService, type AdminAuthServiceInstance } from './domain/auth/adminAuthService';
import { createUserAuthService, type UserAuthServiceInstance } from './domain/auth/userAuthService';
import { createMessageQueueService, type MessageQueueServiceInstance } from './domain/messaging/messageQueueService';
import { createDailyMessageService, type DailyMessageServiceInstance } from './orchestration/dailyMessageService';
import { createWeeklyMessageService, type WeeklyMessageServiceInstance } from './orchestration/weeklyMessageService';
import { createOnboardingService, type OnboardingServiceInstance } from './orchestration/onboardingService';
import { createOnboardingCoordinator, type OnboardingCoordinatorInstance } from './orchestration/onboardingCoordinator';
import { createChainRunnerService, type ChainRunnerServiceInstance } from './domain/training/chainRunnerService';
import { createMessagingAgentService, type MessagingAgentServiceInstance } from './agents/messaging/messagingAgentService';
import { createWorkoutModificationService, type WorkoutModificationServiceInstance } from './agents/modifications/workoutModificationService';
import { createPlanModificationService, type PlanModificationServiceInstance } from './agents/modifications/planModificationService';
import { createTrainingService, type TrainingServiceInstance } from './orchestration/trainingService';
import { createModificationService, type ModificationServiceInstance } from './orchestration/modificationService';
import { createChatService, type ChatServiceInstance } from './orchestration/chatService';

// Agent services
import {
  createWorkoutAgentService,
  createMicrocycleAgentService,
  createFitnessPlanAgentService,
  type WorkoutAgentService,
  type MicrocycleAgentService,
  type FitnessPlanAgentService,
} from './agents/training';
import { createChatAgentService, type ChatAgentServiceInstance } from './agents/chat';
import { createProgramAgentService, type ProgramAgentServiceInstance } from './agents/programs';

// Program domain services
import { createProgramOwnerService, type ProgramOwnerServiceInstance } from './domain/program/programOwnerService';
import { createProgramService, type ProgramServiceInstance } from './domain/program/programService';
import { createEnrollmentService, type EnrollmentServiceInstance } from './domain/program/enrollmentService';
import { createProgramVersionService, type ProgramVersionServiceInstance } from './domain/program/programVersionService';
import { createPlanInstanceService, type PlanInstanceServiceInstance } from './domain/training/planInstanceService';

/**
 * External clients that can be injected for environment switching
 */
export interface ExternalClients {
  stripeClient?: Stripe;
  twilioClient?: ITwilioClient;
}

/**
 * Container for all service instances
 */
export interface ServiceContainer {
  // Core services
  user: UserServiceInstance;
  fitnessProfile: FitnessProfileServiceInstance;
  onboardingData: OnboardingDataServiceInstance;
  message: MessageServiceInstance;
  fitnessPlan: FitnessPlanServiceInstance;
  workoutInstance: WorkoutInstanceServiceInstance;
  microcycle: MicrocycleServiceInstance;
  progress: ProgressServiceInstance;
  subscription: SubscriptionServiceInstance;
  dayConfig: DayConfigServiceInstance;

  // Additional services
  shortLink: ShortLinkServiceInstance;
  prompt: PromptServiceInstance;
  referral: ReferralServiceInstance;
  adminAuth: AdminAuthServiceInstance;
  userAuth: UserAuthServiceInstance;
  messageQueue: MessageQueueServiceInstance;
  dailyMessage: DailyMessageServiceInstance;
  weeklyMessage: WeeklyMessageServiceInstance;
  onboarding: OnboardingServiceInstance;
  onboardingCoordinator: OnboardingCoordinatorInstance;
  chainRunner: ChainRunnerServiceInstance;
  messagingAgent: MessagingAgentServiceInstance;
  workoutModification: WorkoutModificationServiceInstance;
  planModification: PlanModificationServiceInstance;
  modification: ModificationServiceInstance;

  // Training orchestration
  training: TrainingServiceInstance;

  // Agent services
  workoutAgent: WorkoutAgentService;
  microcycleAgent: MicrocycleAgentService;
  fitnessPlanAgent: FitnessPlanAgentService;
  chatAgent: ChatAgentServiceInstance;
  programAgent: ProgramAgentServiceInstance;

  // Orchestration services
  chat: ChatServiceInstance;

  // Shared context service for agents
  contextService: ContextService;

  // Program domain services
  programOwner: ProgramOwnerServiceInstance;
  program: ProgramServiceInstance;
  enrollment: EnrollmentServiceInstance;
  programVersion: ProgramVersionServiceInstance;
  planInstance: PlanInstanceServiceInstance;
}

/**
 * Create all service instances with the given repositories
 *
 * Services are created in dependency order:
 * 1. Services with no service dependencies (only repos)
 * 2. ContextService (needed by agents)
 * 3. Services that depend on other services
 * 4. Orchestration services
 * 5. Modification services
 *
 * @param repos - Repository container
 * @param clients - Optional external clients for environment switching
 * @returns Service container with all service instances
 */
export function createServices(
  repos: RepositoryContainer,
  clients?: ExternalClients
): ServiceContainer {
  // =========================================================================
  // Phase 1: Create services with no service dependencies (repos only)
  // =========================================================================
  const user = createUserService(repos);
  const fitnessProfile = createFitnessProfileService(repos);
  const onboardingData = createOnboardingDataService(repos);
  const fitnessPlan = createFitnessPlanService(repos);
  const workoutInstance = createWorkoutInstanceService(repos);
  const microcycle = createMicrocycleService(repos);
  const progress = createProgressService(repos);
  const subscription = createSubscriptionService(repos);
  const dayConfig = createDayConfigService(repos);
  const shortLink = createShortLinkService(repos);
  const prompt = createPromptService(repos);

  // Program domain services (repos-only)
  const programOwner = createProgramOwnerService(repos);
  const program = createProgramService(repos);
  const enrollment = createEnrollmentService(repos);
  const programVersion = createProgramVersionService(repos);
  const planInstance = createPlanInstanceService(repos);

  // =========================================================================
  // Phase 2: Create ContextService (needed by agents)
  // =========================================================================
  const contextService = createContextService({
    fitnessPlanService: fitnessPlan,
    workoutInstanceService: workoutInstance,
    microcycleService: microcycle,
    fitnessProfileService: fitnessProfile,
    enrollmentService: enrollment,
  });

  // =========================================================================
  // Phase 2.5: Create agent services (need contextService)
  // =========================================================================
  const workoutAgent = createWorkoutAgentService(contextService);
  const microcycleAgent = createMicrocycleAgentService(contextService);
  const fitnessPlanAgent = createFitnessPlanAgentService(contextService);
  const chatAgent = createChatAgentService(contextService);
  const programAgent = createProgramAgentService();

  // =========================================================================
  // Phase 2.6: Create training orchestration service
  // =========================================================================
  const training = createTrainingService({
    user,
    fitnessPlan,
    progress,
    microcycle,
    workoutInstance,
    shortLink,
    enrollment,
    program,
    programOwner,
    workoutAgent,
    microcycleAgent,
    fitnessPlanAgent,
  });

  // =========================================================================
  // Phase 3: Create services that depend on other services
  // =========================================================================
  const message = createMessageService(repos, {
    user,
    workoutInstance,
    contextService,
  });

  // Services needing external clients - use lazy initialization
  // These will be initialized when first accessed if clients not provided
  let _referral: ReferralServiceInstance | null = null;
  let _adminAuth: AdminAuthServiceInstance | null = null;
  let _userAuth: UserAuthServiceInstance | null = null;
  let _messageQueue: MessageQueueServiceInstance | null = null;

  const getReferral = (): ReferralServiceInstance => {
    if (!_referral) {
      if (clients?.stripeClient) {
        _referral = createReferralService(repos, { stripeClient: clients.stripeClient });
      } else {
        // Synchronous fallback - create with promise that resolves immediately for prod
        const { getStripeSecrets } = require('../config');
        const Stripe = require('stripe').default;
        const { secretKey } = getStripeSecrets();
        const stripeClient = new Stripe(secretKey, { apiVersion: '2023-10-16' });
        _referral = createReferralService(repos, { stripeClient });
      }
    }
    return _referral;
  };

  const getAdminAuth = (): AdminAuthServiceInstance => {
    if (!_adminAuth) {
      if (clients?.twilioClient) {
        _adminAuth = createAdminAuthService(repos, { twilioClient: clients.twilioClient });
      } else {
        const { twilioClient } = require('../connections/twilio/twilio');
        _adminAuth = createAdminAuthService(repos, { twilioClient });
      }
    }
    return _adminAuth;
  };

  const getUserAuth = (): UserAuthServiceInstance => {
    if (!_userAuth) {
      if (clients?.twilioClient) {
        _userAuth = createUserAuthService(repos, {
          twilioClient: clients.twilioClient,
          adminAuth: getAdminAuth()
        });
      } else {
        const { twilioClient } = require('../connections/twilio/twilio');
        _userAuth = createUserAuthService(repos, {
          twilioClient,
          adminAuth: getAdminAuth()
        });
      }
    }
    return _userAuth;
  };

  const getMessageQueue = (): MessageQueueServiceInstance => {
    if (!_messageQueue) {
      if (clients?.twilioClient) {
        _messageQueue = createMessageQueueService(repos, {
          message,
          user,
          twilioClient: clients.twilioClient
        });
      } else {
        const { twilioClient } = require('../connections/twilio/twilio');
        _messageQueue = createMessageQueueService(repos, { message, user, twilioClient });
      }
    }
    return _messageQueue;
  };

  // =========================================================================
  // Phase 4: Create agent and orchestration services
  // =========================================================================
  const messagingAgent = createMessagingAgentService();

  const dailyMessage = createDailyMessageService(repos, {
    user,
    workoutInstance,
    messageQueue: getMessageQueue(),
    dayConfig,
    training,
  });

  const weeklyMessage = createWeeklyMessageService({
    user,
    message,
    training,
    fitnessPlan,
    messagingAgent,
    enrollment,
  });

  const onboarding = createOnboardingService({
    fitnessPlan,
    training,
    dailyMessage,
    messageQueue: getMessageQueue(),
    messagingAgent,
  });

  const onboardingCoordinator = createOnboardingCoordinator(repos, {
    onboardingData,
    user,
    onboarding,
  });

  // =========================================================================
  // Phase 5: Create modification and chain runner services
  // =========================================================================
  const workoutModification = createWorkoutModificationService({
    user,
    microcycle,
    workoutInstance,
    training,
    fitnessPlan,
    contextService,
  });

  const planModification = createPlanModificationService(repos, {
    user,
    fitnessPlan,
    workoutModification,
    contextService,
  });

  const modification = createModificationService({
    user,
    workoutInstance,
    workoutModification,
    planModification,
  });

  // =========================================================================
  // Phase 5.5: Create chat orchestration service
  // =========================================================================
  const chat = createChatService({
    message,
    user,
    workoutInstance,
    training,
    modification,
    chatAgent,
  });

  const chainRunner = createChainRunnerService(repos, {
    fitnessPlan,
    microcycle,
    workoutInstance,
    user,
    fitnessProfile,
    contextService,
  });

  // =========================================================================
  // Return complete service container
  // =========================================================================
  return {
    // Core services
    user,
    fitnessProfile,
    onboardingData,
    message,
    fitnessPlan,
    workoutInstance,
    microcycle,
    progress,
    subscription,
    dayConfig,

    // Additional services (use getters for lazy-loaded ones)
    shortLink,
    prompt,
    get referral() { return getReferral(); },
    get adminAuth() { return getAdminAuth(); },
    get userAuth() { return getUserAuth(); },
    get messageQueue() { return getMessageQueue(); },
    dailyMessage,
    weeklyMessage,
    onboarding,
    onboardingCoordinator,
    chainRunner,
    messagingAgent,
    workoutModification,
    planModification,
    modification,

    // Training orchestration
    training,

    // Agent services
    workoutAgent,
    microcycleAgent,
    fitnessPlanAgent,
    chatAgent,
    programAgent,

    // Chat orchestration
    chat,

    // Shared context
    contextService,

    // Program domain services
    programOwner,
    program,
    enrollment,
    programVersion,
    planInstance,
  };
}

/**
 * Create services directly from a database instance
 *
 * Convenience function that creates repositories and services in one call.
 *
 * @param db - Kysely database instance
 * @param clients - Optional external clients for environment switching
 * @returns Service container
 */
export function createServicesFromDb(
  db: Kysely<DB>,
  clients?: ExternalClients
): ServiceContainer {
  return createServices(createRepositories(db), clients);
}

/**
 * Create a ContextService from a ServiceContainer
 *
 * Convenience function for creating a ContextService with services from the container.
 *
 * @param services - Service container
 * @returns ContextService instance
 */
export function createContextServiceFromContainer(services: ServiceContainer): ContextService {
  return services.contextService;
}

// Re-export types for convenience
export type {
  // Core service types
  UserServiceInstance,
  FitnessProfileServiceInstance,
  OnboardingDataServiceInstance,
  MessageServiceInstance,
  FitnessPlanServiceInstance,
  WorkoutInstanceServiceInstance,
  MicrocycleServiceInstance,
  ProgressServiceInstance,
  SubscriptionServiceInstance,
  DayConfigServiceInstance,
  ContextService,

  // Additional service types
  ShortLinkServiceInstance,
  PromptServiceInstance,
  ReferralServiceInstance,
  AdminAuthServiceInstance,
  UserAuthServiceInstance,
  MessageQueueServiceInstance,
  DailyMessageServiceInstance,
  WeeklyMessageServiceInstance,
  OnboardingServiceInstance,
  OnboardingCoordinatorInstance,
  ChainRunnerServiceInstance,
  MessagingAgentServiceInstance,
  WorkoutModificationServiceInstance,
  PlanModificationServiceInstance,
  ModificationServiceInstance,

  // Training orchestration
  TrainingServiceInstance,

  // Agent services
  WorkoutAgentService,
  MicrocycleAgentService,
  ProgramAgentServiceInstance,

  // Program domain services
  ProgramOwnerServiceInstance,
  ProgramServiceInstance,
  EnrollmentServiceInstance,
  ProgramVersionServiceInstance,
  PlanInstanceServiceInstance,
};
