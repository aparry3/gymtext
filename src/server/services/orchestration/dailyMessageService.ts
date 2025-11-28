import { MessageService } from '../messaging/messageService';
import { UserService } from '../user/userService';
import { UserWithProfile } from '@/server/models/userModel';
import { WorkoutInstance } from '@/server/models/workout';
import { DateTime } from 'luxon';
import { now } from '@/shared/utils/date';
import { WorkoutInstanceService } from '../training/workoutInstanceService';
import { inngest } from '@/server/connections/inngest/client';
import { messageQueueService, type QueuedMessage } from '../messaging/messageQueueService';

interface MessageResult {
  success: boolean;
  userId: string;
  error?: string;
  messageId?: string;
}

interface SchedulingResult {
  scheduled: number;
  failed: number;
  duration: number;
  errors: Array<{ userId: string; error: string }>;
}

export class DailyMessageService {
  private static instance: DailyMessageService;
  private userService: UserService;
  private workoutInstanceService: WorkoutInstanceService;
  private messageService: MessageService;
  private batchSize: number;

  private constructor(batchSize: number = 10) {
    this.userService = UserService.getInstance();
    this.workoutInstanceService = WorkoutInstanceService.getInstance();
    this.messageService = MessageService.getInstance();
    this.batchSize = batchSize;
  }

  public static getInstance(batchSize: number = 10): DailyMessageService {
    if (!DailyMessageService.instance) {
      DailyMessageService.instance = new DailyMessageService(batchSize);
    }
    return DailyMessageService.instance;
  }

  /**
   * Schedules daily messages for all users in a given UTC hour
   * Returns metrics about the scheduling operation
   */
  public async scheduleMessagesForHour(utcHour: number): Promise<SchedulingResult> {
    const startTime = Date.now();
    const errors: Array<{ userId: string; error: string }> = [];
    let scheduled = 0;
    let failed = 0;

    try {
      // Get all users who should receive messages this hour
      const users = await this.userService.getUsersForHour(utcHour);
      console.log(`[DailyMessageService] Found ${users.length} users to schedule for hour ${utcHour}`);

      if (users.length === 0) {
        return {
          scheduled: 0,
          failed: 0,
          duration: Date.now() - startTime,
          errors: []
        };
      }

      // Map users to Inngest events
      const events = users.map(user => {
        // Get target date in user's timezone (today at start of day)
        const targetDate = now(user.timezone)
          .startOf('day')
          .toISO();

        return {
          name: 'workout/scheduled' as const,
          data: {
            userId: user.id,
            targetDate,
          },
        };
      });

      // Send all events to Inngest in batch
      try {
        const { ids } = await inngest.send(events);
        scheduled = ids.length;
        console.log(`[DailyMessageService] Scheduled ${scheduled} Inngest jobs`);
      } catch (error) {
        console.error('[DailyMessageService] Failed to schedule Inngest jobs:', error);
        failed = events.length;
        errors.push({
          userId: 'batch',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      return {
        scheduled,
        failed,
        duration: Date.now() - startTime,
        errors
      };
    } catch (error) {
      console.error('[DailyMessageService] Error scheduling messages:', error);
      throw error;
    }
  }

  /**
   * Sends a daily message to a single user
   */
  public async sendDailyMessage(
    user: UserWithProfile
  ): Promise<MessageResult> {
    try {
      console.log(`Processing daily message for user ${user.id}`);

      // Get today's date in the user's timezone
      const targetDate = now(user.timezone).startOf('day');

      // First try to get existing workout
      let workout = await this.getTodaysWorkout(user.id, targetDate.toJSDate());

      // If no workout exists, generate it on-demand
      if (!workout) {
        console.log(`No workout found for user ${user.id} on ${targetDate.toISODate()}, generating on-demand`);
        workout = await this.workoutInstanceService.generateWorkoutForDate(user, targetDate);

        if (!workout) {
          console.log(`Failed to generate workout for user ${user.id} on ${targetDate.toISODate()}`);
          return {
            success: false,
            userId: user.id,
            error: 'Could not generate workout for today'
          };
        }
      }

      // Extract message content (either pre-generated or need to generate)
      let workoutMessage: string;
      if ('message' in workout && workout.message) {
        workoutMessage = workout.message;
      } else if ('description' in workout && 'reasoning' in workout && workout.description && workout.reasoning) {
        // Fallback: Generate message if needed (shouldn't happen in production)
        const { createWorkoutMessageAgent } = await import('@/server/agents/training/workouts/shared/steps/message/chain');
        const messageAgent = createWorkoutMessageAgent({ operationName: 'fallback message' });
        workoutMessage = await messageAgent.invoke({ description: workout.description });
      } else {
        throw new Error('Workout missing required fields for message generation');
      }

      // Send single message with both image and text
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL;
      const mediaUrls = baseUrl ? [`${baseUrl}/OpenGraphGymtext.png`] : undefined;

      if (!baseUrl) {
        console.warn('BASE_URL not configured - sending workout without logo image');
      }

      const queuedMessages: QueuedMessage[] = [{
        content: workoutMessage,
        mediaUrls
      }];

      await messageQueueService.enqueueMessages(user.id, queuedMessages, 'daily');
      console.log(`Successfully queued daily messages for user ${user.id}`);

      return {
        success: true,
        userId: user.id,
        messageId: undefined // Messages will be sent asynchronously by queue
      };
    } catch (error) {
      console.error(`Error sending daily message to user ${user.id}:`, error);
      return {
        success: false,
        userId: user.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Gets today's workout for a user
   */
  public async getTodaysWorkout(userId: string, date: Date): Promise<WorkoutInstance | null> {
    // The date passed in is already the correct date at midnight in the user's timezone
    // We can use it directly for the query
    const workout = await this.workoutInstanceService.getWorkoutByUserIdAndDate(userId, date);
    console.log(`Workout: ${workout}`);
    return workout || null;
  }

  /**
   * Generates a workout for a specific date (wrapper for onboarding)
   * Delegates to WorkoutInstanceService for business logic
   */
  public async generateWorkout(
    user: UserWithProfile,
    targetDate: DateTime
  ): Promise<WorkoutInstance | null> {
    return this.workoutInstanceService.generateWorkoutForDate(user, targetDate);
  }
}

// Export singleton instance
export const dailyMessageService = DailyMessageService.getInstance();