import { WorkoutInstanceRepository } from '@/server/repositories/workoutInstanceRepository';
import { postgresDb } from '@/server/connections/postgres/postgres';
import { createWorkoutGenerateAgent } from '@/server/agents/training/workouts';
import type { WorkoutInstanceUpdate, NewWorkoutInstance, WorkoutInstance } from '@/server/models/workout';
import type { UserWithProfile } from '@/server/models/userModel';
import type { Microcycle } from '@/server/models/microcycle';
import { FitnessPlanService } from './fitnessPlanService';
import { ProgressService } from './progressService';
import { MicrocycleService } from './microcycleService';
import { shortLinkService } from '../links/shortLinkService';
import { DateTime } from 'luxon';
import { getWeekday, getDayOfWeekName } from '@/shared/utils/date';

export class WorkoutInstanceService {
  private static instance: WorkoutInstanceService;
  private workoutRepo: WorkoutInstanceRepository;
  private fitnessPlanService: FitnessPlanService;
  private progressService: ProgressService;
  private microcycleService: MicrocycleService;

  private constructor() {
    this.workoutRepo = new WorkoutInstanceRepository(postgresDb);
    this.fitnessPlanService = FitnessPlanService.getInstance();
    this.progressService = ProgressService.getInstance();
    this.microcycleService = MicrocycleService.getInstance();
  }

  public static getInstance(): WorkoutInstanceService {
    if (!WorkoutInstanceService.instance) {
      WorkoutInstanceService.instance = new WorkoutInstanceService();
    }
    return WorkoutInstanceService.instance;
  }

  /**
   * Get recent workouts for a user
   */
  public async getRecentWorkouts(userId: string, limit: number = 10) {
    return await this.workoutRepo.getRecentWorkouts(userId, limit);
  }

  /**
   * Get workouts by date range
   */
  public async getWorkoutsByDateRange(userId: string, startDate: Date, endDate: Date) {
    return await this.workoutRepo.getWorkoutsByDateRange(userId, startDate, endDate);
  }

  /**
   * Get a specific workout by ID and verify it belongs to the user
   */
  public async getWorkoutById(workoutId: string, userId: string) {
    const workout = await this.workoutRepo.getWorkoutById(workoutId);

    if (!workout || workout.clientId !== userId) {
      return null;
    }

    return workout;
  }

  /**
   * Get a workout by ID without authorization check
   * For internal service-to-service use only
   */
  public async getWorkoutByIdInternal(workoutId: string): Promise<WorkoutInstance | undefined> {
    return await this.workoutRepo.getWorkoutById(workoutId);
  }

  /**
   * Get a workout by user ID and date
   */
  public async getWorkoutByUserIdAndDate(userId: string, date: Date) {
    return await this.workoutRepo.findByClientIdAndDate(userId, date);
  }

  /**
   * Update the message for a workout
   */
  public async updateWorkoutMessage(workoutId: string, message: string) {
    return await this.workoutRepo.update(workoutId, { message });
  }

  /**
   * Create a new workout instance
   */
  public async createWorkout(workout: NewWorkoutInstance) {
    return await this.workoutRepo.create(workout);
  }

  /**
   * Update a workout with new details, description, reasoning, and message
   */
  public async updateWorkout(workoutId: string, updates: WorkoutInstanceUpdate) {
    return await this.workoutRepo.update(workoutId, updates);
  }

  /**
   * Generate a workout for a specific date using AI
   *
   * This is the core business logic for workout generation:
   * 1. Gets user's fitness plan and current progress
   * 2. Determines day pattern from microcycle
   * 3. Generates workout using AI agent
   * 4. Saves workout with pre-generated message
   * 5. Creates short link and appends to message
   *
   * @param user - User with profile
   * @param targetDate - Date to generate workout for
   * @param providedMicrocycle - Optional pre-loaded microcycle (avoids extra DB query)
   * @returns Generated and saved workout instance
   */
  public async generateWorkoutForDate(
    user: UserWithProfile,
    targetDate: DateTime,
    providedMicrocycle?: Microcycle
  ): Promise<WorkoutInstance | null> {
    try {
      // Get fitness plan
      const plan = await this.fitnessPlanService.getCurrentPlan(user.id);
      if (!plan) {
        console.log(`No fitness plan found for user ${user.id}`);
        return null;
      }

      // Get current progress for the target date
      const progress = await this.progressService.getProgressForDate(plan, targetDate.toJSDate(), user.timezone);
      if (!progress) {
        console.log(`No progress found for user ${user.id} on ${targetDate.toISODate()}`);
        return null;
      }

      // Use provided microcycle or get/create one for the target date
      let microcycle: Microcycle | null = providedMicrocycle ?? null;
      if (!microcycle) {
        const result = await this.progressService.getOrCreateMicrocycleForDate(
          user.id,
          plan,
          targetDate.toJSDate(),
          user.timezone
        );
        microcycle = result.microcycle;
      }
      if (!microcycle) {
        console.log(`Could not get/create microcycle for user ${user.id}`);
        return null;
      }

      // Get the day's overview from the microcycle
      // getWeekday returns 1-7 (Mon-Sun), days array is 0-indexed (Mon=0, Sun=6)
      const dayIndex = getWeekday(targetDate.toJSDate(), user.timezone) - 1;
      const dayOverview = microcycle.days?.[dayIndex];

      if (!dayOverview || typeof dayOverview !== 'string') {
        console.log(`No overview found for day index ${dayIndex} in microcycle ${microcycle.id}`);
        return null;
      }

      // Get recent workouts for context (last 7 days)
      // const recentWorkouts = await this.getRecentWorkouts(user.id, 7);

      // Use AI agent to generate workout with message
      const { response: description, formatted, message, structure } = await createWorkoutGenerateAgent().invoke({
        user,
        date: targetDate.toJSDate(),
        dayOverview, // Pass the string overview instead of pattern object
        isDeload: microcycle.isDeload,
      });

      // Extract theme from markdown title (first # line) or use default
      const themeMatch = formatted.match(/^#\s+(.+)$/m);
      const theme = themeMatch ? themeMatch[1].trim() : 'Workout';

      const details = {
        formatted,  // Store the formatted markdown text
        theme,                         // Keep theme for quick access
      };

      // Convert to database format
      const workout: NewWorkoutInstance = {
        clientId: user.id,
        microcycleId: microcycle.id,
        date: targetDate.toJSDate(),
        sessionType: 'workout', // Use generic session type since we don't have theme from day overview
        goal: dayOverview.substring(0, 100), // Use first 100 chars of overview as goal
        details: JSON.parse(JSON.stringify(details)),
        description,
        message,
        structured: structure,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save the workout to the database
      const savedWorkout = await this.createWorkout(workout);
      console.log(`Generated and saved workout for user ${user.id} on ${targetDate.toISODate()}`);

      // Generate short link for the workout
      try {
        const shortLink = await shortLinkService.createWorkoutLink(user.id, savedWorkout.id);
        const fullUrl = shortLinkService.getFullUrl(shortLink.code);
        console.log(`Created short link for workout ${savedWorkout.id}: ${fullUrl}`);

        // Append short link to message
        if (savedWorkout.message) {
          const dayOfWeekTitle = getDayOfWeekName(targetDate.toJSDate(), user.timezone); // Monday, Tuesday, etc.
          savedWorkout.message = `${dayOfWeekTitle}\n\n${savedWorkout.message}\n\n\(More details: ${fullUrl}\)`;
          await this.updateWorkoutMessage(savedWorkout.id, savedWorkout.message);
        }
      } catch (error) {
        console.error(`Failed to create short link for workout ${savedWorkout.id}:`, error);
        // Continue without link - not critical
      }

      return savedWorkout;
    } catch (error) {
      console.error(`Error generating workout for user ${user.id}:`, error);
      throw error;
    }
  }

  /**
   * Maps theme to session type for database storage
   * Valid frontend types: run, lift, metcon, mobility, rest, other
   */
  private mapThemeToSessionType(theme: string): string {
    const themeLower = theme.toLowerCase();

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

    return 'other';
  }

  /**
   * Delete a workout instance
   */
  public async deleteWorkout(workoutId: string, userId: string): Promise<boolean> {
    // First verify the workout belongs to the user
    const workout = await this.workoutRepo.getWorkoutById(workoutId);

    if (!workout || workout.clientId !== userId) {
      return false;
    }

    // Delete the workout
    return await this.workoutRepo.delete(workoutId);
  }

  /**
   * Get workouts by microcycle ID
   */
  public async getWorkoutsByMicrocycle(userId: string, microcycleId: string): Promise<WorkoutInstance[]> {
    return await this.workoutRepo.getWorkoutsByMicrocycle(userId, microcycleId);
  }
}

// Export singleton instance
export const workoutInstanceService = WorkoutInstanceService.getInstance();