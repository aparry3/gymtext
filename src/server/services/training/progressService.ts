import { FitnessPlan } from '../../models/fitnessPlan';
import { Mesocycle } from '../../models/mesocycle';
import { Microcycle } from '../../models/microcycle';
import {
  parseDate,
  now,
  startOfWeek,
  endOfWeek,
  diffInWeeks,
  getWeekday,
} from '@/shared/utils/date';
import { MesocycleService } from './mesocycleService';
import { MicrocycleRepository } from '@/server/repositories/microcycleRepository';
import { postgresDb } from '@/server/connections/postgres/postgres';

export interface ProgressInfo {
  mesocycle: Mesocycle;              // The mesocycle object (from DB)
  microcycle: Microcycle | null;     // The microcycle if exists, else null
  microcycleOverview: string | null; // Overview from mesocycle.microcycles[index] if microcycle doesn't exist
  mesocycleIndex: number;            // Which mesocycle (0-based)
  microcycleIndex: number;           // Which week within mesocycle (0-based)
  absoluteWeek: number;              // Weeks since plan start
  dayOfWeek: number;                 // Day of week (1-7, Luxon format: 1=Mon, 7=Sun)
  weekStartDate: Date;               // Start of current week
  weekEndDate: Date;                 // End of current week
}

export class ProgressService {
  private static instance: ProgressService;
  private mesocycleService: MesocycleService;
  private microcycleRepo: MicrocycleRepository;

  private constructor() {
    // Singleton - no dependencies needed for pure date calculations
    this.mesocycleService = MesocycleService.getInstance();
    this.microcycleRepo = new MicrocycleRepository(postgresDb);
  }
  public static getInstance(): ProgressService {
    if (!ProgressService.instance) {
      ProgressService.instance = new ProgressService();
    }
    return ProgressService.instance;
  }

  /**
   * Calculate progress for a specific date based on the fitness plan
   * Uses efficient DB queries to find mesocycle and microcycle
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

    // Calculate absolute week number since plan start
    const planStart = startOfWeek(planStartDate, timezone);
    const targetWeekStart = startOfWeek(targetDate, timezone);

    let absoluteWeek = diffInWeeks(targetWeekStart, planStart, timezone);

    // If before plan start, return null
    if (absoluteWeek < 0) {
      return null;
    }

    // Handle looping if past end of plan
    // Get all mesocycles to calculate total weeks for looping
    const allMesocycles = await this.mesocycleService.getMesocyclesByPlanId(plan.id);
    const totalWeeks = allMesocycles.reduce((sum, m) => sum + m.durationWeeks, 0);

    if (totalWeeks === 0) {
      console.error(`No mesocycles with valid duration found for plan ${plan.id}`);
      return null;
    }

    // If past end of plan, loop back
    if (absoluteWeek >= totalWeeks) {
      absoluteWeek = absoluteWeek % totalWeeks;
    }

    // Query mesocycle by absolute week using efficient DB query
    const mesocycle = await this.mesocycleService.getMesocycleByWeek(plan.id, absoluteWeek);

    if (!mesocycle) {
      console.error(`Mesocycle not found for plan ${plan.id}, week ${absoluteWeek}`);
      return null;
    }

    // Calculate microcycle index within this mesocycle
    const microcycleIndex = absoluteWeek - mesocycle.startWeek;

    // Query for existing microcycle by date
    const microcycle = await this.microcycleRepo.getMicrocycleByDate(
      plan.clientId,
      plan.id,
      targetDate
    );

    // Get microcycle overview from mesocycle's microcycles array if microcycle doesn't exist
    const microcycleOverview = microcycle
      ? null
      : (mesocycle.microcycles[microcycleIndex] || null);

    // Calculate date-related fields
    const dayOfWeek = getWeekday(targetDate, timezone);
    const weekStart = startOfWeek(targetDate, timezone);
    const weekEnd = endOfWeek(targetDate, timezone);

    return {
      mesocycle,
      microcycle,
      microcycleOverview,
      mesocycleIndex: mesocycle.mesocycleIndex,
      microcycleIndex,
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
}

// Export singleton instance
export const progressService = ProgressService.getInstance();
