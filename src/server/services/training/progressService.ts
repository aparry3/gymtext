import { DateTime } from 'luxon';
import { FitnessPlanRepository } from '@/server/repositories/fitnessPlanRepository';
import { MicrocycleRepository } from '@/server/repositories/microcycleRepository';
import { Microcycle } from '../../models/microcycle';
import { FitnessPlan, Mesocycle } from '../../models/fitnessPlan';
import { UserWithProfile } from '../../models/userModel';
import { MicrocycleService } from './microcycleService';
import { postgresDb } from '@/server/connections/postgres/postgres';

export interface ProgressInfo {
  mesocycleIndex: number;
  microcycleWeek: number;
  mesocycle: Mesocycle;
  dayOfWeek: number;
  cycleStartDate: Date | null;
  microcycle: Microcycle | null;
  wasAdvanced: boolean;
  weeksAdvanced: number;
  isNewMesocycle: boolean;
  microcycleCreated: boolean;
}

export class ProgressService {
  private static instance: ProgressService;
  private fitnessPlanRepo: FitnessPlanRepository;
  private microcycleRepo: MicrocycleRepository;
  private _microcycleService?: MicrocycleService;

  private constructor() {
    this.fitnessPlanRepo = new FitnessPlanRepository();
    this.microcycleRepo = new MicrocycleRepository(postgresDb);
  }

  private get microcycleService(): MicrocycleService {
    if (!this._microcycleService) {
      this._microcycleService = MicrocycleService.getInstance();
    }
    return this._microcycleService;
  }

  public static getInstance(): ProgressService {
    if (!ProgressService.instance) {
      ProgressService.instance = new ProgressService();
    }
    return ProgressService.instance;
  }

  async getCurrentProgress(plan: FitnessPlan): Promise<ProgressInfo | null> {
    if (!plan || !plan.mesocycles || plan.mesocycles.length === 0) {
      return null;
    }

    const mesocycleIndex = plan.currentMesocycleIndex ?? 0;
    const microcycleWeek = plan.currentMicrocycleWeek ?? 0; // 0-based to match mesocycleIndex

    // Ensure mesocycleIndex is within bounds
    if (mesocycleIndex >= plan.mesocycles.length) {
      console.error(`Invalid mesocycle index ${mesocycleIndex} for plan with ${plan.mesocycles.length} mesocycles`);
      return null;
    }

    const mesocycle = plan.mesocycles[mesocycleIndex] as Mesocycle;
    const dayOfWeek = this.calculateDayOfWeek(plan.cycleStartDate as Date | null);

    return {
      mesocycleIndex,
      microcycleWeek,
      mesocycle,
      dayOfWeek,
      cycleStartDate: plan.cycleStartDate as Date | null,
      microcycle: null,
      wasAdvanced: false,
      weeksAdvanced: 0,
      isNewMesocycle: false,
      microcycleCreated: false,
    };
  }

  /**
   * Ensures the user's progress is up-to-date with the current calendar date
   * Auto-advances weeks if needed and gets/creates the current microcycle
   * This method has side effects: it may update progress tracking and create microcycles
   */
  async ensureUpToDateProgress(
    plan: FitnessPlan,
    user: UserWithProfile
  ): Promise<ProgressInfo | null> {
    if (!plan || !plan.mesocycles || plan.mesocycles.length === 0) {
      console.log(`No fitness plan found for user ${user.id}`);
      return null;
    }

    // Check if we need to auto-advance weeks
    const currentMicrocycle = await this.microcycleService.getActiveMicrocycle(user.id);
    let weeksAdvanced = 0;
    let enteredNewMesocycle = false;

    if (currentMicrocycle) {
      const { startDate: currentWeekStart } = this.calculateWeekDates(user.timezone);
      const normalizedCurrentWeekStart = new Date(currentWeekStart);
      normalizedCurrentWeekStart.setHours(0, 0, 0, 0);

      const currentMicrocycleEnd = new Date(currentMicrocycle.endDate);
      currentMicrocycleEnd.setHours(0, 0, 0, 0);

      // If current week is after microcycle end, perform auto-advancement
      if (normalizedCurrentWeekStart > currentMicrocycleEnd) {
        const advancementResult = await this.performAutoAdvancement(user.id, user.timezone);
        weeksAdvanced = advancementResult.weeksAdvanced;
        enteredNewMesocycle = advancementResult.isNewMesocycle;

        // Refresh plan after advancement
        plan = await this.fitnessPlanRepo.getCurrentPlan(user.id) || plan;
      }
    }

    // Get current progress (now reflects any advancements)
    const progress = await this.getCurrentProgress(plan);
    if (!progress) {
      console.log(`No progress info found for user ${user.id}`);
      return null;
    }

    // Get or create current microcycle
    const { microcycle, wasCreated } = await this.microcycleService.getOrCreateActiveMicrocycle(user, progress, plan);

    // Return enriched progress info
    return {
      ...progress,
      microcycle,
      wasAdvanced: weeksAdvanced > 0,
      weeksAdvanced,
      isNewMesocycle: enteredNewMesocycle,
      microcycleCreated: wasCreated,
    };
  }


  async advanceWeek(userId: string): Promise<void> {
    const plan = await this.fitnessPlanRepo.getCurrentPlan(userId);
    if (!plan) {
      throw new Error(`No fitness plan found for user ${userId}`);
    }

    const progress = await this.getCurrentProgress(plan);
    if (!progress) {
      throw new Error(`No progress found for user ${userId}`);
    }


    const currentMesocycle = progress.mesocycle;
    const weeks = currentMesocycle.durationWeeks;

    if (progress.microcycleWeek >= weeks - 1) {
      // Move to next mesocycle (microcycleWeek is 0-based, so last week is weeks - 1)
      const nextMesocycleIndex = progress.mesocycleIndex + 1;

      if (nextMesocycleIndex >= plan.mesocycles.length) {
        // Completed all mesocycles, restart from beginning
        await this.fitnessPlanRepo.updateProgress(userId, {
          currentMesocycleIndex: 0,
          currentMicrocycleWeek: 0,
          cycleStartDate: new Date(),
        });
        console.log(`User ${userId} completed all mesocycles, restarting from beginning`);
      } else {
        await this.fitnessPlanRepo.updateProgress(userId, {
          currentMesocycleIndex: nextMesocycleIndex,
          currentMicrocycleWeek: 0,
          cycleStartDate: new Date(),
        });
        console.log(`User ${userId} advanced to mesocycle ${nextMesocycleIndex}`);
      }
    } else {
      // Just increment week within current mesocycle
      await this.fitnessPlanRepo.updateProgress(userId, {
        currentMicrocycleWeek: progress.microcycleWeek + 1,
      });
      console.log(`User ${userId} advanced to week ${progress.microcycleWeek + 1}`);
    }

    // Deactivate previous microcycles
    await this.microcycleRepo.deactivatePreviousMicrocycles(userId);
  }

  async advanceMesocycle(userId: string): Promise<void> {
    const plan = await this.fitnessPlanRepo.getCurrentPlan(userId);
    if (!plan) {
      throw new Error(`No fitness plan found for user ${userId}`);
    }

    const progress = await this.getCurrentProgress(plan);
    if (!progress) {
      throw new Error(`No progress found for user ${userId}`);
    }

    const nextMesocycleIndex = progress.mesocycleIndex + 1;
    
    if (nextMesocycleIndex >= plan.mesocycles.length) {
      // Completed all mesocycles, restart from beginning
      await this.fitnessPlanRepo.updateProgress(userId, {
        currentMesocycleIndex: 0,
        currentMicrocycleWeek: 0,
        cycleStartDate: new Date(),
      });
    } else {
      await this.fitnessPlanRepo.updateProgress(userId, {
        currentMesocycleIndex: nextMesocycleIndex,
        currentMicrocycleWeek: 0,
        cycleStartDate: new Date(),
      });
    }

    // Deactivate previous microcycles
    await this.microcycleRepo.deactivatePreviousMicrocycles(userId);
  }

  async resetProgress(userId: string): Promise<void> {
    await this.fitnessPlanRepo.updateProgress(userId, {
      currentMesocycleIndex: 0,
      currentMicrocycleWeek: 0,
      cycleStartDate: new Date(),
    });

    // Deactivate all previous microcycles
    await this.microcycleRepo.deactivatePreviousMicrocycles(userId);

    console.log(`Reset progress for user ${userId}`);
  }


  /**
   * Performs automatic week advancement, handling multiple weeks if needed
   * Returns the total number of weeks advanced and whether a new mesocycle was entered
   */
  private async performAutoAdvancement(
    userId: string,
    timezone: string
  ): Promise<{ weeksAdvanced: number; isNewMesocycle: boolean }> {
    const { startDate: currentWeekStart } = this.calculateWeekDates(timezone);
    const normalizedCurrentWeekStart = new Date(currentWeekStart);
    normalizedCurrentWeekStart.setHours(0, 0, 0, 0);

    let weeksAdvanced = 0;
    let enteredNewMesocycle = false;
    const maxWeeksToAdvance = 12; // Safety limit

    while (weeksAdvanced < maxWeeksToAdvance) {
      const currentMicrocycle = await this.microcycleService.getActiveMicrocycle(userId);
      if (!currentMicrocycle) break;

      const currentMicrocycleEnd = new Date(currentMicrocycle.endDate);
      currentMicrocycleEnd.setHours(0, 0, 0, 0);

      if (normalizedCurrentWeekStart > currentMicrocycleEnd) {
        console.log(`[AUTO-ADVANCE] Current week (${normalizedCurrentWeekStart.toISOString()}) is after microcycle end (${currentMicrocycleEnd.toISOString()}), advancing week ${weeksAdvanced + 1} for user ${userId}`);

        // Check if this advance will move to a new mesocycle
        const plan = await this.fitnessPlanRepo.getCurrentPlan(userId);
        if (plan) {
          const progress = await this.getCurrentProgress(plan);
          if (progress) {
            const weeks = progress.mesocycle.durationWeeks;
            if (progress.microcycleWeek >= weeks - 1) {
              enteredNewMesocycle = true;
            }
          }
        }

        await this.advanceWeek(userId);
        weeksAdvanced++;
      } else {
        break;
      }
    }

    if (weeksAdvanced > 0) {
      console.log(`[AUTO-ADVANCE] Advanced ${weeksAdvanced} week(s) for user ${userId}`);
    }

    return { weeksAdvanced, isNewMesocycle: enteredNewMesocycle };
  }

  private calculateDayOfWeek(cycleStartDate: Date | null): number {
    if (!cycleStartDate) {
      // If no cycle start date, assume we're on day 1
      return 1;
    }

    const start = DateTime.fromJSDate(cycleStartDate);
    const now = DateTime.now();
    const daysSinceStart = Math.floor(now.diff(start, 'days').days);
    
    // Return day of week (1-7), cycling through weeks
    return (daysSinceStart % 7) + 1;
  }

  private calculateWeekDates(timezone: string = 'America/New_York'): { startDate: Date; endDate: Date } {
    const now = DateTime.now().setZone(timezone);
    const startOfWeek = now.startOf('week');
    const endOfWeek = now.endOf('week');

    return {
      startDate: startOfWeek.toJSDate(),
      endDate: endOfWeek.toJSDate(),
    };
  }
}

// Export singleton instance
export const progressService = ProgressService.getInstance();