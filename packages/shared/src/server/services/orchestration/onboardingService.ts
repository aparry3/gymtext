import { UserWithProfile } from '../../models/user';
import { now } from '@/shared/utils/date';
import type { MarkdownServiceInstance } from '../domain/markdown/markdownService';
import type { TrainingServiceInstance } from './trainingService';
import type { MessagingOrchestratorInstance, QueuedMessageContent } from './messagingOrchestrator';
import type { WorkoutInstanceServiceInstance } from '../domain/training/workoutInstanceService';
import type { CoachSchedulingServiceInstance } from './coachSchedulingService';
import type { EnrollmentServiceInstance } from '../domain/program/enrollmentService';
import type { ProgramServiceInstance } from '../domain/program/programService';
import { buildWelcomeMessage } from './messagingConstants';
import { resolveSmsImageUrl } from './smsImageResolver';

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
  sendWelcomeMessage(user: UserWithProfile): Promise<void>;
}

export interface OnboardingServiceDeps {
  markdown: MarkdownServiceInstance;
  training: TrainingServiceInstance;
  workoutInstance: WorkoutInstanceServiceInstance;
  messagingOrchestrator: MessagingOrchestratorInstance;
  enrollment: EnrollmentServiceInstance;
  program: ProgramServiceInstance;
  coachScheduling?: CoachSchedulingServiceInstance;
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
    workoutInstance: workoutInstanceService,
    messagingOrchestrator,
    enrollment: enrollmentService,
    program: programService,
    coachScheduling: coachSchedulingService,
  } = deps;

  const prepareWorkoutMessage = async (user: UserWithProfile): Promise<string> => {
    const targetDate = now(user.timezone).startOf('day');
    const dateStr = targetDate.toISODate()!;
    const existing = await workoutInstanceService.getByUserAndDate(user.id, dateStr);
    if (!existing?.message) {
      throw new Error(`No workout found for user ${user.id} on ${dateStr} — expected Step 5 to have created it`);
    }
    console.log(`[Onboarding] Using existing workout message for ${user.id}`);
    return existing.message;
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

    async sendWelcomeMessage(user: UserWithProfile): Promise<void> {
      console.log(`[Onboarding] Sending welcome message to ${user.id}`);
      try {
        let brand = 'GymText';
        let programSmsImageUrl: string | null = null;

        const activeEnrollment = await enrollmentService.getActiveEnrollment(user.id);
        if (activeEnrollment) {
          const prog = await programService.getById(activeEnrollment.programId);
          if (prog) {
            brand = prog.name;
            programSmsImageUrl = prog.smsImageUrl ?? null;
          }
        }

        const mediaUrls = resolveSmsImageUrl({
          customDayImageUrl: null,
          programSmsImageUrl,
        });

        await messagingOrchestrator.queueMessages(
          user,
          [{ content: buildWelcomeMessage(brand), mediaUrls }],
          'onboarding'
        );
        console.log(`[Onboarding] Queued welcome message for ${user.id} (brand: ${brand})`);
      } catch (error) {
        console.error(`[Onboarding] Failed to queue welcome message for ${user.id}:`, error);
        // Don't throw - welcome message failure shouldn't block signup
      }
    },

    async sendOnboardingMessages(user: UserWithProfile): Promise<void> {
      console.log(`[Onboarding] Sending onboarding messages to ${user.id}`);
      try {
        const workoutMessage = await prepareWorkoutMessage(user);

        const messages: QueuedMessageContent[] = [
          { content: workoutMessage }
        ];

        await messagingOrchestrator.queueMessages(user, messages, 'onboarding');
        console.log(`[Onboarding] Successfully queued onboarding messages for ${user.id}`);

        // Layer A — welcome coach link. Service no-ops if program isn't coach-enabled.
        if (coachSchedulingService) {
          try {
            const result = await coachSchedulingService.sendCoachLink(user.id, 'welcome');
            if (result.sent) {
              console.log(`[Onboarding] Sent welcome coach link to ${user.id}`);
            }
          } catch (error) {
            console.error(`[Onboarding] Failed to send welcome coach link to ${user.id}:`, error);
            // Don't throw — coach link is supplemental
          }
        }
      } catch (error) {
        console.error(`[Onboarding] Failed to send onboarding messages to ${user.id}:`, error);
        throw error;
      }
    },
  };
}

// =============================================================================
