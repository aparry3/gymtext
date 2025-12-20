import { MicrocycleRepository } from '@/server/repositories/microcycleRepository';
import { postgresDb } from '@/server/connections/postgres/postgres';
import { now, startOfWeek, endOfWeek } from '@/shared/utils/date';
import { Microcycle, type MicrocycleStructure } from '@/server/models/microcycle';
import { FitnessPlan } from '@/server/models/fitnessPlan';
import { microcycleAgentService } from '@/server/services/agents/training';
import type { UserWithProfile } from '@/server/models/user';
import type { ProgressInfo } from './progressService';
import { UserService } from '../user/userService';

/**
 * Simplified MicrocycleService
 *
 * Creates and manages microcycles. Now works directly with fitness plan text
 * instead of mesocycle overviews. Uses absoluteWeek and days array.
 */
export class MicrocycleService {
  private static instance: MicrocycleService;
  private microcycleRepo: MicrocycleRepository;
  private userService: UserService;

  private constructor() {
    this.microcycleRepo = new MicrocycleRepository(postgresDb);
    this.userService = UserService.getInstance();
  }

  public static getInstance(): MicrocycleService {
    if (!MicrocycleService.instance) {
      MicrocycleService.instance = new MicrocycleService();
    }
    return MicrocycleService.instance;
  }

  /**
   * Get the active microcycle for a client (the one flagged as active in DB)
   */
  public async getActiveMicrocycle(clientId: string) {
    return await this.microcycleRepo.getActiveMicrocycle(clientId);
  }

  /**
   * Check if the active microcycle encompasses the current week in the client's timezone
   */
  public async isActiveMicrocycleCurrent(clientId: string, timezone: string = 'America/New_York'): Promise<boolean> {
    const activeMicrocycle = await this.microcycleRepo.getActiveMicrocycle(clientId);
    if (!activeMicrocycle) {
      return false;
    }

    const { startDate: currentWeekStart } = this.calculateWeekDates(timezone);
    const normalizedCurrentWeekStart = new Date(currentWeekStart);
    normalizedCurrentWeekStart.setHours(0, 0, 0, 0);

    const activeMicrocycleStart = new Date(activeMicrocycle.startDate);
    activeMicrocycleStart.setHours(0, 0, 0, 0);

    const activeMicrocycleEnd = new Date(activeMicrocycle.endDate);
    activeMicrocycleEnd.setHours(0, 0, 0, 0);

    // Check if current week falls within active microcycle's date range
    return normalizedCurrentWeekStart >= activeMicrocycleStart && normalizedCurrentWeekStart <= activeMicrocycleEnd;
  }

  /**
   * Get all microcycles for a client
   */
  public async getAllMicrocycles(clientId: string) {
    return await this.microcycleRepo.getAllMicrocycles(clientId);
  }

  /**
   * Get microcycle by absolute week number
   * Queries by clientId + absoluteWeek only (not fitnessPlanId)
   */
  public async getMicrocycleByAbsoluteWeek(
    clientId: string,
    absoluteWeek: number
  ): Promise<Microcycle | null> {
    return await this.microcycleRepo.getMicrocycleByAbsoluteWeek(clientId, absoluteWeek);
  }

  /**
   * Get microcycle for a specific date
   * Used for date-based progress tracking - finds the microcycle that contains the target date
   * Queries by clientId + date range only (not fitnessPlanId)
   */
  public async getMicrocycleByDate(
    clientId: string,
    targetDate: Date
  ): Promise<Microcycle | null> {
    return await this.microcycleRepo.getMicrocycleByDate(clientId, targetDate);
  }

  /**
   * Get a microcycle by ID
   */
  public async getMicrocycleById(microcycleId: string): Promise<Microcycle | null> {
    return await this.microcycleRepo.getMicrocycleById(microcycleId);
  }

  /**
   * Update a microcycle's days array
   */
  public async updateMicrocycleDays(
    microcycleId: string,
    days: string[]
  ): Promise<Microcycle | null> {
    return await this.microcycleRepo.updateMicrocycle(microcycleId, { days });
  }

  /**
   * Update a microcycle
   */
  public async updateMicrocycle(
    microcycleId: string,
    microcycle: Partial<Microcycle>
  ): Promise<Microcycle | null> {
    return await this.microcycleRepo.updateMicrocycle(microcycleId, microcycle);
  }

  /**
   * Create a new microcycle from progress information
   * Uses fitness plan text and user profile to generate the week
   */
  public async createMicrocycleFromProgress(
    clientId: string,
    plan: FitnessPlan,
    progress: ProgressInfo
  ): Promise<Microcycle> {
    // Get user profile for context
    const user = await this.userService.getUser(clientId);
    if (!user) {
      throw new Error(`Client not found: ${clientId}`);
    }

    // Generate microcycle using AI agent service
    const { days, description, isDeload, message, structure } = await this.generateMicrocyclePattern(
      user,
      plan.description,
      progress.absoluteWeek,
      progress.isDeload  // Pass the calculated isDeload from progress
    );

    // Create new microcycle
    const microcycle = await this.microcycleRepo.createMicrocycle({
      clientId,
      absoluteWeek: progress.absoluteWeek,
      days,
      description,
      isDeload,
      message,
      structured: structure,
      startDate: progress.weekStartDate,
      endDate: progress.weekEndDate,
      isActive: false, // No longer using isActive flag - we query by dates instead
    });

    console.log(`[MicrocycleService] Created microcycle for client ${clientId}, week ${progress.absoluteWeek} (${progress.weekStartDate.toISOString()} - ${progress.weekEndDate.toISOString()})`);
    return microcycle;
  }

  /**
   * Generate a microcycle using AI agent service
   * Uses fitness plan text and user profile to generate day descriptions
   */
  private async generateMicrocyclePattern(
    user: UserWithProfile,
    planText: string,
    absoluteWeek: number,
    isDeloadFromProgress: boolean
  ): Promise<{
    days: string[];
    description: string;
    isDeload: boolean;
    message: string;
    structure?: MicrocycleStructure;
  }> {
    try {
      // Use AI agent service to generate the microcycle
      const result = await microcycleAgentService.generateMicrocycle(
        user,
        planText,
        absoluteWeek,
        isDeloadFromProgress
      );

      console.log(`[MicrocycleService] Generated microcycle for week ${absoluteWeek}, isDeload=${result.isDeload}`);
      return result;
    } catch (error) {
      console.error('[MicrocycleService] Failed to generate microcycle:', error);
      throw error;
    }
  }

  /**
   * Calculate week dates in a specific timezone
   */
  private calculateWeekDates(timezone: string = 'America/New_York'): { startDate: Date; endDate: Date } {
    const currentDate = now(timezone).toJSDate();

    return {
      startDate: startOfWeek(currentDate, timezone),
      endDate: endOfWeek(currentDate, timezone),
    };
  }

  /**
   * Delete a microcycle and all associated workouts
   * Returns the count of deleted workouts along with success status
   */
  public async deleteMicrocycleWithWorkouts(
    microcycleId: string
  ): Promise<{ deleted: boolean; deletedWorkoutsCount: number }> {
    // First, get the microcycle to verify it exists and get clientId
    const microcycle = await this.microcycleRepo.getMicrocycleById(microcycleId);

    if (!microcycle) {
      return { deleted: false, deletedWorkoutsCount: 0 };
    }

    // Import workoutInstanceService dynamically to avoid circular dependency
    const { workoutInstanceService } = await import('./workoutInstanceService');

    // Get all workouts for this microcycle
    const workouts = await workoutInstanceService.getWorkoutsByMicrocycle(
      microcycle.clientId,
      microcycleId
    );

    // Delete all associated workouts first
    let deletedWorkoutsCount = 0;
    for (const workout of workouts) {
      const deleted = await workoutInstanceService.deleteWorkout(workout.id, microcycle.clientId);
      if (deleted) {
        deletedWorkoutsCount++;
      }
    }

    // Then delete the microcycle
    const deleted = await this.microcycleRepo.deleteMicrocycle(microcycleId);

    return { deleted, deletedWorkoutsCount };
  }
}

// Export singleton instance
export const microcycleService = MicrocycleService.getInstance();
