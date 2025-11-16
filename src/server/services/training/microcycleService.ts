import { MicrocycleRepository } from '@/server/repositories/microcycleRepository';
import { postgresDb } from '@/server/connections/postgres/postgres';
import { UserService } from '../user/userService';
import { FitnessPlanService } from './fitnessPlanService';
import { ProgressService } from './progressService';
import { now, startOfWeek, endOfWeek } from '@/shared/utils/date';
import { UserWithProfile, FitnessPlan } from '@/server/models';
import { Microcycle } from '@/server/models/microcycle';
import { createMicrocyclePatternAgent } from '@/server/agents/training/microcycles/chain';

export class MicrocycleService {
  private static instance: MicrocycleService;
  private microcycleRepo: MicrocycleRepository;
  private fitnessPlanService: FitnessPlanService;
  private progressService: ProgressService;
  private userService: UserService;

  private constructor() {
    this.microcycleRepo = new MicrocycleRepository(postgresDb);
    this.fitnessPlanService = FitnessPlanService.getInstance();
    this.progressService = ProgressService.getInstance();
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
   * Get or create microcycle for a specific date (date-based approach)
   * This is the main entry point for ensuring a user has a microcycle for any given week
   */
  public async getOrCreateMicrocycleForDate(
    userId: string,
    plan: FitnessPlan,
    targetDate: Date,
    timezone: string = 'America/New_York'
  ): Promise<{ microcycle: Microcycle; wasCreated: boolean }> {
    // Calculate progress for the target date
    const progress = this.progressService.getProgressForDate(plan, targetDate, timezone);
    if (!progress) {
      throw new Error(`Could not calculate progress for date ${targetDate}`);
    }

    // Check if microcycle exists for this date
    let microcycle = await this.microcycleRepo.getMicrocycleByDate(
      userId,
      plan.id!,
      targetDate
    );

    if (microcycle) {
      return { microcycle, wasCreated: false };
    }

    // Generate new day overviews, description, isDeload flag, and message for the week using AI agent
    const { dayOverviews, description, isDeload, message } = await this.generateMicrocyclePattern(
      plan,
      progress.absoluteWeek
    );

    // Create new microcycle with pre-generated long-form content and message
    microcycle = await this.microcycleRepo.createMicrocycle({
      userId,
      fitnessPlanId: plan.id!,
      mesocycleIndex: progress.mesocycleIndex,
      weekNumber: progress.microcycleWeek,
      mondayOverview: dayOverviews.mondayOverview,
      tuesdayOverview: dayOverviews.tuesdayOverview,
      wednesdayOverview: dayOverviews.wednesdayOverview,
      thursdayOverview: dayOverviews.thursdayOverview,
      fridayOverview: dayOverviews.fridayOverview,
      saturdayOverview: dayOverviews.saturdayOverview,
      sundayOverview: dayOverviews.sundayOverview,
      description,
      isDeload,
      message,
      startDate: progress.weekStartDate,
      endDate: progress.weekEndDate,
      isActive: false, // No longer using isActive flag - we query by dates instead
    });

    console.log(`Created new microcycle for user ${userId}, week ${progress.microcycleWeek} (${progress.weekStartDate.toISOString()} - ${progress.weekEndDate.toISOString()})`);
    return { microcycle, wasCreated: true };
  }

  /**
   * Get or create the active microcycle for a user (current week)
   * This is a convenience wrapper around getOrCreateMicrocycleForDate
   */
  public async getOrCreateActiveMicrocycle(
    user: UserWithProfile,
    plan: FitnessPlan
  ): Promise<{ microcycle: Microcycle; wasCreated: boolean }> {
    const currentDate = now(user.timezone).toJSDate();
    return this.getOrCreateMicrocycleForDate(user.id, plan, currentDate, user.timezone);
  }

  /**
   * Generate a microcycle day overviews, description, isDeload flag, and message using AI agent
   */
  private async generateMicrocyclePattern(
    fitnessPlan: FitnessPlan,
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
    message: string
  }> {
    try {
      if (!fitnessPlan.description) {
        throw new Error('Fitness plan description is required');
      }

      // Use AI agent to generate day overviews, long-form description, and message
      const agent = createMicrocyclePatternAgent();
      const result = await agent.invoke({
        fitnessPlan: fitnessPlan.description,
        weekNumber
      });

      console.log(`Generated AI day overviews, description, isDeload=${result.isDeload}, and message for week ${weekNumber}`);
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