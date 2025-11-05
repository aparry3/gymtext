import { MessageService } from '../messaging/messageService';
import { UserService } from '../user/userService';
import { UserWithProfile } from '@/server/models/userModel';
import { WorkoutInstance, NewWorkoutInstance } from '@/server/models/workout';
import { DateTime } from 'luxon';
import { ProgressService } from '../training/progressService';
import { FitnessPlanService } from '../training/fitnessPlanService';
import { WorkoutInstanceService } from '../training/workoutInstanceService';
import { createDailyWorkoutAgent } from '@/server/agents/fitnessPlan/workouts/generate/chain';
import { inngest } from '@/server/connections/inngest/client';

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
  private progressService: ProgressService;
  private fitnessPlanService: FitnessPlanService;
  private batchSize: number;

  private constructor(batchSize: number = 10) {
    this.userService = UserService.getInstance();
    this.workoutInstanceService = WorkoutInstanceService.getInstance();
    this.messageService = MessageService.getInstance();
    this.fitnessPlanService = FitnessPlanService.getInstance();
    this.progressService = ProgressService.getInstance();
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
        const targetDate = DateTime.now()
          .setZone(user.timezone)
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
      const targetDate = DateTime.now().setZone(user.timezone).startOf('day');

      // First try to get existing workout
      let workout = await this.getTodaysWorkout(user.id, targetDate.toJSDate());

      // If no workout exists, generate it on-demand
      if (!workout) {
        console.log(`No workout found for user ${user.id} on ${targetDate.toISODate()}, generating on-demand`);
        workout = await this.generateTodaysWorkout(user, targetDate);

        if (!workout) {
          console.log(`Failed to generate workout for user ${user.id} on ${targetDate.toISODate()}`);
          return {
            success: false,
            userId: user.id,
            error: 'Could not generate workout for today'
          };
        }
      }

      // Generate and send message
      const storedMessage = await this.messageService.sendWorkoutMessage(user, workout);
      console.log(`Successfully sent daily message to user ${user.id}`);
      return {
        success: true,
        userId: user.id,
        messageId: storedMessage.id
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
  private async getTodaysWorkout(userId: string, date: Date): Promise<WorkoutInstance | null> {
    // The date passed in is already the correct date at midnight in the user's timezone
    // We can use it directly for the query
    const workout = await this.workoutInstanceService.getWorkoutByUserIdAndDate(userId, date);
    console.log(`Workout: ${workout}`);
    return workout || null;
  }

  /**
   * Generates today's workout on-demand using AI
   */
  private async generateTodaysWorkout(
    user: UserWithProfile,
    targetDate: DateTime
  ): Promise<WorkoutInstance | null> {
    try {
      // Get fitness plan
      const plan = await this.fitnessPlanService.getCurrentPlan(user.id);
      if (!plan) {
        console.log(`No fitness plan found for user ${user.id}`);
        return null;
      }

      // Ensure progress is up-to-date and get current microcycle (single call!)
      const progress = await this.progressService.ensureUpToDateProgress(plan, user);
      if (!progress) {
        console.log(`No progress found for user ${user.id}`);
        return null;
      }

      // Extract what we need from progress
      const { microcycle, mesocycle } = progress;
      if (!microcycle) {
        console.log(`Could not get/create microcycle for user ${user.id}`);
        return null;
      }

      // Get the day's pattern from the microcycle
      const dayOfWeek = targetDate.toFormat('EEEE').toUpperCase(); // MONDAY, TUESDAY, etc.
      const dayPlan = microcycle.pattern.days.find(d => d.day === dayOfWeek);

      if (!dayPlan) {
        console.log(`No pattern found for ${dayOfWeek} in microcycle ${microcycle.id}`);
        return null;
      }

      // Get recent workouts for context (last 7 days)
      const recentWorkouts = await this.workoutInstanceService.getRecentWorkouts(user.id, 7);

      // Use AI agent to generate sophisticated workout (now returns message too!)
      const { workout: enhancedWorkout, message, description, reasoning } = await createDailyWorkoutAgent().invoke({
        user,
        date: targetDate.toJSDate(),
        dayPlan,
        microcycle,
        mesocycle,
        fitnessPlan: plan,
        recentWorkouts
      });

      // Convert enhanced workout to database format
      const workout: NewWorkoutInstance = {
        // Let database generate UUID automatically
        clientId: user.id,
        fitnessPlanId: microcycle.fitnessPlanId,
        mesocycleId: null, // No longer using mesocycles table
        microcycleId: microcycle.id,
        date: targetDate.toJSDate(),
        sessionType: this.mapThemeToSessionType(dayPlan.theme),
        goal: `${dayPlan.theme}${dayPlan.notes ? ` - ${dayPlan.notes}` : ''}`,
        details: JSON.parse(JSON.stringify(enhancedWorkout)),
        description,
        reasoning,
        message, // Save the pre-generated message
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save the workout to the database
      const savedWorkout = await this.workoutInstanceService.createWorkout(workout);
      console.log(`Generated and saved AI workout for user ${user.id} on ${targetDate.toISODate()}`);

      return savedWorkout;
    } catch (error) {
      console.error(`Error generating workout for user ${user.id}:`, error);
      throw error; // Propagate error to be handled upstream
    }
  }

  /**
   * Maps theme to session type for database storage
   * Valid frontend types: run, lift, metcon, mobility, rest, other
   */
  private mapThemeToSessionType(theme: string): string {
    const themeLower = theme.toLowerCase();

    // Map to frontend-compatible session types
    if (themeLower.includes('run') || themeLower.includes('running')) return 'run';
    if (themeLower.includes('metcon') || themeLower.includes('hiit') ||
        themeLower.includes('conditioning') || themeLower.includes('cardio')) return 'metcon';
    if (themeLower.includes('lift') || themeLower.includes('strength') ||
        themeLower.includes('upper') || themeLower.includes('lower') ||
        themeLower.includes('push') || themeLower.includes('pull')) return 'lift';
    if (themeLower.includes('mobility') || themeLower.includes('flexibility') ||
        themeLower.includes('stretch')) return 'mobility';
    if (themeLower.includes('rest') || themeLower.includes('recovery') ||
        themeLower.includes('deload')) return 'rest';

    // Default to other for assessment/hybrid/unknown workouts
    return 'other';
  }
}

// Export singleton instance
export const dailyMessageService = DailyMessageService.getInstance();