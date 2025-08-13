import { DateTime } from 'luxon';
import { FitnessPlanRepository } from '@/server/repositories/fitnessPlanRepository';
import { MicrocycleRepository } from '@/server/repositories/microcycleRepository';
import { Microcycle, MicrocyclePattern } from '@/server/models/microcycle';
import { MesocycleOverview } from '@/server/models/fitnessPlan';
import { UserWithProfile } from '@/server/models/userModel';

export interface ProgressInfo {
  mesocycleIndex: number;
  microcycleWeek: number;
  mesocycle: MesocycleOverview;
  dayOfWeek: number;
  cycleStartDate: Date | null;
}

export class ProgressService {
  constructor(
    private fitnessPlanRepo: FitnessPlanRepository,
    private microcycleRepo: MicrocycleRepository
  ) {}

  async getCurrentProgress(userId: string): Promise<ProgressInfo | null> {
    const plan = await this.fitnessPlanRepo.getCurrentPlan(userId);
    
    if (!plan || !plan.mesocycles || plan.mesocycles.length === 0) {
      return null;
    }

    const mesocycleIndex = plan.currentMesocycleIndex ?? 0;
    const microcycleWeek = plan.currentMicrocycleWeek ?? 1;
    
    // Ensure mesocycleIndex is within bounds
    if (mesocycleIndex >= plan.mesocycles.length) {
      console.error(`Invalid mesocycle index ${mesocycleIndex} for plan with ${plan.mesocycles.length} mesocycles`);
      return null;
    }

    const mesocycle = plan.mesocycles[mesocycleIndex];
    const dayOfWeek = this.calculateDayOfWeek(plan.cycleStartDate as Date | null);

    return {
      mesocycleIndex,
      microcycleWeek,
      mesocycle,
      dayOfWeek,
      cycleStartDate: plan.cycleStartDate as Date | null,
    };
  }

  async getCurrentOrCreateMicrocycle(user: UserWithProfile): Promise<Microcycle | null> {
    const plan = await this.fitnessPlanRepo.getCurrentPlan(user.id);
    if (!plan) {
      console.log(`No fitness plan found for user ${user.id}`);
      return null;
    }

    const progress = await this.getCurrentProgress(user.id);
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
      // Generate new pattern for the week
      // For now, we'll create a basic pattern - in Phase 3 we'll integrate with the AI agent
      const pattern = await this.generateBasicPattern(
        progress.mesocycle,
        progress.microcycleWeek,
        plan.programType
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
    const progress = await this.getCurrentProgress(userId);
    if (!progress) {
      throw new Error(`No progress found for user ${userId}`);
    }

    const plan = await this.fitnessPlanRepo.getCurrentPlan(userId);
    if (!plan) {
      throw new Error(`No fitness plan found for user ${userId}`);
    }

    const currentMesocycle = progress.mesocycle;

    if (progress.microcycleWeek >= currentMesocycle.weeks) {
      // Move to next mesocycle
      const nextMesocycleIndex = progress.mesocycleIndex + 1;
      
      if (nextMesocycleIndex >= plan.mesocycles.length) {
        // Completed all mesocycles, restart from beginning
        await this.fitnessPlanRepo.updateProgress(userId, {
          currentMesocycleIndex: 0,
          currentMicrocycleWeek: 1,
          cycleStartDate: new Date(),
        });
        console.log(`User ${userId} completed all mesocycles, restarting from beginning`);
      } else {
        await this.fitnessPlanRepo.updateProgress(userId, {
          currentMesocycleIndex: nextMesocycleIndex,
          currentMicrocycleWeek: 1,
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

    const progress = await this.getCurrentProgress(userId);
    if (!progress) {
      throw new Error(`No progress found for user ${userId}`);
    }

    const nextMesocycleIndex = progress.mesocycleIndex + 1;
    
    if (nextMesocycleIndex >= plan.mesocycles.length) {
      // Completed all mesocycles, restart from beginning
      await this.fitnessPlanRepo.updateProgress(userId, {
        currentMesocycleIndex: 0,
        currentMicrocycleWeek: 1,
        cycleStartDate: new Date(),
      });
    } else {
      await this.fitnessPlanRepo.updateProgress(userId, {
        currentMesocycleIndex: nextMesocycleIndex,
        currentMicrocycleWeek: 1,
        cycleStartDate: new Date(),
      });
    }

    // Deactivate previous microcycles
    await this.microcycleRepo.deactivatePreviousMicrocycles(userId);
  }

  async resetProgress(userId: string): Promise<void> {
    await this.fitnessPlanRepo.updateProgress(userId, {
      currentMesocycleIndex: 0,
      currentMicrocycleWeek: 1,
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

  private async generateBasicPattern(
    mesocycle: MesocycleOverview,
    weekNumber: number,
    programType: string
  ): Promise<MicrocyclePattern> {
    // This is a temporary basic pattern generator
    // In Phase 3, this will be replaced with an AI agent
    
    const isDeloadWeek = mesocycle.deload && weekNumber === mesocycle.weeks;
    
    // Basic patterns based on program type
    const patterns: Record<string, MicrocyclePattern> = {
      strength: {
        weekIndex: weekNumber,
        days: [
          { day: 'MONDAY', theme: 'Lower Power', load: isDeloadWeek ? 'light' : 'heavy' },
          { day: 'TUESDAY', theme: 'Upper Push', load: isDeloadWeek ? 'light' : 'moderate' },
          { day: 'WEDNESDAY', theme: 'Rest' },
          { day: 'THURSDAY', theme: 'Lower Volume', load: isDeloadWeek ? 'light' : 'moderate' },
          { day: 'FRIDAY', theme: 'Upper Pull', load: isDeloadWeek ? 'light' : 'moderate' },
          { day: 'SATURDAY', theme: 'Full Body', load: 'light' },
          { day: 'SUNDAY', theme: 'Rest' },
        ],
      },
      endurance: {
        weekIndex: weekNumber,
        days: [
          { day: 'MONDAY', theme: 'Easy Run', load: 'light' },
          { day: 'TUESDAY', theme: 'Interval Training', load: isDeloadWeek ? 'light' : 'heavy' },
          { day: 'WEDNESDAY', theme: 'Recovery', load: 'light' },
          { day: 'THURSDAY', theme: 'Tempo Run', load: isDeloadWeek ? 'light' : 'moderate' },
          { day: 'FRIDAY', theme: 'Rest' },
          { day: 'SATURDAY', theme: 'Long Run', load: isDeloadWeek ? 'light' : 'moderate' },
          { day: 'SUNDAY', theme: 'Recovery or Rest' },
        ],
      },
      hybrid: {
        weekIndex: weekNumber,
        days: [
          { day: 'MONDAY', theme: 'Strength - Lower', load: isDeloadWeek ? 'light' : 'moderate' },
          { day: 'TUESDAY', theme: 'Cardio - Intervals', load: isDeloadWeek ? 'light' : 'heavy' },
          { day: 'WEDNESDAY', theme: 'Strength - Upper', load: isDeloadWeek ? 'light' : 'moderate' },
          { day: 'THURSDAY', theme: 'Cardio - Steady State', load: 'light' },
          { day: 'FRIDAY', theme: 'Rest' },
          { day: 'SATURDAY', theme: 'Full Body Circuit', load: isDeloadWeek ? 'light' : 'moderate' },
          { day: 'SUNDAY', theme: 'Active Recovery' },
        ],
      },
    };

    // Default pattern if program type not found
    const defaultPattern: MicrocyclePattern = {
      weekIndex: weekNumber,
      days: [
        { day: 'MONDAY', theme: 'Training Day 1', load: isDeloadWeek ? 'light' : 'moderate' },
        { day: 'TUESDAY', theme: 'Training Day 2', load: isDeloadWeek ? 'light' : 'moderate' },
        { day: 'WEDNESDAY', theme: 'Rest or Active Recovery' },
        { day: 'THURSDAY', theme: 'Training Day 3', load: isDeloadWeek ? 'light' : 'moderate' },
        { day: 'FRIDAY', theme: 'Training Day 4', load: isDeloadWeek ? 'light' : 'moderate' },
        { day: 'SATURDAY', theme: 'Optional Training', load: 'light' },
        { day: 'SUNDAY', theme: 'Rest' },
      ],
    };

    return patterns[programType] || defaultPattern;
  }
}