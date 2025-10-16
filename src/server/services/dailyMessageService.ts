import { UserRepository } from '@/server/repositories/userRepository';
import { WorkoutInstanceRepository } from '@/server/repositories/workoutInstanceRepository';
import { MessageService } from './messageService';
import { UserWithProfile } from '@/server/models/userModel';
import { WorkoutInstance, NewWorkoutInstance } from '@/server/models/workout';
import { DateTime } from 'luxon';
import { ProgressService } from './progressService';
import { FitnessPlanRepository } from '@/server/repositories/fitnessPlanRepository';
import { generateDailyWorkout } from '@/server/agents/fitnessPlan/workouts/generate/chain';
import { generateDailyWorkoutMessage } from '../agents/messaging/workoutMessage/chain';
import { Message } from '@/server/models/conversation';

interface BatchResult {
  processed: number;
  failed: number;
  errors: Array<{ userId: string; error: string }>;
  duration: number;
}

interface MessageResult {
  success: boolean;
  userId: string;
  error?: string;
  messageText?: string;
  messageId?: string;
}

export interface ProcessOptions {
  currentUtcHour?: number;
  currentDate?: Date;
  userFilter?: string[];
  dryRun?: boolean;
  testMode?: boolean;
}

export class DailyMessageService {
  private static instance: DailyMessageService;
  private userRepository: UserRepository;
  private workoutRepository: WorkoutInstanceRepository;
  private messageService: MessageService;
  private progressService: ProgressService;
  private fitnessPlanRepo: FitnessPlanRepository;
  private batchSize: number;

  private constructor(batchSize: number = 10) {
    this.userRepository = new UserRepository();
    this.workoutRepository = new WorkoutInstanceRepository();
    this.messageService = MessageService.getInstance();
    this.fitnessPlanRepo = new FitnessPlanRepository();
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
   * Main entry point for the hourly cron job
   * Processes all users whose local time matches their preferred send hour
   */
  async processHourlyBatch(options: ProcessOptions = {}): Promise<BatchResult> {
    const startTime = Date.now();
    const errors: Array<{ userId: string; error: string }> = [];
    let processed = 0;
    let failed = 0;

    try {
      // Use provided hour or current UTC hour
      const currentDate = options.currentDate || new Date();
      const currentUtcHour = options.currentUtcHour !== undefined 
        ? options.currentUtcHour 
        : currentDate.getUTCHours();
      
      console.log(`Starting daily message batch`, {
        utcHour: currentUtcHour,
        date: currentDate.toISOString(),
        testMode: options.testMode || false,
        dryRun: options.dryRun || false,
        userFilter: options.userFilter
      });

      // Get all users who should receive messages this hour
      let users = await this.getUsersForHour(currentUtcHour);
      
      // Apply user filter if provided
      if (options.userFilter && options.userFilter.length > 0) {
        users = users.filter(user => options.userFilter!.includes(user.id));
        console.log(`Filtered to ${users.length} users based on userFilter`);
      } else {
        console.log(`Found ${users.length} users to process`);
      }

      // Process users in batches
      const results = await this.processBatch(users, this.batchSize, options);
      
      // Tally results
      for (const result of results) {
        if (result.success) {
          processed++;
        } else {
          failed++;
          if (result.error) {
            errors.push({ userId: result.userId, error: result.error });
          }
        }
      }

      const duration = Date.now() - startTime;
      console.log(`Batch complete. Processed: ${processed}, Failed: ${failed}, Duration: ${duration}ms`);

      return {
        processed,
        failed,
        errors,
        duration
      };
    } catch (error) {
      console.error('Fatal error in processHourlyBatch:', error);
      throw error;
    }
  }

  /**
   * Gets all users whose local preferred hour matches the current UTC hour
   */
  private async getUsersForHour(currentUtcHour: number): Promise<UserWithProfile[]> {
    return await this.userRepository.findUsersForHour(currentUtcHour);
  }

  /**
   * Processes users in batches to avoid overwhelming the system
   */
  private async processBatch(
    users: UserWithProfile[], 
    batchSize: number,
    options: ProcessOptions = {}
  ): Promise<MessageResult[]> {
    const results: MessageResult[] = [];
    
    // Process users in chunks
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      const batchPromises = batch.map(user => this.sendDailyMessage(user, options));
      
      // Use allSettled to ensure we process all users even if some fail
      const batchResults = await Promise.allSettled(batchPromises);
      
      // Convert settled results to our MessageResult format
      batchResults.forEach((result, index) => {
        const user = batch[index];
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            success: false,
            userId: user.id,
            error: result.reason?.message || 'Unknown error'
          });
        }
      });
      
      // Small delay between batches to avoid rate limits (skip in test mode)
      if (i + batchSize < users.length && !options.testMode) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }

  /**
   * Sends a daily message to a single user
   */
  public async sendDailyMessage(
    user: UserWithProfile,
    optionsOrPreviousMessages?: ProcessOptions | Message[]
  ): Promise<MessageResult> {
    // Handle overloaded parameter - either ProcessOptions or Message[]
    let options: ProcessOptions = {};
    let previousMessages: Message[] | undefined;

    if (Array.isArray(optionsOrPreviousMessages)) {
      previousMessages = optionsOrPreviousMessages;
    } else if (optionsOrPreviousMessages) {
      options = optionsOrPreviousMessages;
    }
    try {
      console.log(`Processing daily message for user ${user.id}`, {
        dryRun: options.dryRun || false,
        testMode: options.testMode || false
      });

      // Get today's workout for the user (use test date if provided)
      const baseDate = options.currentDate || new Date();

      // If we have a test date, treat it as a calendar date in the user's timezone
      // Otherwise, use the current time in the user's timezone
      let targetDate: DateTime;
      if (options.currentDate) {
        // For test dates, interpret the date as being in the user's timezone
        const dateStr = baseDate.toISOString().split('T')[0]; // Get YYYY-MM-DD
        targetDate = DateTime.fromISO(dateStr, { zone: user.timezone }).startOf('day');
      } else {
        // For current date, convert current UTC time to user's timezone
        targetDate = DateTime.fromJSDate(baseDate).setZone(user.timezone).startOf('day');
      }
      
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

      // Send message using messageService (or dry-run preview)
      if (options.dryRun) {
        // Generate message for preview without sending
        const message = await generateDailyWorkoutMessage(user, workout, previousMessages);
        console.log(`[DRY RUN] Would send message to user ${user.id}:`, {
          phoneNumber: user.phoneNumber,
          messagePreview: message.substring(0, 100) + '...'
        });
        return {
          success: true,
          userId: user.id,
          messageText: message
        };
      } else {
        // Generate and send message
        const storedMessage = await this.messageService.sendWorkoutMessage(user, workout, previousMessages);
        console.log(`Successfully sent daily message to user ${user.id}`);
        return {
          success: true,
          userId: user.id,
          messageText: 'Message sent successfully',
          messageId: storedMessage.id
        };
      }
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
    const workout = await this.workoutRepository.findByClientIdAndDate(userId, date);
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
      // Get or create the current microcycle pattern
      const microcycle = await this.progressService.getCurrentOrCreateMicrocycle(user);
      
      if (!microcycle) {
        console.log(`Could not get/create microcycle for user ${user.id}`);
        return null;
      }

      // Get fitness plan and progress
      const plan = await this.fitnessPlanRepo.getCurrentPlan(user.id);
      if (!plan) {
        console.log(`No fitness plan found for user ${user.id}`);
        return null;
      }

      const progress = await this.progressService.getCurrentProgress(plan);
      if (!progress) {
        console.log(`No progress found for user ${user.id}`);
        return null;
      }

      // Get the day's pattern from the microcycle
      const dayOfWeek = targetDate.toFormat('EEEE').toUpperCase(); // MONDAY, TUESDAY, etc.
      const dayPattern = microcycle.pattern.days.find(d => d.day === dayOfWeek);
      
      if (!dayPattern) {
        console.log(`No pattern found for ${dayOfWeek} in microcycle ${microcycle.id}`);
        return null;
      }

      // Get recent workouts for context (last 7 days)
      const recentWorkouts = await this.workoutRepository.getRecentWorkouts(user.id, 7);

      // Use AI agent to generate sophisticated workout (now returns message too!)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { workout: enhancedWorkout, message, description, reasoning } = await generateDailyWorkout({
        user,
        date: targetDate.toJSDate(),
        dayPlan: dayPattern,
        microcycle,
        mesocycle: progress.mesocycle,
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
        sessionType: this.mapThemeToSessionType(dayPattern.theme),
        goal: `${dayPattern.theme}${dayPattern.notes ? ` - ${dayPattern.notes}` : ''}`,
        details: JSON.parse(JSON.stringify(enhancedWorkout)),
        description,
        reasoning,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save the workout to the database
      const savedWorkout = await this.workoutRepository.create(workout);
      console.log(`Generated and saved AI workout for user ${user.id} on ${targetDate.toISODate()}`);

      return savedWorkout;
    } catch (error) {
      console.error(`Error generating workout for user ${user.id}:`, error);
      throw error; // Propagate error to be handled upstream
    }
  }

  /**
   * Maps theme to session type for database storage
   */
  private mapThemeToSessionType(theme: string): string {
    const themeLower = theme.toLowerCase();
    // Valid types: strength, cardio, mobility, recovery, assessment, deload
    if (themeLower.includes('run') || themeLower.includes('cardio') || 
        themeLower.includes('hiit') || themeLower.includes('metcon') ||
        themeLower.includes('conditioning')) return 'cardio';
    if (themeLower.includes('lift') || themeLower.includes('strength') || 
        themeLower.includes('upper') || themeLower.includes('lower') ||
        themeLower.includes('push') || themeLower.includes('pull')) return 'strength';
    if (themeLower.includes('mobility') || themeLower.includes('flexibility') ||
        themeLower.includes('stretch')) return 'mobility';
    if (themeLower.includes('rest') || themeLower.includes('recovery')) return 'recovery';
    if (themeLower.includes('assessment') || themeLower.includes('test')) return 'assessment';
    if (themeLower.includes('deload')) return 'deload';
    // Default to strength for hybrid/unknown workouts
    return 'strength';
  }
}

// Export singleton instance
export const dailyMessageService = DailyMessageService.getInstance();