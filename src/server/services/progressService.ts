import { DateTime } from 'luxon';
import { FitnessPlanRepository } from '@/server/repositories/fitnessPlanRepository';
import { MicrocycleRepository } from '@/server/repositories/microcycleRepository';
import { Microcycle, MicrocyclePattern } from '@/server/models/microcycle';
import { MesocycleOverview } from '@/server/models/fitnessPlan';
import { UserWithProfile } from '@/server/models/userModel';
import { generateMicrocyclePattern } from '@/server/agents/fitnessPlan/microcyclePattern/chain';

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

  private async generateMicrocyclePattern(
    mesocycle: MesocycleOverview,
    weekNumber: number,
    programType: string,
    notes?: string | null
  ): Promise<MicrocyclePattern> {
    try {
      // Use AI agent to generate pattern
      const pattern = await generateMicrocyclePattern({
        mesocycle,
        weekNumber,
        programType,
        notes
      });
      
      console.log(`Generated AI pattern for week ${weekNumber} of ${mesocycle.name}`);
      return pattern;
    } catch (error) {
      console.error('Failed to generate pattern with AI agent, using fallback:', error);
      
      // Fallback to basic pattern if AI fails
      return this.generateFallbackPattern(mesocycle, weekNumber);
    }
  }

  private generateFallbackPattern(
    mesocycle: MesocycleOverview,
    weekNumber: number
  ): MicrocyclePattern {
    const isDeloadWeek = mesocycle.deload && weekNumber === mesocycle.weeks;
    const load = isDeloadWeek ? 'light' : 'moderate';
    
    // Simple fallback pattern
    return {
      weekIndex: weekNumber,
      days: [
        { day: 'MONDAY', theme: 'Training Day 1', load },
        { day: 'TUESDAY', theme: 'Training Day 2', load },
        { day: 'WEDNESDAY', theme: 'Rest' },
        { day: 'THURSDAY', theme: 'Training Day 3', load },
        { day: 'FRIDAY', theme: 'Training Day 4', load },
        { day: 'SATURDAY', theme: 'Active Recovery', load: 'light' },
        { day: 'SUNDAY', theme: 'Rest' },
      ],
    };
  }
}