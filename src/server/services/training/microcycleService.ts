import { MicrocycleRepository } from '@/server/repositories/microcycleRepository';
import { postgresDb } from '@/server/connections/postgres/postgres';
import { now, startOfWeek, endOfWeek } from '@/shared/utils/date';
import { Microcycle } from '@/server/models/microcycle';
import { FitnessPlan } from '@/server/models/fitnessPlan';
import { createMicrocycleAgent } from '@/server/agents/training/microcycles/chain';
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
   * Get the active microcycle for a user (the one flagged as active in DB)
   */
  public async getActiveMicrocycle(userId: string) {
    return await this.microcycleRepo.getActiveMicrocycle(userId);
  }

  /**
   * Check if the active microcycle encompasses the current week in the user's timezone
   */
  public async isActiveMicrocycleCurrent(userId: string, timezone: string = 'America/New_York'): Promise<boolean> {
    const activeMicrocycle = await this.microcycleRepo.getActiveMicrocycle(userId);
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
   * Get all microcycles for a user
   */
  public async getAllMicrocycles(userId: string) {
    return await this.microcycleRepo.getAllMicrocycles(userId);
  }

  /**
   * Get microcycle by absolute week number
   */
  public async getMicrocycleByAbsoluteWeek(
    userId: string,
    fitnessPlanId: string,
    absoluteWeek: number
  ): Promise<Microcycle | null> {
    return await this.microcycleRepo.getMicrocycleByAbsoluteWeek(userId, fitnessPlanId, absoluteWeek);
  }

  /**
   * Get microcycle for a specific date
   * Used for date-based progress tracking - finds the microcycle that contains the target date
   */
  public async getMicrocycleByDate(
    userId: string,
    fitnessPlanId: string,
    targetDate: Date
  ): Promise<Microcycle | null> {
    return await this.microcycleRepo.getMicrocycleByDate(userId, fitnessPlanId, targetDate);
  }

  /**
   * Update a microcycle's days array
   */
  public async updateMicrocycleDays(
    microcycleId: string,
    days: string[]
  ): Promise<void> {
    await this.microcycleRepo.updateMicrocycle(microcycleId, { days });
  }

  /**
   * Update a microcycle
   */
  public async updateMicrocycle(
    microcycleId: string,
    microcycle: Partial<Microcycle>
  ): Promise<void> {
    await this.microcycleRepo.updateMicrocycle(microcycleId, microcycle);
  }

  /**
   * Create a new microcycle from progress information
   * Uses fitness plan text and user profile to generate the week
   */
  public async createMicrocycleFromProgress(
    userId: string,
    plan: FitnessPlan,
    progress: ProgressInfo
  ): Promise<Microcycle> {
    // Get user profile for context
    const user = await this.userService.getUser(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    // Generate microcycle using AI agent with plan text + user profile + week number
    const { days, description, formatted, isDeload, message } = await this.generateMicrocyclePattern(
      plan.description,
      user.profile || '',
      progress.absoluteWeek,
      progress.isDeload  // Pass the calculated isDeload from progress
    );

    // Create new microcycle
    const microcycle = await this.microcycleRepo.createMicrocycle({
      userId,
      fitnessPlanId: plan.id!,
      absoluteWeek: progress.absoluteWeek,
      days,
      description,
      isDeload,
      formatted,
      message,
      startDate: progress.weekStartDate,
      endDate: progress.weekEndDate,
      isActive: false, // No longer using isActive flag - we query by dates instead
    });

    console.log(`[MicrocycleService] Created microcycle for user ${userId}, week ${progress.absoluteWeek} (${progress.weekStartDate.toISOString()} - ${progress.weekEndDate.toISOString()})`);
    return microcycle;
  }

  /**
   * Generate a microcycle using AI agent
   * Uses fitness plan text and user profile to generate day descriptions
   */
  private async generateMicrocyclePattern(
    planText: string,
    userProfile: string,
    absoluteWeek: number,
    isDeloadFromProgress: boolean
  ): Promise<{
    days: string[];
    description: string;
    isDeload: boolean;
    formatted: string;
    message: string;
  }> {
    try {
      // Use AI agent to generate the microcycle
      const agent = createMicrocycleAgent();
      const result = await agent.invoke({
        planText,
        userProfile,
        absoluteWeek,
        isDeload: isDeloadFromProgress,
      });

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
   * Get all microcycles for a fitness plan
   */
  public async getMicrocyclesByPlanId(fitnessPlanId: string): Promise<Microcycle[]> {
    return await this.microcycleRepo.getMicrocyclesByPlanId(fitnessPlanId);
  }
}

// Export singleton instance
export const microcycleService = MicrocycleService.getInstance();
