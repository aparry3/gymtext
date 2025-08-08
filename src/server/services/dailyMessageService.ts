import { UserRepository } from '@/server/repositories/userRepository';
import { WorkoutInstanceRepository } from '@/server/repositories/workoutInstanceRepository';
import { MessageService } from './messageService';
import { UserWithProfile } from '@/server/models/userModel';
import { WorkoutInstance } from '@/server/models/workout';
import { DateTime } from 'luxon';

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
}

export interface ProcessOptions {
  currentUtcHour?: number;
  currentDate?: Date;
  userFilter?: string[];
  dryRun?: boolean;
  testMode?: boolean;
}

export class DailyMessageService {
  private userRepository: UserRepository;
  private workoutRepository: WorkoutInstanceRepository;
  private messageService: MessageService;
  private batchSize: number;

  constructor(
    userRepository: UserRepository,
    workoutRepository: WorkoutInstanceRepository,
    messageService: MessageService,
    batchSize: number = 10
  ) {
    this.userRepository = userRepository;
    this.workoutRepository = workoutRepository;
    this.messageService = messageService;
    this.batchSize = batchSize;
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
  private async sendDailyMessage(
    user: UserWithProfile,
    options: ProcessOptions = {}
  ): Promise<MessageResult> {
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
      
      const workout = await this.getTodaysWorkout(user.id, targetDate.toJSDate());

      if (!workout) {
        console.log(`No workout found for user ${user.id} on ${targetDate.toISODate()}`);
        return {
          success: false,
          userId: user.id,
          error: 'No workout scheduled for today'
        };
      }

      // Build the message
      const message = await this.messageService.buildDailyMessage(user, workout);
      
      // Only send if not in dry-run mode
      if (options.dryRun) {
        console.log(`[DRY RUN] Would send message to user ${user.id}:`, {
          phoneNumber: user.phoneNumber,
          messagePreview: message.substring(0, 100) + '...'
        });
      } else {
        await this.messageService.sendMessage(user, message);
        console.log(`Successfully sent daily message to user ${user.id}`);
      }

      return {
        success: true,
        userId: user.id
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
    // The date passed in is midnight in the user's timezone (as a JS Date in UTC)
    // We need to create a date string for the actual calendar date
    const dateOnly = date.toISOString().split('T')[0]; // Gets YYYY-MM-DD
    const queryDate = new Date(dateOnly); // Creates date at midnight UTC
    
    const workout = await this.workoutRepository.findByClientIdAndDate(userId, queryDate);
    return workout || null;
  }

  /**
   * Manually trigger daily messages for testing
   * Only processes a single user
   */
  async sendTestMessage(userId: string, options: ProcessOptions = {}): Promise<MessageResult> {
    const user = await this.userRepository.findWithProfile(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    return await this.sendDailyMessage(user, options);
  }
}