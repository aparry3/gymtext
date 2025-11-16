import { MicrocycleRepository } from '@/server/repositories/microcycleRepository';
import { postgresDb } from '@/server/connections/postgres/postgres';
import { UserService } from '../user/userService';
import { FitnessPlanService } from './fitnessPlanService';
import { now, startOfWeek, endOfWeek } from '@/shared/utils/date';
import { UserWithProfile, FitnessPlan } from '@/server/models';
import { Microcycle } from '@/server/models/microcycle';
import { createMicrocyclePatternAgent } from '@/server/agents/training/microcycles/chain';
import type { ProgressInfo } from './progressService';

export class MicrocycleService {
  private static instance: MicrocycleService;
  private microcycleRepo: MicrocycleRepository;
  private fitnessPlanService: FitnessPlanService;
  private userService: UserService;

  private constructor() {
    this.microcycleRepo = new MicrocycleRepository(postgresDb);
    this.fitnessPlanService = FitnessPlanService.getInstance();
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
   * Get microcycles by mesocycle index
   */
  public async getMicrocyclesByMesocycleIndex(userId: string, mesocycleIndex: number) {
    return await this.microcycleRepo.getMicrocyclesByMesocycleIndex(userId, mesocycleIndex);
  }

  /**
   * Get a specific microcycle by mesocycle index and week number
   */
  public async getMicrocycleByWeek(userId: string, mesocycleIndex: number, weekNumber: number) {
    // First get the fitness plan to get the fitnessPlanId
    const fitnessPlan = await this.fitnessPlanService.getCurrentPlan(userId);

    if (!fitnessPlan || !fitnessPlan.id) {
      return null;
    }

    return await this.microcycleRepo.getMicrocycleByWeek(
      userId,
      fitnessPlan.id,
      mesocycleIndex,
      weekNumber
    );
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
   * Update a microcycle's day overviews
   */
  public async updateMicrocycleDayOverviews(
    microcycleId: string,
    dayOverviews: Partial<{
      mondayOverview: string;
      tuesdayOverview: string;
      wednesdayOverview: string;
      thursdayOverview: string;
      fridayOverview: string;
      saturdayOverview: string;
      sundayOverview: string;
    }>
  ): Promise<void> {
    await this.microcycleRepo.updateMicrocycle(microcycleId, dayOverviews);
  }


  /**
   * Create a new microcycle from progress information
   * This method takes pre-calculated progress and creates the microcycle in the database
   */
  public async createMicrocycleFromProgress(
    userId: string,
    fitnessPlanId: string,
    progress: ProgressInfo
  ): Promise<Microcycle> {
    // Microcycle overview must exist to create a microcycle
    if (!progress.microcycleOverview) {
      throw new Error(`No microcycle overview found for mesocycle ${progress.mesocycleIndex}, microcycle ${progress.microcycleIndex}`);
    }

    // Generate new day overviews, description, formatted markdown, isDeload flag, and message for the week using AI agent
    const { dayOverviews, description, formatted, isDeload, message } = await this.generateMicrocyclePattern(
      progress.microcycleOverview,
      progress.absoluteWeek
    );

    // Create new microcycle with pre-generated long-form content, formatted markdown, and message
    const microcycle = await this.microcycleRepo.createMicrocycle({
      userId,
      fitnessPlanId,
      mesocycleIndex: progress.mesocycleIndex,
      weekNumber: progress.microcycleIndex,
      mondayOverview: dayOverviews.mondayOverview,
      tuesdayOverview: dayOverviews.tuesdayOverview,
      wednesdayOverview: dayOverviews.wednesdayOverview,
      thursdayOverview: dayOverviews.thursdayOverview,
      fridayOverview: dayOverviews.fridayOverview,
      saturdayOverview: dayOverviews.saturdayOverview,
      sundayOverview: dayOverviews.sundayOverview,
      description,
      isDeload,
      formatted,
      message,
      startDate: progress.weekStartDate,
      endDate: progress.weekEndDate,
      isActive: false, // No longer using isActive flag - we query by dates instead
    });

    console.log(`Created new microcycle for user ${userId}, mesocycle ${progress.mesocycleIndex}, week ${progress.microcycleIndex} (${progress.weekStartDate.toISOString()} - ${progress.weekEndDate.toISOString()})`);
    return microcycle;
  }

  /**
   * Generate a microcycle day overviews, description, formatted markdown, isDeload flag, and message using AI agent
   * Uses the specific microcycle overview from the mesocycle's microcycles array
   */
  private async generateMicrocyclePattern(
    microcycleOverview: string,
    weekNumber: number
  ): Promise<{
    dayOverviews: {
      mondayOverview: string;
      tuesdayOverview: string;
      wednesdayOverview: string;
      thursdayOverview: string;
      fridayOverview: string;
      saturdayOverview: string;
      sundayOverview: string;
    };
    description: string;
    isDeload: boolean;
    formatted: string;
    message: string
  }> {
    try {
      // Use AI agent to generate day overviews, long-form description, formatted markdown, and message
      const agent = createMicrocyclePatternAgent();
      const result = await agent.invoke({
        microcycleOverview,
        weekNumber
      });

      console.log(`Generated AI day overviews, description, formatted markdown, isDeload=${result.isDeload}, and message for week ${weekNumber}`);
      return result;
    } catch (error) {
      console.error('Failed to generate day overviews with AI agent:', error);
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
}

// Export singleton instance
export const microcycleService = MicrocycleService.getInstance();