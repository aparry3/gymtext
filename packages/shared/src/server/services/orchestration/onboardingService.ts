import { UserWithProfile } from '../../models/user';
import { now, getDayOfWeek } from '@/shared/utils/date';
import type { MarkdownServiceInstance } from '../domain/markdown/markdownService';
import type { TrainingServiceInstance } from './trainingService';
import type { MessagingOrchestratorInstance, QueuedMessageContent } from './messagingOrchestrator';
import type { MessagingAgentServiceInstance } from '../agents/messaging/messagingAgentService';

// =============================================================================
// Factory Pattern (Recommended)
// =============================================================================

/**
 * OnboardingServiceInstance interface
 */
export interface OnboardingServiceInstance {
  createFitnessPlan(user: UserWithProfile): Promise<void>;
  createFirstMicrocycle(user: UserWithProfile): Promise<void>;
  createFirstWorkout(user: UserWithProfile): Promise<void>;
  sendOnboardingMessages(user: UserWithProfile): Promise<void>;
}

export interface OnboardingServiceDeps {
  markdown: MarkdownServiceInstance;
  training: TrainingServiceInstance;
  messagingOrchestrator: MessagingOrchestratorInstance;
  messagingAgent: MessagingAgentServiceInstance;
}

/**
 * Create an OnboardingService instance with injected dependencies
 */
export function createOnboardingService(
  deps: OnboardingServiceDeps
): OnboardingServiceInstance {
  const {
    markdown: markdownService,
    training: trainingService,
    messagingOrchestrator,
    messagingAgent: messagingAgentService,
  } = deps;

  const prepareCombinedPlanMicrocycleMessage = async (user: UserWithProfile): Promise<string> => {
    const plan = await markdownService.getPlan(user.id);
    if (!plan) throw new Error(`No fitness plan found for user ${user.id}`);
    if (!plan.content) throw new Error(`No plan content found for user ${user.id}`);

    const currentDate = now(user.timezone).toJSDate();
    const { microcycle } = await trainingService.prepareMicrocycleForDate(user.id, plan, currentDate, user.timezone);
    if (!microcycle) throw new Error(`No microcycle found for user ${user.id}`);
    if (!microcycle.content) throw new Error(`No microcycle content found for user ${user.id}`);

    const currentWeekday = getDayOfWeek(undefined, user.timezone);
    const message = await messagingAgentService.generatePlanMicrocycleCombinedMessage(plan.content, microcycle.content, currentWeekday);
    console.log(`[Onboarding] Prepared combined plan+microcycle message for ${user.id}`);
    return message;
  };

  const prepareWorkoutMessage = async (user: UserWithProfile): Promise<string> => {
    const targetDate = now(user.timezone).startOf('day');
    const workout = await trainingService.prepareWorkoutForDate(user, targetDate);
    if (!workout) throw new Error(`No workout found for user ${user.id} on ${targetDate.toISO()}`);
    if (!workout.message) throw new Error(`No workout message found for ${workout.id}`);
    console.log(`[Onboarding] Prepared workout message for ${user.id}`);
    return workout.message;
  };

  return {
    async createFitnessPlan(user: UserWithProfile): Promise<void> {
      console.log(`[Onboarding] Creating fitness plan for ${user.id}`);
      try {
        await trainingService.createFitnessPlan(user);
        console.log(`[Onboarding] Successfully created fitness plan for ${user.id}`);
      } catch (error) {
        console.error(`[Onboarding] Failed to create fitness plan for ${user.id}:`, error);
        throw error;
      }
    },

    async createFirstMicrocycle(user: UserWithProfile): Promise<void> {
      console.log(`[Onboarding] Creating first microcycle for ${user.id}`);
      try {
        const plan = await markdownService.getPlan(user.id);
        if (!plan) throw new Error(`No fitness plan found for user ${user.id}`);

        const currentDate = now(user.timezone).toJSDate();
        const { microcycle } = await trainingService.prepareMicrocycleForDate(user.id, plan, currentDate, user.timezone);
        if (!microcycle) throw new Error('Failed to create first microcycle');

        console.log(`[Onboarding] Successfully created first microcycle for ${user.id}`);
      } catch (error) {
        console.error(`[Onboarding] Failed to create first microcycle for ${user.id}:`, error);
        throw error;
      }
    },

    async createFirstWorkout(user: UserWithProfile): Promise<void> {
      console.log(`[Onboarding] Creating first workout for ${user.id}`);
      try {
        const targetDate = now(user.timezone).startOf('day');
        const workout = await trainingService.prepareWorkoutForDate(user, targetDate);
        if (!workout) throw new Error('Failed to create first workout');
        console.log(`[Onboarding] Successfully created first workout for ${user.id}`);
      } catch (error) {
        console.error(`[Onboarding] Failed to create first workout for ${user.id}:`, error);
        throw error;
      }
    },

    async sendOnboardingMessages(user: UserWithProfile): Promise<void> {
      console.log(`[Onboarding] Sending onboarding messages to ${user.id}`);
      try {
        const planMicrocycleMessage = await prepareCombinedPlanMicrocycleMessage(user);
        const workoutMessage = await prepareWorkoutMessage(user);

        const messages: QueuedMessageContent[] = [
          { content: planMicrocycleMessage },
          { content: workoutMessage }
        ];

        // Use messagingOrchestrator instead of messageQueueService
        await messagingOrchestrator.queueMessages(user, messages, 'onboarding');
        console.log(`[Onboarding] Successfully queued onboarding messages for ${user.id}`);
      } catch (error) {
        console.error(`[Onboarding] Failed to send onboarding messages to ${user.id}:`, error);
        throw error;
      }
    },
  };
}

// =============================================================================
