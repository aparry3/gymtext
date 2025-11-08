import { MessageService } from '../messaging/messageService';
import { UserService } from '../user/userService';
import { FitnessPlanService } from '../training/fitnessPlanService';
import { ProgressService } from '../training/progressService';
import { MicrocycleService } from '../training/microcycleService';
import { UserWithProfile } from '@/server/models/userModel';
import { inngest } from '@/server/connections/inngest/client';
import { createWeeklyMessageAgent } from '@/server/agents/messaging/weeklyMessage/chain';

interface MessageResult {
  success: boolean;
  userId: string;
  error?: string;
  messageIds?: string[];
}

interface SchedulingResult {
  scheduled: number;
  failed: number;
  duration: number;
  errors: Array<{ userId: string; error: string }>;
}

export class WeeklyMessageService {
  private static instance: WeeklyMessageService;
  private userService: UserService;
  private messageService: MessageService;
  private progressService: ProgressService;
  private microcycleService: MicrocycleService;
  private fitnessPlanService: FitnessPlanService;

  private constructor() {
    this.userService = UserService.getInstance();
    this.messageService = MessageService.getInstance();
    this.progressService = ProgressService.getInstance();
    this.microcycleService = MicrocycleService.getInstance();
    this.fitnessPlanService = FitnessPlanService.getInstance();
  }

  public static getInstance(): WeeklyMessageService {
    if (!WeeklyMessageService.instance) {
      WeeklyMessageService.instance = new WeeklyMessageService();
    }
    return WeeklyMessageService.instance;
  }

  /**
   * Schedules weekly messages for all users in a given UTC hour on Sunday
   * Returns metrics about the scheduling operation
   */
  public async scheduleMessagesForHour(utcHour: number): Promise<SchedulingResult> {
    const startTime = Date.now();
    const errors: Array<{ userId: string; error: string }> = [];
    let scheduled = 0;
    let failed = 0;

    try {
      // Get all users who should receive weekly messages this hour (Sunday only)
      const users = await this.userService.getUsersForWeeklyMessage(utcHour);
      console.log(`[WeeklyMessageService] Found ${users.length} users to schedule for hour ${utcHour} on Sunday`);

      if (users.length === 0) {
        return {
          scheduled: 0,
          failed: 0,
          duration: Date.now() - startTime,
          errors: []
        };
      }

      // Map users to Inngest events
      const events = users.map(user => ({
        name: 'weekly/scheduled' as const,
        data: {
          userId: user.id,
        },
      }));

      // Send all events to Inngest in batch
      try {
        const { ids } = await inngest.send(events);
        scheduled = ids.length;
        console.log(`[WeeklyMessageService] Scheduled ${scheduled} Inngest jobs`);
      } catch (error) {
        console.error('[WeeklyMessageService] Failed to schedule Inngest jobs:', error);
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
      console.error('[WeeklyMessageService] Error scheduling messages:', error);
      throw error;
    }
  }

  /**
   * Sends weekly check-in messages to a single user
   *
   * Flow:
   * 1. Advance user's progress to next week
   * 2. Get/create next week's microcycle (now current after advancing)
   * 3. Check if it's the first week of a new mesocycle
   * 4. Generate messages using AI agent
   * 5. Send both messages with delay
   */
  public async sendWeeklyMessage(user: UserWithProfile): Promise<MessageResult> {
    try {
      console.log(`[WeeklyMessageService] Processing weekly message for user ${user.id}`);

      // Step 1: Advance to next week (this is the natural weekly checkpoint)
      await this.progressService.advanceWeek(user.id);
      console.log(`[WeeklyMessageService] Advanced week for user ${user.id}`);

      // Step 2: Get the fitness plan and progress
      const plan = await this.fitnessPlanService.getCurrentPlan(user.id);
      if (!plan) {
        console.error(`[WeeklyMessageService] No fitness plan found for user ${user.id}`);
        return {
          success: false,
          userId: user.id,
          error: 'No fitness plan found'
        };
      }

      const progress = await this.progressService.getCurrentProgress(plan);
      if (!progress) {
        console.error(`[WeeklyMessageService] No progress found for user ${user.id}`);
        return {
          success: false,
          userId: user.id,
          error: 'Could not determine training progress'
        };
      }

      // Step 3: Get or create the next week's microcycle (now current after advancing)
      const { microcycle: nextWeekMicrocycle } = await this.microcycleService.getOrCreateActiveMicrocycle(user, progress, plan);

      if (!nextWeekMicrocycle) {
        console.error(`[WeeklyMessageService] Failed to get/create next week's microcycle for user ${user.id}`);
        return {
          success: false,
          userId: user.id,
          error: 'Could not generate next week\'s training pattern'
        };
      }

      // Step 4: Check if it's the first week of a new mesocycle
      const isNewMesocycle = nextWeekMicrocycle.weekNumber === 0;

      const mesocycleName = isNewMesocycle
        ? plan.mesocycles[nextWeekMicrocycle.mesocycleIndex]?.name
        : null;

      if (isNewMesocycle) {
        console.log(`[WeeklyMessageService] User ${user.id} is starting new mesocycle: ${mesocycleName}`);
      }

      // Step 5: Generate messages using AI agent
      const weeklyMessageAgent = createWeeklyMessageAgent();
      const { feedbackMessage, breakdownMessage } = await weeklyMessageAgent.invoke({
        user,
        nextWeekMicrocycle: nextWeekMicrocycle.pattern,
        isNewMesocycle,
        mesocycleName
      });

      // Step 6: Send both messages with delay
      const messageIds: string[] = [];

      // Send feedback message first
      const feedbackMsg = await this.messageService.sendMessage(user, feedbackMessage);
      messageIds.push(feedbackMsg.id);
      console.log(`[WeeklyMessageService] Sent feedback message to user ${user.id}`);

      // Small delay before sending breakdown
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Send breakdown message
      const breakdownMsg = await this.messageService.sendMessage(user, breakdownMessage);
      messageIds.push(breakdownMsg.id);
      console.log(`[WeeklyMessageService] Sent breakdown message to user ${user.id}`);

      console.log(`[WeeklyMessageService] Successfully sent weekly messages to user ${user.id}`);
      return {
        success: true,
        userId: user.id,
        messageIds
      };
    } catch (error) {
      console.error(`[WeeklyMessageService] Error sending weekly message to user ${user.id}:`, error);
      return {
        success: false,
        userId: user.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export singleton instance
export const weeklyMessageService = WeeklyMessageService.getInstance();
