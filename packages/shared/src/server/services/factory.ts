/**
 * Service Factory
 *
 * Creates service instances with injected repositories.
 * Services are stateless - repos are passed to each factory function.
 */
import type { Kysely } from 'kysely';
import type { DB } from '../models/_types';
import type Stripe from 'stripe';
import { createRepositories, type RepositoryContainer } from '../repositories/factory';
import type { ITwilioClient } from '../connections/twilio/factory';

import { createUserService, type UserServiceInstance } from './domain/user/userService';
import { createFitnessProfileService, type FitnessProfileServiceInstance } from './domain/user/fitnessProfileService';
import { createOnboardingDataService, type OnboardingDataServiceInstance } from './domain/user/onboardingDataService';
import { createMessageService, type MessageServiceInstance } from './domain/messaging/messageService';
import { createQueueService, type QueueServiceInstance } from './domain/messaging/queueService';
import { createFitnessPlanService, type FitnessPlanServiceInstance } from './domain/training/fitnessPlanService';

import { createMicrocycleService, type MicrocycleServiceInstance } from './domain/training/microcycleService';
import { createProgressService, type ProgressServiceInstance } from './domain/training/progressService';
import { createSubscriptionService, type SubscriptionServiceInstance } from './domain/subscription/subscriptionService';
import { createDayConfigService, type DayConfigServiceInstance } from './domain/calendar/dayConfigService';
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
import { createMarkdownService, type MarkdownServiceInstance } from './domain/markdown/markdownService';
import { createProgramAgentService, type ProgramAgentServiceInstance } from './agents/programs';
import { createProfileService, type ProfileServiceInstance } from './agents/profile';
import { ToolRegistry, registerAllTools } from '@/server/agents/tools';
import { createSimpleAgentRunner, type SimpleAgentRunnerInstance } from '@/server/agents/runner';
import { createProgramOwnerService, type ProgramOwnerServiceInstance } from './domain/program/programOwnerService';
import { createProgramService, type ProgramServiceInstance } from './domain/program/programService';
import { createEnrollmentService, type EnrollmentServiceInstance } from './domain/program/enrollmentService';
import { createProgramVersionService, type ProgramVersionServiceInstance } from './domain/program/programVersionService';

export interface ExternalClients {
  stripeClient?: Stripe;
  twilioClient?: ITwilioClient;
}

export interface ServiceContainer {
  user: UserServiceInstance;
  fitnessProfile: FitnessProfileServiceInstance;
  onboardingData: OnboardingDataServiceInstance;
  message: MessageServiceInstance;
  queue: QueueServiceInstance;
  fitnessPlan: FitnessPlanServiceInstance;

  microcycle: MicrocycleServiceInstance;
  progress: ProgressServiceInstance;
  subscription: SubscriptionServiceInstance;
  dayConfig: DayConfigServiceInstance;
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
  messagingAgent: MessagingAgentServiceInstance;
  workoutModification: WorkoutModificationServiceInstance;
  planModification: PlanModificationServiceInstance;
  modification: ModificationServiceInstance;
  training: TrainingServiceInstance;
  programAgent: ProgramAgentServiceInstance;
  chat: ChatServiceInstance;
  programOwner: ProgramOwnerServiceInstance;
  program: ProgramServiceInstance;
  enrollment: EnrollmentServiceInstance;
  programVersion: ProgramVersionServiceInstance;
  exerciseResolution: ExerciseResolutionServiceInstance;
  exerciseMetrics: ExerciseMetricsServiceInstance;
  blog: BlogServiceInstance;
  organization: OrganizationServiceInstance;
  agentDefinition: AgentDefinitionServiceInstance;
  agentLog: AgentLogServiceInstance;
  markdown: MarkdownServiceInstance;
  agentRunner: SimpleAgentRunnerInstance;
  toolRegistry: ToolRegistry;
}

export function createServices(repos: RepositoryContainer, clients?: ExternalClients): ServiceContainer {
  // Phase 1: repos-only services
  const user = createUserService(repos);
  const onboardingData = createOnboardingDataService(repos);
  const fitnessPlan = createFitnessPlanService(repos);

  const microcycle = createMicrocycleService(repos);
  const progress = createProgressService(repos);
  const subscription = createSubscriptionService(repos);
  const dayConfig = createDayConfigService(repos);
  const shortLink = createShortLinkService(repos);
  const queue = createQueueService(repos);
  const agentDefinition = createAgentDefinitionService(repos);
  const agentLog = createAgentLogService(repos);
  const markdown = createMarkdownService(repos);
  // fitnessProfile uses agentRunner which is created later, so use lazy getter
  const getAgentRunner = (): SimpleAgentRunnerInstance => agentRunner;
  const fitnessProfile = createFitnessProfileService(repos, getAgentRunner);
  const programOwner = createProgramOwnerService(repos);
  const program = createProgramService(repos);
  const enrollment = createEnrollmentService(repos);
  const programVersion = createProgramVersionService(repos);
  const exerciseResolution = createExerciseResolutionService(repos);
  const exerciseMetrics = createExerciseMetricsService(repos);
  const blog = createBlogService(repos);
  const organization = createOrganizationService(repos);

  // Phase 2: Services with service deps
  const message = createMessageService(repos, { user });

  // Lazy external-client services
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
        const { getStripeSecrets } = require('../config');
        const Stripe = require('stripe').default;
        const { secretKey } = getStripeSecrets();
        _referral = createReferralService(repos, { stripeClient: new Stripe(secretKey, { apiVersion: '2023-10-16' }) });
      }
    }
    return _referral;
  };
  const getAdminAuth = (): AdminAuthServiceInstance => {
    if (!_adminAuth) {
      const tc = clients?.twilioClient ?? require('../connections/twilio/twilio').twilioClient;
      _adminAuth = createAdminAuthService(repos, { twilioClient: tc });
    }
    return _adminAuth;
  };
  const getUserAuth = (): UserAuthServiceInstance => {
    if (!_userAuth) {
      const tc = clients?.twilioClient ?? require('../connections/twilio/twilio').twilioClient;
      _userAuth = createUserAuthService(repos, { twilioClient: tc, adminAuth: getAdminAuth() });
    }
    return _userAuth;
  };
  const getProgramOwnerAuth = (): ProgramOwnerAuthServiceInstance => {
    if (!_programOwnerAuth) {
      const tc = clients?.twilioClient ?? require('../connections/twilio/twilio').twilioClient;
      _programOwnerAuth = createProgramOwnerAuthService(repos, { twilioClient: tc });
    }
    return _programOwnerAuth;
  };
  const getMessagingOrchestrator = (): MessagingOrchestratorInstance => {
    if (!_messagingOrchestrator) {
      const tc = clients?.twilioClient ?? require('../connections/twilio/twilio').twilioClient;
      _messagingOrchestrator = createMessagingOrchestrator({ message, queue, user, subscription, twilioClient: tc });
    }
    return _messagingOrchestrator;
  };

  // Phase 3: Agent Runner
  const toolRegistry = new ToolRegistry();
  registerAllTools(toolRegistry);

  let profile: ProfileServiceInstance;
  let workoutModification: WorkoutModificationServiceInstance;
  let planModification: PlanModificationServiceInstance;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buildToolServices = (): any => ({
    profile: { updateProfile: (...args: Parameters<typeof profile.updateProfile>) => profile.updateProfile(...args) },
    workoutModification: {
      modifyWorkout: (...args: Parameters<typeof workoutModification.modifyWorkout>) => workoutModification.modifyWorkout(...args),
      modifyWeek: (...args: Parameters<typeof workoutModification.modifyWeek>) => workoutModification.modifyWeek(...args),
    },
    planModification: {
      modifyPlan: (...args: Parameters<typeof planModification.modifyPlan>) => planModification.modifyPlan(...args),
    },
    training: {
      getOrGenerateWorkout: async (userId: string, timezone: string) => {
        const { now: nowFn } = require('@/shared/utils/date');
        const todayDt = nowFn(timezone);
        const todayDate = todayDt.toJSDate();
        const weekDossier = await markdown.getWeekForDate(userId, todayDate);
        if (weekDossier?.content) {
          return { toolType: 'query' as const, response: `User's workout schedule for this week:\n${weekDossier.content}`, messages: undefined };
        }
        const u = await user.getUser(userId);
        if (!u) return { toolType: 'query' as const, response: 'User not found.' };
        const generatedWorkout = await training.prepareWorkoutForDate(u, todayDt);
        if (!generatedWorkout) return { toolType: 'query' as const, response: 'No workout scheduled for today.' };
        return { toolType: 'query' as const, response: generatedWorkout.message || generatedWorkout.description || 'Workout generated.', messages: generatedWorkout.message ? [generatedWorkout.message] : undefined };
      },
    },
    queueMessage: (...args: Parameters<ReturnType<typeof getMessagingOrchestrator>['queueMessage']>) => getMessagingOrchestrator().queueMessage(...args),
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const agentRunner = createSimpleAgentRunner({
    agentDefinitionService: agentDefinition as any,
    toolRegistry,
    getServices: buildToolServices,
    agentLogRepository: repos.agentLog,
  });

  // Phase 4: Training and orchestration services
  const training = createTrainingService({
    user,
    markdown,
    agentRunner,
  });

  const programAgent = createProgramAgentService(agentRunner);
  const messagingAgent = createMessagingAgentService(agentRunner);

  const dailyMessage = createDailyMessageService({
    user,
    messagingOrchestrator: getMessagingOrchestrator(),
    dayConfig, training,
  });

  const weeklyMessage = createWeeklyMessageService({
    user,
    messagingOrchestrator: getMessagingOrchestrator(),
    training, markdown, messagingAgent, dayConfig,
  });

  const onboarding = createOnboardingService({
    markdown, training,
    messagingOrchestrator: getMessagingOrchestrator(),
    messagingAgent,
  });

  const onboardingCoordinator = createOnboardingCoordinator(repos, {
    onboardingData, user, onboarding,
  });

  // Phase 5: Modification, profile, and remaining services
  workoutModification = createWorkoutModificationService({
    user, markdown, training,
    agentRunner,
    messagingOrchestrator: getMessagingOrchestrator(),
  });

  profile = createProfileService({
    user, markdown,
    agentRunner,
  });

  planModification = createPlanModificationService({
    user, markdown, workoutModification, agentRunner,
  });

  const modification = createModificationService({
    user, workoutModification, planModification,
  });

  const chat = createChatService({
    message, user, markdown, agentRunner,
  });

  return {
    user, fitnessProfile, onboardingData, message, queue, fitnessPlan,
    microcycle, progress, subscription, dayConfig, shortLink,
    get referral() { return getReferral(); },
    get adminAuth() { return getAdminAuth(); },
    get userAuth() { return getUserAuth(); },
    get programOwnerAuth() { return getProgramOwnerAuth(); },
    get messagingOrchestrator() { return getMessagingOrchestrator(); },
    dailyMessage, weeklyMessage, onboarding, onboardingCoordinator,
    messagingAgent, workoutModification, planModification,
    modification, training, programAgent, chat,
    programOwner, program, enrollment, programVersion,
    exerciseResolution, exerciseMetrics, blog, organization,
    agentDefinition, agentLog, markdown,
    agentRunner, toolRegistry,
  };
}

export function createServicesFromDb(db: Kysely<DB>, clients?: ExternalClients): ServiceContainer {
  return createServices(createRepositories(db), clients);
}

export type {
  UserServiceInstance, FitnessProfileServiceInstance, OnboardingDataServiceInstance,
  MessageServiceInstance, QueueServiceInstance, FitnessPlanServiceInstance,
  MicrocycleServiceInstance, ProgressServiceInstance,
  SubscriptionServiceInstance, DayConfigServiceInstance, ShortLinkServiceInstance,
  ReferralServiceInstance, AdminAuthServiceInstance, UserAuthServiceInstance,
  ProgramOwnerAuthServiceInstance, MessagingOrchestratorInstance,
  DailyMessageServiceInstance, WeeklyMessageServiceInstance, OnboardingServiceInstance,
  OnboardingCoordinatorInstance, MessagingAgentServiceInstance,
  WorkoutModificationServiceInstance, PlanModificationServiceInstance, ModificationServiceInstance,
  TrainingServiceInstance, ProgramAgentServiceInstance, ProgramOwnerServiceInstance,
  ProgramServiceInstance, EnrollmentServiceInstance, ProgramVersionServiceInstance,
  ExerciseResolutionServiceInstance, ExerciseMetricsServiceInstance,
  BlogServiceInstance, OrganizationServiceInstance, AgentDefinitionServiceInstance,
  AgentLogServiceInstance, MarkdownServiceInstance, SimpleAgentRunnerInstance,
};
