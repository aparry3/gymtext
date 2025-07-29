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
  async processHourlyBatch(): Promise<BatchResult> {
    const startTime = Date.now();
    const errors: Array<{ userId: string; error: string }> = [];
    let processed = 0;
    let failed = 0;

    try {
      const currentUtcHour = new Date().getUTCHours();
      console.log(`Starting daily message batch for UTC hour: ${currentUtcHour}`);

      // Get all users who should receive messages this hour
      const users = await this.getUsersForHour(currentUtcHour);
      console.log(`Found ${users.length} users to process`);

      // Process users in batches
      const results = await this.processBatch(users, this.batchSize);
      
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
  private async processBatch(users: UserWithProfile[], batchSize: number): Promise<MessageResult[]> {
    const results: MessageResult[] = [];
    
    // Process users in chunks
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      const batchPromises = batch.map(user => this.sendDailyMessage(user));
      
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
      
      // Small delay between batches to avoid rate limits
      if (i + batchSize < users.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }

  /**
   * Sends a daily message to a single user
   */
  private async sendDailyMessage(user: UserWithProfile): Promise<MessageResult> {
    try {
      console.log(`Processing daily message for user ${user.id}`);

      // Get today's workout for the user
      const today = DateTime.now().setZone(user.timezone).startOf('day').toJSDate();
      const workout = await this.getTodaysWorkout(user.id, today);

      if (!workout) {
        console.log(`No workout found for user ${user.id} on ${today.toISOString()}`);
        return {
          success: false,
          userId: user.id,
          error: 'No workout scheduled for today'
        };
      }

      // Build and send the message
      const message = await this.messageService.buildDailyMessage(user, workout);
      await this.messageService.sendMessage(user, message);

      console.log(`Successfully sent daily message to user ${user.id}`);
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
    // Get workouts for the specific date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // This assumes we have a method to find workouts by date range
    // You may need to add this to WorkoutInstanceRepository
    const workouts = await this.workoutRepository.findByClientIdAndDateRange(
      userId,
      startOfDay,
      endOfDay
    );

    return workouts.length > 0 ? workouts[0] : null;
  }

  /**
   * Manually trigger daily messages for testing
   * Only processes a single user
   */
  async sendTestMessage(userId: string): Promise<MessageResult> {
    const user = await this.userRepository.findWithProfile(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    return await this.sendDailyMessage(user);
  }
}