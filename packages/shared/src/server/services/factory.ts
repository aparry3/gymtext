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
import { createQueueService, type QueueServiceInstance } from './domain/messaging/queueService';
import { createFitnessPlanService, type FitnessPlanServiceInstance } from './domain/training/fitnessPlanService';
import { createWorkoutInstanceService, type WorkoutInstanceServiceInstance } from './domain/training/workoutInstanceService';
import { createMicrocycleService, type MicrocycleServiceInstance } from './domain/training/microcycleService';
import { createProgressService, type ProgressServiceInstance } from './domain/training/progressService';
import { createSubscriptionService, type SubscriptionServiceInstance } from './domain/subscription/subscriptionService';
import { createDayConfigService, type DayConfigServiceInstance } from './domain/calendar/dayConfigService';

// More domain service factory functions
import { createShortLinkService, type ShortLinkServiceInstance } from './domain/links/shortLinkService';
import { createReferralService, type ReferralServiceInstance } from './domain/referral/referralService';
import { createAdminAuthService, type AdminAuthServiceInstance } from './domain/auth/adminAuthService';
import { createUserAuthService, type UserAuthServiceInstance } from './domain/auth/userAuthService';
import { createProgramOwnerAuthService, type ProgramOwnerAuthServiceInstance } from './domain/auth/programOwnerAuthService';
import { createDailyMessageService, type DailyMessageServiceInstance } from './orchestration/dailyMessageService';
import { createWeeklyMessageService, type WeeklyMessageServiceInstance } from './orchestration/weeklyMessageService';
import { createOnboardingService, type OnboardingServiceInstance } from './orchestration/onboardingService';
import { createOnboardingCoordinator, type OnboardingCoordinatorInstance } from './orchestration/onboardingCoordinator';
import { createMessagingOrchestrator, type MessagingOrchestratorInstance } from './orchestration/messagingOrchestrator';
import { createChainRunnerService, type ChainRunnerServiceInstance } from './domain/training/chainRunnerService';
import { createMessagingAgentService, type MessagingAgentServiceInstance } from './agents/messaging/messagingAgentService';
import { createWorkoutModificationService, type WorkoutModificationServiceInstance } from './agents/modifications/workoutModificationService';
import { createPlanModificationService, type PlanModificationServiceInstance } from './agents/modifications/planModificationService';
import { createTrainingService, type TrainingServiceInstance } from './orchestration/trainingService';
import { createModificationService, type ModificationServiceInstance } from './orchestration/modificationService';
import { createChatService, type ChatServiceInstance } from './orchestration/chatService';
import { createExerciseResolutionService, type ExerciseResolutionServiceInstance } from './domain/exercise/exerciseResolutionService';
import { createExerciseMetricsService, type ExerciseMetricsServiceInstance } from './domain/training/exerciseMetricsService';
import { createBlogService, type BlogServiceInstance } from './domain/blog/blogService';
import { createOrganizationService, type OrganizationServiceInstance } from './domain/organization/organizationService';
import { createAgentDefinitionService, type AgentDefinitionServiceInstance } from './domain/agents/agentDefinitionService';
import { createAgentLogService, type AgentLogServiceInstance } from './domain/agents/agentLogService';
import { createAgentExtensionService, type AgentExtensionServiceInstance } from './domain/agents/agentExtensionService';
import { createContextTemplateService, type ContextTemplateServiceInstance } from './domain/context/contextTemplateService';

// Agent services
import { createProgramAgentService, type ProgramAgentServiceInstance } from './agents/programs';
import { createProfileService, type ProfileServiceInstance } from './agents/profile';

// Agent Runner infrastructure
import { ToolRegistry } from '@/server/agents/tools';
import { registerAllTools } from '@/server/agents/tools';
import { createAgentRunner, type AgentRunnerInstance } from '@/server/agents/runner';

// Context Registry
import { ContextRegistry, registerAllContextProviders } from '@/server/agents/context';

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
  queue: QueueServiceInstance;
  fitnessPlan: FitnessPlanServiceInstance;
  workoutInstance: WorkoutInstanceServiceInstance;
  microcycle: MicrocycleServiceInstance;
  progress: ProgressServiceInstance;
  subscription: SubscriptionServiceInstance;
  dayConfig: DayConfigServiceInstance;

  // Additional services
  shortLink: ShortLinkServiceInstance;
  referral: ReferralServiceInstance;
  adminAuth: AdminAuthServiceInstance;
  userAuth: UserAuthServiceInstance;
  programOwnerAuth: ProgramOwnerAuthServiceInstance;
  messagingOrchestrator: MessagingOrchestratorInstance;
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
  programAgent: ProgramAgentServiceInstance;

  // Orchestration services
  chat: ChatServiceInstance;

  // Program domain services
  programOwner: ProgramOwnerServiceInstance;
  program: ProgramServiceInstance;
  enrollment: EnrollmentServiceInstance;
  programVersion: ProgramVersionServiceInstance;
  planInstance: PlanInstanceServiceInstance;

  // Exercise resolution
  exerciseResolution: ExerciseResolutionServiceInstance;

  // Exercise metrics (workout tracking)
  exerciseMetrics: ExerciseMetricsServiceInstance;

  // Blog
  blog: BlogServiceInstance;

  // Organization
  organization: OrganizationServiceInstance;

  // Agent definitions
  agentDefinition: AgentDefinitionServiceInstance;

  // Agent logs
  agentLog: AgentLogServiceInstance;

  // Agent extensions
  agentExtension: AgentExtensionServiceInstance;

  // Context templates
  contextTemplate: ContextTemplateServiceInstance;

  // Agent Runner (new declarative agent system)
  agentRunner: AgentRunnerInstance;

  // Registries (for admin metadata API)
  toolRegistry: ToolRegistry;
  contextRegistry: ContextRegistry;
}

/**
 * Create all service instances with the given repositories
 *
 * Services are created in dependency order:
 * 1. Services with no service dependencies (only repos)
 * 2. ContextRegistry (needed by agents)
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
  // Note: fitnessProfile is created below after agentDefinition is available
  const onboardingData = createOnboardingDataService(repos);
  const fitnessPlan = createFitnessPlanService(repos);
  const workoutInstance = createWorkoutInstanceService(repos);
  const microcycle = createMicrocycleService(repos);
  const progress = createProgressService(repos);
  const subscription = createSubscriptionService(repos);
  const dayConfig = createDayConfigService(repos);
  const shortLink = createShortLinkService(repos);
  const queue = createQueueService(repos);
  const agentDefinition = createAgentDefinitionService(repos);
  const agentLog = createAgentLogService(repos);
  const agentExtension = createAgentExtensionService(repos);
  const contextTemplate = createContextTemplateService(repos);

  // fitnessProfile needs agentDefinitionService for profile agents
  const fitnessProfile = createFitnessProfileService(repos, agentDefinition);

  // Program domain services (repos-only)
  const programOwner = createProgramOwnerService(repos);
  const program = createProgramService(repos);
  const enrollment = createEnrollmentService(repos);
  const programVersion = createProgramVersionService(repos);
  const planInstance = createPlanInstanceService(repos);

  // Exercise resolution (repos-only)
  const exerciseResolution = createExerciseResolutionService(repos);

  // Exercise metrics (repos-only)
  const exerciseMetrics = createExerciseMetricsService(repos);

  // Blog (repos-only)
  const blog = createBlogService(repos);

  // Organization (repos-only)
  const organization = createOrganizationService(repos);

  // =========================================================================
  // Phase 2: Create ContextRegistry (needed by agents)
  // =========================================================================
  const contextRegistry = new ContextRegistry();
  registerAllContextProviders(contextRegistry, {
    fitnessPlanService: fitnessPlan,
    workoutInstanceService: workoutInstance,
    microcycleService: microcycle,
    enrollmentService: enrollment,
    exerciseRepo: repos.exercise,
    contextTemplateService: contextTemplate,
    repos,
  });

  // =========================================================================
  // Phase 3: Create services that depend on other services
  // =========================================================================
  const message = createMessageService(repos, { user });

  // Services needing external clients - use lazy initialization
  let _referral: ReferralServiceInstance | null = null;
  let _adminAuth: AdminAuthServiceInstance | null = null;
  let _userAuth: UserAuthServiceInstance | null = null;
  let _programOwnerAuth: ProgramOwnerAuthServiceInstance | null = null;
  let _messagingOrchestrator: MessagingOrchestratorInstance | null = null;

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

  const getProgramOwnerAuth = (): ProgramOwnerAuthServiceInstance => {
    if (!_programOwnerAuth) {
      if (clients?.twilioClient) {
        _programOwnerAuth = createProgramOwnerAuthService(repos, { twilioClient: clients.twilioClient });
      } else {
        const { twilioClient } = require('../connections/twilio/twilio');
        _programOwnerAuth = createProgramOwnerAuthService(repos, { twilioClient });
      }
    }
    return _programOwnerAuth;
  };

  const getMessagingOrchestrator = (): MessagingOrchestratorInstance => {
    if (!_messagingOrchestrator) {
      if (clients?.twilioClient) {
        _messagingOrchestrator = createMessagingOrchestrator({
          message,
          queue,
          user,
          subscription,
          twilioClient: clients.twilioClient,
        });
      } else {
        const { twilioClient } = require('../connections/twilio/twilio');
        _messagingOrchestrator = createMessagingOrchestrator({
          message,
          queue,
          user,
          subscription,
          twilioClient,
        });
      }
    }
    return _messagingOrchestrator;
  };

  // =========================================================================
  // Phase 3.5: Create AgentRunner (needs contextService + lazy getters)
  // getServices() is lazy - called at invoke time, not at creation time.
  // Services referenced inside (profile, modification, etc.) are assigned later.
  // =========================================================================
  const toolRegistry = new ToolRegistry();
  registerAllTools(toolRegistry);

  // Forward-declared services used by getServices() lambda — assigned in later phases
  let profile: ProfileServiceInstance;
  let workoutModification: WorkoutModificationServiceInstance;
  let planModification: PlanModificationServiceInstance;

  const agentRunner = createAgentRunner({
    agentDefinitionService: agentDefinition,
    contextRegistry,
    toolRegistry,
    agentLogRepository: repos.agentLog,
    agentExtensionService: agentExtension,
    getServices: () => ({
      profile: { updateProfile: (...args: Parameters<typeof profile.updateProfile>) => profile.updateProfile(...args) },
      workoutModification: {
        modifyWorkout: (...args: Parameters<typeof workoutModification.modifyWorkout>) => workoutModification.modifyWorkout(...args),
        modifyWeek: (...args: Parameters<typeof workoutModification.modifyWeek>) => workoutModification.modifyWeek(...args),
      },
      planModification: {
        modifyPlan: (...args: Parameters<typeof planModification.modifyPlan>) => planModification.modifyPlan(...args),
      },
      queueMessage: (...args: Parameters<ReturnType<typeof getMessagingOrchestrator>['queueMessage']>) => getMessagingOrchestrator().queueMessage(...args),
      training: {
        getOrGenerateWorkout: async (userId: string, timezone: string) => {
          const { now } = require('@/shared/utils/date');
          const todayDt = now(timezone);
          const todayDate = todayDt.toJSDate();

          const existingWorkout = await workoutInstance.getWorkoutByUserIdAndDate(userId, todayDate);
          if (existingWorkout) {
            return {
              toolType: 'query' as const,
              response: `User's workout for today: ${existingWorkout.sessionType || 'Workout'} - ${existingWorkout.description || 'Custom workout'}`,
              messages: existingWorkout.message ? [existingWorkout.message] : undefined,
            };
          }

          const u = await user.getUser(userId);
          if (!u) return { toolType: 'query' as const, response: 'User not found.' };

          const generatedWorkout = await training.prepareWorkoutForDate(u, todayDt);
          if (!generatedWorkout) {
            return {
              toolType: 'query' as const,
              response: 'No workout scheduled for today.',
            };
          }

          return {
            toolType: 'query' as const,
            response: `User's workout for today: ${generatedWorkout.sessionType || 'Workout'} - ${generatedWorkout.description || 'Custom workout'}`,
            messages: generatedWorkout.message ? [generatedWorkout.message] : undefined,
          };
        },
      },
    }),
  });

  // =========================================================================
  // Phase 3.6: Create training service (needs agentRunner)
  // =========================================================================
  const training = createTrainingService({
    user,
    fitnessProfile,
    fitnessPlan,
    progress,
    microcycle,
    workoutInstance,
    shortLink,
    enrollment,
    program,
    programOwner,
    agentRunner,
    exerciseResolution,
    exerciseUse: repos.exerciseUse,
  });

  const programAgent = createProgramAgentService(agentRunner);

  // =========================================================================
  // Phase 4: Create agent and orchestration services
  // =========================================================================
  const messagingAgent = createMessagingAgentService(agentRunner);

  const dailyMessage = createDailyMessageService(repos, {
    user,
    workoutInstance,
    messagingOrchestrator: getMessagingOrchestrator(),
    dayConfig,
    training,
  });

  const weeklyMessage = createWeeklyMessageService({
    user,
    messagingOrchestrator: getMessagingOrchestrator(),
    training,
    fitnessPlan,
    messagingAgent,
    enrollment,
    dayConfig,
  });

  const onboarding = createOnboardingService({
    fitnessPlan,
    training,
    dailyMessage,
    messagingOrchestrator: getMessagingOrchestrator(),
    messagingAgent,
  });

  const onboardingCoordinator = createOnboardingCoordinator(repos, {
    onboardingData,
    user,
    onboarding,
  });

  // =========================================================================
  // Phase 5: Create modification, profile, and remaining AgentRunner-dependent services
  // Assigns forward-declared variables used by getServices() lambda in Phase 3.5
  // =========================================================================
  workoutModification = createWorkoutModificationService({
    user,
    microcycle,
    workoutInstance,
    training,
    fitnessPlan,
    agentRunner,
    exerciseResolution,
    exerciseUse: repos.exerciseUse,
    messagingOrchestrator: getMessagingOrchestrator(),
  });

  profile = createProfileService({
    user,
    fitnessProfile,
    workoutInstance,
    agentRunner,
  });

  planModification = createPlanModificationService(repos, {
    user,
    fitnessPlan,
    workoutModification,
    agentRunner,
  });

  const modification = createModificationService({
    user,
    workoutModification,
    planModification,
  });

  const chat = createChatService({
    message,
    user,
    agentRunner,
  });

  const chainRunner = createChainRunnerService(repos, {
    fitnessPlan,
    microcycle,
    workoutInstance,
    user,
    fitnessProfile,
    agentRunner,
    exerciseResolution,
    exerciseUse: repos.exerciseUse,
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
    queue,
    fitnessPlan,
    workoutInstance,
    microcycle,
    progress,
    subscription,
    dayConfig,

    // Additional services (use getters for lazy-loaded ones)
    shortLink,
    get referral() { return getReferral(); },
    get adminAuth() { return getAdminAuth(); },
    get userAuth() { return getUserAuth(); },
    get programOwnerAuth() { return getProgramOwnerAuth(); },
    get messagingOrchestrator() { return getMessagingOrchestrator(); },
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
    programAgent,

    // Chat orchestration
    chat,

    // Program domain services
    programOwner,
    program,
    enrollment,
    programVersion,
    planInstance,

    // Exercise resolution
    exerciseResolution,

    // Exercise metrics
    exerciseMetrics,

    // Blog
    blog,

    // Organization
    organization,

    // Agent definitions
    agentDefinition,

    // Agent logs
    agentLog,

    // Agent extensions
    agentExtension,

    // Context templates
    contextTemplate,

    // Agent Runner
    agentRunner,

    // Registries
    toolRegistry,
    contextRegistry,
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

// Re-export types for convenience
export type {
  // Core service types
  UserServiceInstance,
  FitnessProfileServiceInstance,
  OnboardingDataServiceInstance,
  MessageServiceInstance,
  QueueServiceInstance,
  FitnessPlanServiceInstance,
  WorkoutInstanceServiceInstance,
  MicrocycleServiceInstance,
  ProgressServiceInstance,
  SubscriptionServiceInstance,
  DayConfigServiceInstance,

  // Additional service types
  ShortLinkServiceInstance,
  ReferralServiceInstance,
  AdminAuthServiceInstance,
  UserAuthServiceInstance,
  ProgramOwnerAuthServiceInstance,
  MessagingOrchestratorInstance,
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
  ProgramAgentServiceInstance,

  // Program domain services
  ProgramOwnerServiceInstance,
  ProgramServiceInstance,
  EnrollmentServiceInstance,
  ProgramVersionServiceInstance,
  PlanInstanceServiceInstance,

  // Exercise resolution
  ExerciseResolutionServiceInstance,

  // Exercise metrics
  ExerciseMetricsServiceInstance,

  // Blog
  BlogServiceInstance,

  // Organization
  OrganizationServiceInstance,

  // Agent definitions
  AgentDefinitionServiceInstance,

  // Agent logs
  AgentLogServiceInstance,

  // Agent extensions
  AgentExtensionServiceInstance,

  // Context templates
  ContextTemplateServiceInstance,

  // Agent Runner
  AgentRunnerInstance,
};
