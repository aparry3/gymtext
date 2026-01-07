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
import type { RepositoryContainer } from '../../repositories/factory';
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
 */
export interface ProgressServiceInstance {
  getProgressForDate(plan: FitnessPlan, targetDate: Date, timezone?: string): Promise<ProgressInfo | null>;
  getCurrentProgress(plan: FitnessPlan, timezone?: string): Promise<ProgressInfo | null>;
  getOrCreateMicrocycleForDate(
    userId: string,
    plan: FitnessPlan,
    targetDate: Date,
    timezone?: string,
    forceCreate?: boolean
  ): Promise<{ microcycle: Microcycle; progress: ProgressInfo; wasCreated: boolean }>;
}

/**
 * Create a ProgressService instance with injected dependencies
 */
export function createProgressService(
  repos: RepositoryContainer,
  deps?: { microcycle?: MicrocycleServiceInstance }
): ProgressServiceInstance {
  // Lazy load microcycle service to avoid circular dependency
  let microcycleService: MicrocycleServiceInstance | null = deps?.microcycle ?? null;

  const getMicrocycleService = async (): Promise<MicrocycleServiceInstance> => {
    if (!microcycleService) {
      const { createServicesFromDb } = await import('../factory');
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
      let microcycle = await ms.getMicrocycleByDate(plan.clientId, targetDate);

      if (!microcycle) {
        microcycle = await ms.getMicrocycleByAbsoluteWeek(plan.clientId, absoluteWeek);
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

    async getOrCreateMicrocycleForDate(
      userId: string,
      plan: FitnessPlan,
      targetDate: Date,
      timezone: string = 'America/New_York',
      forceCreate: boolean = false
    ): Promise<{ microcycle: Microcycle; progress: ProgressInfo; wasCreated: boolean }> {
      const progress = await this.getProgressForDate(plan, targetDate, timezone);
      if (!progress) {
        throw new Error(`Could not calculate progress for date ${targetDate}`);
      }

      if (progress.microcycle && !forceCreate) {
        return { microcycle: progress.microcycle, progress, wasCreated: false };
      }

      const ms = await getMicrocycleService();
      const microcycle = await ms.createMicrocycleFromProgress(userId, plan, progress);
      const updatedProgress = { ...progress, microcycle };

      return { microcycle, progress: updatedProgress, wasCreated: true };
    },
  };
}

// =============================================================================
