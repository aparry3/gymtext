import { UserWithProfile } from '../../models/user';
import { now, startOfDay, getDayOfWeek } from '@/shared/utils/date';
import type { FitnessPlanServiceInstance } from '../domain/training/fitnessPlanService';
import type { DailyMessageServiceInstance } from './dailyMessageService';
import type { TrainingServiceInstance } from './trainingService';
import type { MessageQueueServiceInstance, QueuedMessage } from '../domain/messaging/messageQueueService';
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
  fitnessPlan: FitnessPlanServiceInstance;
  training: TrainingServiceInstance;
  dailyMessage: DailyMessageServiceInstance;
  messageQueue: MessageQueueServiceInstance;
  messagingAgent: MessagingAgentServiceInstance;
}

/**
 * Create an OnboardingService instance with injected dependencies
 */
export function createOnboardingService(
  deps: OnboardingServiceDeps
): OnboardingServiceInstance {
  const {
    fitnessPlan: fitnessPlanService,
    training: trainingService,
    dailyMessage: dailyMessageService,
    messageQueue: messageQueueService,
    messagingAgent: messagingAgentService,
  } = deps;

  const prepareCombinedPlanMicrocycleMessage = async (user: UserWithProfile): Promise<string> => {
    const plan = await fitnessPlanService.getCurrentPlan(user.id);
    if (!plan) throw new Error(`No fitness plan found for user ${user.id}`);
    if (!plan.message) throw new Error(`No plan message found for user ${user.id}`);

    const currentDate = now(user.timezone).toJSDate();
    const { microcycle } = await trainingService.prepareMicrocycleForDate(user.id, plan, currentDate, user.timezone);
    if (!microcycle) throw new Error(`No microcycle found for user ${user.id}`);
    if (!microcycle.message) throw new Error(`No microcycle message found for user ${user.id}`);

    const currentWeekday = getDayOfWeek(undefined, user.timezone);
    const message = await messagingAgentService.generatePlanMicrocycleCombinedMessage(plan.message, microcycle.message, currentWeekday);
    console.log(`[Onboarding] Prepared combined plan+microcycle message for ${user.id}`);
    return message;
  };

  const prepareWorkoutMessage = async (user: UserWithProfile): Promise<string> => {
    const targetDate = startOfDay(now(user.timezone).toJSDate(), user.timezone);
    const workout = await dailyMessageService.getTodaysWorkout(user.id, targetDate);
    if (!workout) throw new Error(`No workout found for user ${user.id} on ${targetDate.toISOString()}`);
    if (!workout.message) throw new Error(`No workout message found for ${workout.id}`);
    console.log(`[Onboarding] Prepared workout message for ${user.id}`);
    return workout.message;
  };

  return {
    async createFitnessPlan(user: UserWithProfile): Promise<void> {
      console.log(`[Onboarding] Creating fitness plan for ${user.id}`);
      try {
        await fitnessPlanService.createFitnessPlan(user);
        console.log(`[Onboarding] Successfully created fitness plan for ${user.id}`);
      } catch (error) {
        console.error(`[Onboarding] Failed to create fitness plan for ${user.id}:`, error);
        throw error;
      }
    },

    async createFirstMicrocycle(user: UserWithProfile): Promise<void> {
      console.log(`[Onboarding] Creating first microcycle for ${user.id}`);
      try {
        const plan = await fitnessPlanService.getCurrentPlan(user.id);
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

        const messages: QueuedMessage[] = [
          { content: planMicrocycleMessage },
          { content: workoutMessage }
        ];

        await messageQueueService.enqueueMessages(user.id, messages, 'onboarding');
        console.log(`[Onboarding] Successfully queued onboarding messages for ${user.id}`);
      } catch (error) {
        console.error(`[Onboarding] Failed to send onboarding messages to ${user.id}:`, error);
        throw error;
      }
    },
  };
}

// =============================================================================
