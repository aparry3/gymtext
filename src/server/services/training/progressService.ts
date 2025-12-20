import { FitnessPlan } from '../../models/fitnessPlan';
import { Microcycle } from '../../models/microcycle';
import {
  parseDate,
  now,
  startOfWeek,
  endOfWeek,
  diffInWeeks,
  getWeekday,
} from '@/shared/utils/date';
import { MicrocycleService } from './microcycleService';

/**
 * Simplified ProgressInfo without mesocycle layer
 */
export interface ProgressInfo {
  fitnessPlan: FitnessPlan;
  microcycle: Microcycle | null;
  absoluteWeek: number;          // Weeks since plan start (1-indexed)
  dayOfWeek: number;             // Day of week (1-7, Luxon format: 1=Mon, 7=Sun)
  weekStartDate: Date;           // Start of current week
  weekEndDate: Date;             // End of current week
}

/**
 * Simplified ProgressService
 *
 * Calculates progress based on plan start date and absolute week number.
 * No mesocycle layer - deload logic is derived from plan description.
 */
export class ProgressService {
  private static instance: ProgressService;
  private microcycleService: MicrocycleService;

  private constructor() {
    this.microcycleService = MicrocycleService.getInstance();
  }

  public static getInstance(): ProgressService {
    if (!ProgressService.instance) {
      ProgressService.instance = new ProgressService();
    }
    return ProgressService.instance;
  }

  /**
   * Calculate progress for a specific date based on the fitness plan
   * Uses absolute week number from plan start - no mesocycle lookup needed
   */
  public async getProgressForDate(
    plan: FitnessPlan,
    targetDate: Date,
    timezone: string = 'America/New_York'
  ): Promise<ProgressInfo | null> {
    if (!plan || !plan.id) {
      return null;
    }

    // Parse the plan start date
    const planStartDate = parseDate(plan.startDate);
    if (!planStartDate) {
      return null;
    }

    // Calculate absolute week number since plan start (1-indexed)
    const planStart = startOfWeek(planStartDate, timezone);
    const targetWeekStart = startOfWeek(targetDate, timezone);
    const absoluteWeek = diffInWeeks(targetWeekStart, planStart, timezone) + 1;

    // If before plan start, return null
    if (absoluteWeek < 1) {
      return null;
    }

    // Query for existing microcycle by date or absolute week
    // Note: queries by clientId only, not fitnessPlanId, to handle plan modifications
    let microcycle = await this.microcycleService.getMicrocycleByDate(
      plan.clientId,
      targetDate
    );

    // If not found by date, try by absolute week
    if (!microcycle) {
      microcycle = await this.microcycleService.getMicrocycleByAbsoluteWeek(
        plan.clientId,
        absoluteWeek
      );
    }

    // Calculate date-related fields
    const dayOfWeek = getWeekday(targetDate, timezone);
    const weekStart = startOfWeek(targetDate, timezone);
    const weekEnd = endOfWeek(targetDate, timezone);

    return {
      fitnessPlan: plan,
      microcycle,
      absoluteWeek,
      dayOfWeek,
      weekStartDate: weekStart,
      weekEndDate: weekEnd,
    };
  }

  /**
   * Get progress for the current date in the user's timezone
   */
  public async getCurrentProgress(
    plan: FitnessPlan,
    timezone: string = 'America/New_York'
  ): Promise<ProgressInfo | null> {
    const currentDate = now(timezone).toJSDate();
    return await this.getProgressForDate(plan, currentDate, timezone);
  }

  /**
   * Get or create microcycle for a specific date
   * This is the main entry point for ensuring a user has a microcycle for any given week
   *
   * @param forceCreate - When true, always creates new microcycle (for re-onboarding)
   */
  public async getOrCreateMicrocycleForDate(
    userId: string,
    plan: FitnessPlan,
    targetDate: Date,
    timezone: string = 'America/New_York',
    forceCreate: boolean = false
  ): Promise<{ microcycle: Microcycle; progress: ProgressInfo; wasCreated: boolean }> {
    // Calculate progress for the target date
    const progress = await this.getProgressForDate(plan, targetDate, timezone);
    if (!progress) {
      throw new Error(`Could not calculate progress for date ${targetDate}`);
    }

    // If microcycle already exists and not forcing creation, return it
    if (progress.microcycle && !forceCreate) {
      return { microcycle: progress.microcycle, progress, wasCreated: false };
    }

    // Microcycle doesn't exist (or forceCreate=true) - create it using MicrocycleService
    const microcycle = await this.microcycleService.createMicrocycleFromProgress(
      userId,
      plan,
      progress
    );

    // Update progress with new microcycle
    const updatedProgress = { ...progress, microcycle };

    return { microcycle, progress: updatedProgress, wasCreated: true };
  }
}

// Export singleton instance
export const progressService = ProgressService.getInstance();
