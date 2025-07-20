/**
 * Domain model for FitnessPlan
 * Represents a complete fitness plan for a user
 */
export class FitnessPlan {
  constructor(
    public readonly id: string,
    public readonly clientId: string,
    public readonly programType: ProgramType,
    public readonly overview: string | null,
    public readonly goalStatement: string | null,
    public readonly startDate: Date,
    public readonly macrocycles: Macrocycle[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Get the total duration of the plan in weeks
   */
  getTotalWeeks(): number {
    return this.macrocycles.reduce((total, macro) => total + macro.lengthWeeks, 0);
  }

  /**
   * Get the end date of the plan
   */
  getEndDate(): Date {
    const totalWeeks = this.getTotalWeeks();
    const endDate = new Date(this.startDate);
    endDate.setDate(endDate.getDate() + (totalWeeks * 7));
    return endDate;
  }

  /**
   * Check if the plan is currently active
   */
  isActive(currentDate: Date = new Date()): boolean {
    return currentDate >= this.startDate && currentDate <= this.getEndDate();
  }

  /**
   * Get the current macrocycle based on the date
   */
  getCurrentMacrocycle(currentDate: Date = new Date()): Macrocycle | null {
    let weeksSinceStart = Math.floor((currentDate.getTime() - this.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    for (const macrocycle of this.macrocycles) {
      if (weeksSinceStart < macrocycle.lengthWeeks) {
        return macrocycle;
      }
      weeksSinceStart -= macrocycle.lengthWeeks;
    }
    
    return null;
  }
}

/**
 * Program type enumeration
 */
export enum ProgramType {
  ENDURANCE = 'endurance',
  STRENGTH = 'strength',
  SHRED = 'shred',
  HYBRID = 'hybrid',
  REHAB = 'rehab',
  OTHER = 'other'
}

/**
 * Macrocycle domain model
 */
export interface Macrocycle {
  id: string;
  startDate?: string;
  lengthWeeks: number;
  mesocycles: MesocyclePlan[];
}

/**
 * Mesocycle plan domain model
 */
export interface MesocyclePlan {
  id: string;
  phase: string;
  weeks: number;
  weeklyTargets: WeeklyTarget[];
}

/**
 * Weekly target domain model
 */
export interface WeeklyTarget {
  weekOffset: number;
  split?: string;
  totalMileage?: number;
  longRunMileage?: number;
  avgIntensityPct1RM?: number;
  totalSetsMainLifts?: number;
  deload?: boolean;
}

/**
 * Interface for creating a new fitness plan
 */
export interface CreateFitnessPlanInput {
  clientId: string;
  programType: ProgramType;
  overview?: string | null;
  goalStatement?: string | null;
  startDate: Date;
  macrocycles: Macrocycle[];
}