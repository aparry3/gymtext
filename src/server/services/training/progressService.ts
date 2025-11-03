import { DateTime } from 'luxon';
import { FitnessPlanRepository } from '@/server/repositories/fitnessPlanRepository';
import { MicrocycleRepository } from '@/server/repositories/microcycleRepository';
import { Microcycle } from '../../models/microcycle';
import { MicrocyclePattern } from '../../models/microcycle/schema';
import { FitnessPlan, Mesocycle } from '../../models/fitnessPlan';
import { UserWithProfile } from '../../models/userModel';
import { createMicrocyclePatternAgent, generateMicrocyclePattern } from '../../agents/fitnessPlan/microcyclePattern/chain';
import { postgresDb } from '@/server/connections/postgres/postgres';

export interface ProgressInfo {
  mesocycleIndex: number;
  microcycleWeek: number;
  mesocycle: Mesocycle;
  dayOfWeek: number;
  cycleStartDate: Date | null;
}

export class ProgressService {
  private static instance: ProgressService;
  private fitnessPlanRepo: FitnessPlanRepository;
  private microcycleRepo: MicrocycleRepository;

  private constructor() {
    this.fitnessPlanRepo = new FitnessPlanRepository();
    this.microcycleRepo = new MicrocycleRepository(postgresDb);
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
    };
  }

  /**
   * Get the current active microcycle for a user without creating one
   */
  async getCurrentMicrocycle(userId: string): Promise<Microcycle | null> {
    return await this.microcycleRepo.getCurrentMicrocycle(userId);
  }

  async getCurrentOrCreateMicrocycle(user: UserWithProfile): Promise<Microcycle | null> {
    let plan = await this.fitnessPlanRepo.getCurrentPlan(user.id);
    if (!plan) {
      console.log(`No fitness plan found for user ${user.id}`);
      return null;
    }

    // Calculate the current calendar week dates
    const { startDate: currentWeekStart } = this.calculateWeekDates(user.timezone);

    // Check if we need to advance the week automatically
    let currentMicrocycle = await this.microcycleRepo.getCurrentMicrocycle(user.id);
    if (currentMicrocycle) {
      // Normalize dates to start of day for comparison
      const normalizedCurrentWeekStart = new Date(currentWeekStart);
      normalizedCurrentWeekStart.setHours(0, 0, 0, 0);

      // Handle multiple week advances if user hasn't used the app in a while
      let weeksAdvanced = 0;
      const maxWeeksToAdvance = 12; // Safety limit to prevent infinite loops

      while (weeksAdvanced < maxWeeksToAdvance) {
        const currentMicrocycleEnd = new Date(currentMicrocycle.endDate);
        currentMicrocycleEnd.setHours(0, 0, 0, 0);

        // If the current week starts after the microcycle's end date, we need to advance
        if (normalizedCurrentWeekStart > currentMicrocycleEnd) {
          console.log(`[AUTO-ADVANCE] Current week (${normalizedCurrentWeekStart.toISOString()}) is after microcycle end (${currentMicrocycleEnd.toISOString()}), advancing week ${weeksAdvanced + 1} for user ${user.id}`);
          await this.advanceWeek(user.id);
          weeksAdvanced++;

          // Refresh the plan and microcycle after advancing
          plan = await this.fitnessPlanRepo.getCurrentPlan(user.id);
          if (!plan) {
            console.log(`No fitness plan found after advancing for user ${user.id}`);
            return null;
          }

          // Get the new current microcycle to check if we need to advance again
          currentMicrocycle = await this.microcycleRepo.getCurrentMicrocycle(user.id);
          if (!currentMicrocycle) {
            // No more microcycles to check, break out
            break;
          }
        } else {
          // Current microcycle is still valid for this week
          break;
        }
      }

      if (weeksAdvanced > 0) {
        console.log(`[AUTO-ADVANCE] Advanced ${weeksAdvanced} week(s) for user ${user.id}`);
      }
    }

    const progress = await this.getCurrentProgress(plan);
    if (!progress) {
      console.log(`No progress info found for user ${user.id}`);
      return null;
    }

    // Check if microcycle exists for current week
    let microcycle = await this.microcycleRepo.getMicrocycleByWeek(
      user.id,
      plan.id!,
      progress.mesocycleIndex,
      progress.microcycleWeek
    );

    if (!microcycle) {
      // Generate new pattern for the week using AI agent
      const pattern = await this.generateMicrocyclePattern(
        progress.mesocycle,
        progress.microcycleWeek,
        plan.programType,
        plan.notes
      );

      // Calculate week start and end dates
      const { startDate, endDate } = this.calculateWeekDates(user.timezone);

      // Deactivate previous microcycles
      await this.microcycleRepo.deactivatePreviousMicrocycles(user.id);

      // Create new microcycle
      microcycle = await this.microcycleRepo.createMicrocycle({
        userId: user.id,
        fitnessPlanId: plan.id!,
        mesocycleIndex: progress.mesocycleIndex,
        weekNumber: progress.microcycleWeek,
        pattern,
        startDate,
        endDate,
        isActive: true,
      });

      console.log(`Created new microcycle for user ${user.id}, week ${progress.microcycleWeek}`);
    }

    return microcycle;
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

  private async generateMicrocyclePattern(
    mesocycle: Mesocycle,
    weekNumber: number,
    programType: string,
    notes?: string | null
  ): Promise<MicrocyclePattern> {
    try {
      // Use AI agent to generate pattern (weekNumber is now 0-based)
      const agent = createMicrocyclePatternAgent();
      const pattern = await agent.invoke({
        mesocycle,
        weekNumber, // Agent expects 1-based week number
        programType,
        notes
      });

      console.log(`Generated AI pattern for week ${weekNumber} of ${mesocycle.name}`);
      return pattern;
    } catch (error) {
      console.error('Failed to generate pattern with AI agent, using fallback:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const progressService = ProgressService.getInstance();