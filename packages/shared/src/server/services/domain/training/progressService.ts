import { FitnessPlan } from '../../../models/fitnessPlan';
import { Microcycle } from '../../../models/microcycle';
import {
  parseDate,
  now,
  startOfWeek,
  endOfWeek,
  diffInWeeks,
  getWeekday,
} from '@/shared/utils/date';
import type { RepositoryContainer } from '../../../repositories/factory';
import type { MicrocycleServiceInstance } from './microcycleService';

/**
 * Simplified ProgressInfo without mesocycle layer
 */
export interface ProgressInfo {
  fitnessPlan: FitnessPlan;
  microcycle: Microcycle | null;
  absoluteWeek: number;
  dayOfWeek: number;
  weekStartDate: Date;
  weekEndDate: Date;
}

/**
 * ProgressServiceInstance interface
 *
 * Pure calculation service for determining training progress.
 * For microcycle creation/orchestration, use TrainingService.
 */
export interface ProgressServiceInstance {
  getProgressForDate(plan: FitnessPlan, targetDate: Date, timezone?: string): Promise<ProgressInfo | null>;
  getCurrentProgress(plan: FitnessPlan, timezone?: string): Promise<ProgressInfo | null>;
}

/**
 * Create a ProgressService instance
 *
 * This is a pure calculation service - no orchestration logic.
 * For creating microcycles, use TrainingService.prepareMicrocycleForDate().
 */
export function createProgressService(
  repos: RepositoryContainer,
  deps?: { microcycle?: MicrocycleServiceInstance }
): ProgressServiceInstance {
  // Lazy load microcycle service for lookups
  let microcycleService: MicrocycleServiceInstance | null = deps?.microcycle ?? null;

  const getMicrocycleService = async (): Promise<MicrocycleServiceInstance> => {
    if (!microcycleService) {
      const { createServicesFromDb } = await import('../../factory');
      const { postgresDb } = await import('@/server/connections/postgres/postgres');
      const services = createServicesFromDb(postgresDb);
      microcycleService = services.microcycle;
    }
    return microcycleService;
  };

  return {
    async getProgressForDate(
      plan: FitnessPlan,
      targetDate: Date,
      timezone: string = 'America/New_York'
    ): Promise<ProgressInfo | null> {
      if (!plan || !plan.id) {
        return null;
      }

      const planStartDate = parseDate(plan.startDate);
      if (!planStartDate) {
        return null;
      }

      const planStart = startOfWeek(planStartDate, timezone);
      const targetWeekStart = startOfWeek(targetDate, timezone);
      const absoluteWeek = diffInWeeks(targetWeekStart, planStart, timezone) + 1;

      if (absoluteWeek < 1) {
        return null;
      }

      const ms = await getMicrocycleService();
      let microcycle = await ms.getMicrocycleByDate(plan.legacyClientId, targetDate);

      if (!microcycle) {
        const candidate = await ms.getMicrocycleByAbsoluteWeek(plan.legacyClientId, absoluteWeek);
        // Validate that the candidate microcycle belongs to the current plan's date range.
        // A microcycle is valid if its start date is on or after the plan's start week.
        // This prevents old microcycles from previous plans being reused for new plans.
        if (candidate && new Date(candidate.startDate) >= planStart) {
          microcycle = candidate;
        }
        // If candidate is invalid (from old plan), microcycle stays null
        // and trainingService.prepareMicrocycleForDate() will create a new one
      }

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
    },

    async getCurrentProgress(
      plan: FitnessPlan,
      timezone: string = 'America/New_York'
    ): Promise<ProgressInfo | null> {
      const currentDate = now(timezone).toJSDate();
      return await this.getProgressForDate(plan, currentDate, timezone);
    },
  };
}

// =============================================================================
