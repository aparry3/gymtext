import { FitnessPlan, Mesocycle } from '../../models/fitnessPlan';
import {
  parseDate,
  now,
  startOfWeek,
  endOfWeek,
  diffInWeeks,
  getWeekday,
} from '@/shared/utils/date';

export interface ProgressInfo {
  mesocycleIndex: number;       // Which mesocycle (0-based)
  microcycleWeek: number;        // Which week within mesocycle (0-based)
  mesocycle: Mesocycle;          // The mesocycle object
  dayOfWeek: number;             // Day of week (1-7, Luxon format: 1=Mon, 7=Sun)
  absoluteWeek: number;          // Weeks since plan start
  weekStartDate: Date;           // Start of current week
  weekEndDate: Date;             // End of current week
}

export class ProgressService {
  private static instance: ProgressService;

  private constructor() {
    // Singleton - no dependencies needed for pure date calculations
  }

  public static getInstance(): ProgressService {
    if (!ProgressService.instance) {
      ProgressService.instance = new ProgressService();
    }
    return ProgressService.instance;
  }

  /**
   * Calculate progress for a specific date based on the fitness plan
   * This is a pure function - no side effects, no database calls
   */
  public getProgressForDate(
    plan: FitnessPlan,
    targetDate: Date,
    timezone: string = 'America/New_York'
  ): ProgressInfo | null {
    if (!plan || !plan.mesocycles || plan.mesocycles.length === 0) {
      return null;
    }

    // Parse the plan start date
    const planStartDate = parseDate(plan.startDate);
    if (!planStartDate) {
      return null;
    }

    // Calculate absolute week number since plan start
    const planStart = startOfWeek(planStartDate, timezone);
    const targetWeekStart = startOfWeek(targetDate, timezone);

    const absoluteWeek = diffInWeeks(targetWeekStart, planStart, timezone);

    // If before plan start, return null
    if (absoluteWeek < 0) {
      return null;
    }

    // Find which mesocycle and week we're in
    let weekCounter = 0;
    for (let mesocycleIndex = 0; mesocycleIndex < plan.mesocycles.length; mesocycleIndex++) {
      const mesocycle = plan.mesocycles[mesocycleIndex] as Mesocycle;
      const mesocycleEndWeek = weekCounter + mesocycle.durationWeeks;

      if (absoluteWeek < mesocycleEndWeek) {
        // Found the mesocycle!
        const microcycleWeek = absoluteWeek - weekCounter;
        const dayOfWeek = getWeekday(targetDate, timezone);
        const weekStart = startOfWeek(targetDate, timezone);
        const weekEnd = endOfWeek(targetDate, timezone);

        return {
          mesocycleIndex,
          microcycleWeek,
          mesocycle,
          dayOfWeek,
          absoluteWeek,
          weekStartDate: weekStart,
          weekEndDate: weekEnd,
        };
      }

      weekCounter = mesocycleEndWeek;
    }

    // We're past the end of the plan - loop back to the beginning
    const totalWeeks = plan.mesocycles.reduce((sum, m) => sum + (m as Mesocycle).durationWeeks, 0);
    const loopedWeek = absoluteWeek % totalWeeks;

    // Find mesocycle again using looped week
    weekCounter = 0;
    for (let mesocycleIndex = 0; mesocycleIndex < plan.mesocycles.length; mesocycleIndex++) {
      const mesocycle = plan.mesocycles[mesocycleIndex] as Mesocycle;
      const mesocycleEndWeek = weekCounter + mesocycle.durationWeeks;

      if (loopedWeek < mesocycleEndWeek) {
        const microcycleWeek = loopedWeek - weekCounter;
        const dayOfWeek = getWeekday(targetDate, timezone);
        const weekStart = startOfWeek(targetDate, timezone);
        const weekEnd = endOfWeek(targetDate, timezone);

        return {
          mesocycleIndex,
          microcycleWeek,
          mesocycle,
          dayOfWeek,
          absoluteWeek,
          weekStartDate: weekStart,
          weekEndDate: weekEnd,
        };
      }

      weekCounter = mesocycleEndWeek;
    }

    return null;
  }

  /**
   * Get progress for the current date in the user's timezone
   */
  public getCurrentProgress(
    plan: FitnessPlan,
    timezone: string = 'America/New_York'
  ): ProgressInfo | null {
    const currentDate = now(timezone).toJSDate();
    return this.getProgressForDate(plan, currentDate, timezone);
  }
}

// Export singleton instance
export const progressService = ProgressService.getInstance();
